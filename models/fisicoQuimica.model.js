/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.model.js
Autor: Samuel Cerdas
Fecha: 31/07/2026
Modulo: Fisico Quimica
Descripcion:
Capa de datos del modulo de fisico quimica.
Trabaja con las tablas fisico_quimico y
fisico_quimico_detalle de la base de datos MySQL.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos.
*/

import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const TIPO_PH = 'ph';
const TIPO_SALINIDAD = 'salinidad';
const TIPO_TEMPERATURA = 'temperatura';
const TIPO_OXIGENO = 'oxigeno';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todas las lecturas fisico quimicas activas
    pertenecientes al grupo de datos recibido.

    Parametros:
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - Lista de lecturas fisico quimicas con sus mediciones.
    */
    const grupoNormalizado = normalizarGrupoDatos(
        grupoDatos
    );

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY id DESC
        `,
        [grupoNormalizado]
    );

    if (rows.length === 0) {
        return [];
    }

    const ids = rows.map(row => row.id);
    const detalles = await obtenerDetallesPorLecturas(
        pool,
        ids
    );

    return mapearLista(rows, detalles);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca una lectura fisico quimica activa por su ID y
    grupo de datos.

    Parametros:
    - id: Identificador de la lectura.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura encontrada con sus mediciones.
    - null si no existe o fue eliminada logicamente.
    */
    const grupoNormalizado = normalizarGrupoDatos(
        grupoDatos
    );

    return obtenerLecturaPorId(
        pool,
        id,
        grupoNormalizado
    );
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Crea una lectura principal o reutiliza la existente para
    el mismo estanque y fecha. Luego agrega las mediciones
    recibidas en fisico_quimico_detalle.

    Parametros:
    - dto: Objeto FisicoQuimicaDTO.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura creada o actualizada con sus mediciones.
    */
    const grupoNormalizado = normalizarGrupoDatos(
        grupoDatos
    );

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const existente =
            await obtenerLecturaParaRegistro(
                conexion,
                dto.estanqueId,
                dto.fecha,
                grupoNormalizado
            );

        let lecturaId;

        if (existente) {
            lecturaId = existente.id;

            await conexion.execute(
                `
                DELETE FROM fisico_quimico_detalle
                WHERE lectura_id = ?
                `,
                [lecturaId]
            );

            if (
                !Boolean(existente.activo) ||
                existente.deleted_at
            ) {
                await conexion.execute(
                    `
                    UPDATE fisico_quimico
                    SET
                        finca_id = ?,
                        creado_por_usuario_id = ?,
                        creado_por_colaborador_id = ?,
                        activo = TRUE,
                        deleted_at = NULL,
                        version = version + 1
                    WHERE id = ?
                    AND grupo_datos = ?
                    `,
                    [
                        dto.fincaId,
                        dto.creadoPorUsuarioId ?? null,
                        dto.creadoPorColaboradorId ?? null,
                        lecturaId,
                        grupoNormalizado
                    ]
                );
            }
        } else {
            const [result] = await conexion.execute(
                `
                INSERT INTO fisico_quimico (
                    grupo_datos,
                    finca_id,
                    estanque_id,
                    fecha_registro,
                    creado_por_usuario_id,
                    creado_por_colaborador_id
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    grupoNormalizado,
                    dto.fincaId,
                    dto.estanqueId,
                    dto.fecha,
                    dto.creadoPorUsuarioId ?? null,
                    dto.creadoPorColaboradorId ?? null
                ]
            );

            lecturaId = result.insertId;
        }

        await insertarDetalles(
            conexion,
            lecturaId,
            dto
        );

        await conexion.commit();

        const lectura = await obtenerLecturaPorId(
            conexion,
            lecturaId,
            grupoNormalizado
        );

        return lectura;
    } catch (err) {
        await conexion.rollback();
        throw err;
    } finally {
        conexion.release();
    }
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza los datos generales de una lectura, elimina
    sus mediciones anteriores e inserta las nuevas. Si la lectura
    estaba desactiva, la reactiva.

    Parametros:
    - id: Identificador de la lectura.
    - dto: Objeto FisicoQuimicaDTO.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura actualizada.
    - null si no existe.
    */
    const grupoNormalizado = normalizarGrupoDatos(
        grupoDatos
    );

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [rowsExistentes] = await conexion.execute(
            `
            SELECT id FROM fisico_quimico
            WHERE id = ? AND grupo_datos = ?
            LIMIT 1
            `,
            [id, grupoNormalizado]
        );

        if (rowsExistentes.length === 0) {
            await conexion.rollback();
            return null;
        }

        await conexion.execute(
            `
            UPDATE fisico_quimico
            SET
                finca_id = ?,
                estanque_id = ?,
                fecha_registro = ?,
                creado_por_usuario_id = ?,
                creado_por_colaborador_id = ?,
                activo = TRUE,
                deleted_at = NULL,
                version = version + 1
            WHERE id = ?
            AND grupo_datos = ?
            `,
            [
                dto.fincaId,
                dto.estanqueId,
                dto.fecha,
                dto.creadoPorUsuarioId ?? null,
                dto.creadoPorColaboradorId ?? null,
                id,
                grupoNormalizado
            ]
        );

        await conexion.execute(
            `
            DELETE FROM fisico_quimico_detalle
            WHERE lectura_id = ?
            `,
            [id]
        );

        await insertarDetalles(
            conexion,
            id,
            dto
        );

        await conexion.commit();

        const lectura = await obtenerLecturaPorId(
            conexion,
            id,
            grupoNormalizado
        );

        return lectura;
    } catch (err) {
        await conexion.rollback();
        throw err;
    } finally {
        conexion.release();
    }
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente una lectura fisico quimica y sus
    mediciones por ID y grupo de datos.

    Parametros:
    - id: Identificador de la lectura.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura eliminada logicamente.
    - null si no existe.
    */
    const grupoNormalizado = normalizarGrupoDatos(
        grupoDatos
    );

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const actual = await obtenerLecturaPorId(
            conexion,
            id,
            grupoNormalizado
        );

        if (!actual) {
            await conexion.rollback();
            return null;
        }

        await conexion.execute(
            `
            UPDATE fisico_quimico
            SET
                activo = FALSE,
                deleted_at = CURRENT_TIMESTAMP,
                version = version + 1
            WHERE id = ?
            AND grupo_datos = ?
            AND deleted_at IS NULL
            AND activo = TRUE
            `,
            [
                id,
                grupoNormalizado
            ]
        );

        await conexion.execute(
            `
            UPDATE fisico_quimico_detalle
            SET
                activo = FALSE,
                deleted_at = CURRENT_TIMESTAMP,
                version = version + 1
            WHERE lectura_id = ?
            AND deleted_at IS NULL
            AND activo = TRUE
            `,
            [id]
        );

        await conexion.commit();

        return actual;
    } catch (err) {
        await conexion.rollback();
        throw err;
    } finally {
        conexion.release();
    }
}

export async function findByEstanqueAndFecha(
    estanqueId,
    fecha,
    grupoDatos
) {
    /*
    Descripcion:
    Busca una lectura fisico quimica activa mediante el
    estanque, la fecha y el grupo de datos.

    Parametros:
    - estanqueId: Identificador del estanque.
    - fecha: Fecha de la lectura.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura encontrada con sus mediciones.
    - null si no existe.
    */
    const grupoNormalizado = normalizarGrupoDatos(
        grupoDatos
    );

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE estanque_id = ?
        AND fecha_registro = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [
            estanqueId,
            fecha,
            grupoNormalizado
        ]
    );

    if (rows.length === 0) {
        return null;
    }

    const detalles = await obtenerDetallesPorLecturas(
        pool,
        [rows[0].id]
    );

    return mapearFila(
        rows[0],
        detalles
    );
}


/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene las funciones internas de consulta, insercion,
mapeo y normalizacion utilizadas por el modelo.
*/


async function obtenerLecturaParaRegistro(
    ejecutor,
    estanqueId,
    fecha,
    grupoDatos
) {
    /*
    Descripcion:
    Busca la lectura principal asociada al estanque y fecha,
    incluyendo registros desactivados para respetar la
    restriccion unica de la tabla.

    Parametros:
    - ejecutor: Conexion activa de MySQL.
    - estanqueId: Identificador del estanque.
    - fecha: Fecha de la lectura.
    - grupoDatos: Grupo de datos normalizado.

    Retorna:
    - Datos basicos de la lectura encontrada.
    - null si no existe.
    */
    const [rows] = await ejecutor.execute(
        `
        SELECT
            id,
            activo,
            deleted_at
        FROM fisico_quimico
        WHERE estanque_id = ?
        AND fecha_registro = ?
        AND grupo_datos = ?
        LIMIT 1
        FOR UPDATE
        `,
        [
            estanqueId,
            fecha,
            grupoDatos
        ]
    );

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

async function obtenerLecturaPorId(
    ejecutor,
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Consulta una lectura principal y sus detalles mediante
    un ejecutor de consultas.

    Parametros:
    - ejecutor: Pool o conexion activa de MySQL.
    - id: Identificador de la lectura.
    - grupoDatos: Grupo de datos normalizado.

    Retorna:
    - Lectura con sus mediciones.
    - null si no existe.
    */
    const [rows] = await ejecutor.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [
            id,
            grupoDatos
        ]
    );

    if (rows.length === 0) {
        return null;
    }

    const detalles = await obtenerDetallesPorLecturas(
        ejecutor,
        [rows[0].id]
    );

    return mapearFila(rows[0], detalles);
}

async function obtenerDetallesPorLecturas(
    ejecutor,
    lecturaIds
) {
    /*
    Descripcion:
    Obtiene las mediciones activas de una o varias lecturas.

    Parametros:
    - ejecutor: Pool o conexion activa de MySQL.
    - lecturaIds: Lista de identificadores de lecturas.

    Retorna:
    - Mapa de mediciones agrupadas por lectura.
    */
    if (lecturaIds.length === 0) {
        return new Map();
    }

    const marcadores = lecturaIds
        .map(() => '?')
        .join(', ');

    const [rows] = await ejecutor.execute(
        `
        SELECT
            lectura_id,
            tipo_medicion,
            etiqueta,
            valor,
            hora_medicion
        FROM fisico_quimico_detalle
        WHERE lectura_id IN (${marcadores})
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY lectura_id ASC, id ASC
        `,
        lecturaIds
    );

    return agruparDetalles(rows);
}

async function insertarDetalles(
    conexion,
    lecturaId,
    dto
) {
    /*
    Descripcion:
    Inserta las mediciones de una lectura en la tabla de
    detalles.

    Parametros:
    - conexion: Conexion activa de MySQL.
    - lecturaId: Identificador de la lectura principal.
    - dto: Objeto FisicoQuimicaDTO.

    Retorna:
    - No retorna un valor.
    */
    const detalles = construirDetalles(
        lecturaId,
        dto
    );

    if (detalles.length === 0) {
        return;
    }

    const marcadores = detalles
        .map(() => '(?, ?, ?, ?, ?, ?, ?)')
        .join(', ');

    const valores = detalles.flat();

    await conexion.execute(
        `
        INSERT INTO fisico_quimico_detalle (
            lectura_id,
            tipo_medicion,
            etiqueta,
            valor,
            hora_medicion,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES ${marcadores}
        `,
        valores
    );
}

function construirDetalles(lecturaId, dto) {
    /*
    Descripcion:
    Convierte los arreglos del DTO en filas para la tabla
    fisico_quimico_detalle.

    Parametros:
    - lecturaId: Identificador de la lectura principal.
    - dto: Objeto FisicoQuimicaDTO.

    Retorna:
    - Lista de filas listas para insertar.
    */
    const detalles = [];

    agregarMediciones(
        detalles,
        lecturaId,
        TIPO_PH,
        dto.ph,
        dto.creadoPorUsuarioId,
        dto.creadoPorColaboradorId
    );

    agregarMediciones(
        detalles,
        lecturaId,
        TIPO_SALINIDAD,
        dto.salinidad,
        dto.creadoPorUsuarioId,
        dto.creadoPorColaboradorId
    );

    agregarMediciones(
        detalles,
        lecturaId,
        TIPO_TEMPERATURA,
        dto.temperatura,
        dto.creadoPorUsuarioId,
        dto.creadoPorColaboradorId
    );

    agregarMediciones(
        detalles,
        lecturaId,
        TIPO_OXIGENO,
        dto.oxigenoDisuelto,
        dto.creadoPorUsuarioId,
        dto.creadoPorColaboradorId
    );

    return detalles;
}

function agregarMediciones(
    detalles,
    lecturaId,
    tipoMedicion,
    mediciones,
    creadoPorUsuarioId,
    creadoPorColaboradorId
) {
    /*
    Descripcion:
    Agrega las mediciones de un tipo a la lista de detalles.

    Parametros:
    - detalles: Lista acumulada de filas.
    - lecturaId: Identificador de la lectura principal.
    - tipoMedicion: Tipo aceptado por el enum de MySQL.
    - mediciones: Arreglo de mediciones recibido.
    - creadoPorUsuarioId: Identificador del usuario que crea.
    - creadoPorColaboradorId: Identificador del colaborador que crea.

    Retorna:
    - No retorna un valor.
    */
    for (const medicion of mediciones) {
        detalles.push([
            lecturaId,
            tipoMedicion,
            String(medicion.etiqueta),
            Number(medicion.valor),
            medicion.horaMedicion ?? null,
            creadoPorUsuarioId ?? null,
            creadoPorColaboradorId ?? null
        ]);
    }
}

function agruparDetalles(rows) {
    /*
    Descripcion:
    Agrupa las filas de detalle por lectura y tipo de
    medicion.

    Parametros:
    - rows: Filas obtenidas de fisico_quimico_detalle.

    Retorna:
    - Mapa de mediciones agrupadas.
    */
    const detalles = new Map();

    for (const row of rows) {
        if (!detalles.has(row.lectura_id)) {
            detalles.set(
                row.lectura_id,
                crearMedicionesVacias()
            );
        }

        const mediciones = detalles.get(
            row.lectura_id
        );

        const medicion = {
            valor: Number(row.valor),
            etiqueta: row.etiqueta,
            horaMedicion: row.hora_medicion ?? null
        };

        if (row.tipo_medicion === TIPO_PH) {
            mediciones.ph.push(medicion);
        }

        if (
            row.tipo_medicion ===
            TIPO_SALINIDAD
        ) {
            mediciones.salinidad.push(medicion);
        }

        if (
            row.tipo_medicion ===
            TIPO_TEMPERATURA
        ) {
            mediciones.temperatura.push(medicion);
        }

        if (
            row.tipo_medicion ===
            TIPO_OXIGENO
        ) {
            mediciones.oxigenoDisuelto.push(
                medicion
            );
        }
    }

    return detalles;
}

function crearMedicionesVacias() {
    /*
    Descripcion:
    Crea la estructura inicial de mediciones de una lectura.

    Parametros:
    - No posee.

    Retorna:
    - Objeto con los cuatro arreglos de mediciones.
    */
    return {
        ph: [],
        salinidad: [],
        temperatura: [],
        oxigenoDisuelto: []
    };
}

function mapearLista(rows, detalles) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato
    utilizado por el backend.

    Parametros:
    - rows: Filas obtenidas desde fisico_quimico.
    - detalles: Mapa de mediciones por lectura.

    Retorna:
    - Lista de lecturas fisico quimicas.
    */
    return rows.map(
        row => mapearFila(row, detalles)
    );
}

function mapearFila(row, detalles) {
    /*
    Descripcion:
    Convierte una fila principal y sus detalles al formato
    camelCase utilizado por el frontend.

    Parametros:
    - row: Fila obtenida desde fisico_quimico.
    - detalles: Mapa de mediciones por lectura.

    Retorna:
    - Objeto de lectura fisico quimica.
    */
    const mediciones = detalles.get(row.id) ??
        crearMedicionesVacias();

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        fecha: normalizarFecha(
            row.fecha_registro
        ),
        creadoPorUsuarioId:
            row.creado_por_usuario_id,
        creadoPorColaboradorId:
            row.creado_por_colaborador_id,
        ph: mediciones.ph,
        salinidad: mediciones.salinidad,
        temperatura: mediciones.temperatura,
        oxigenoDisuelto:
            mediciones.oxigenoDisuelto,
        activo: Boolean(row.activo),
        creadoEn: row.fecha_creacion,
        actualizadoEn: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function normalizarGrupoDatos(valor) {
    /*
    Descripcion:
    Valida y convierte el grupo de datos recibido desde
    el token JWT.

    Parametros:
    - valor: Grupo de datos recibido.

    Retorna:
    - Numero entero correspondiente al grupo de datos.

    Excepciones:
    - Error si el grupo de datos no es valido.
    */
    const grupoDatos = Number(valor);

    if (
        !Number.isInteger(grupoDatos) ||
        grupoDatos <= 0
    ) {
        throw new Error(
            'El grupoDatos del usuario es obligatorio.'
        );
    }

    return grupoDatos;
}

function normalizarFecha(valor) {
    /*
    Descripcion:
    Convierte una fecha de MySQL al formato YYYY-MM-DD.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - Fecha formateada.
    */
    if (!valor) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor).slice(0, 10);
}