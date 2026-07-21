/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimico.model.js
Autor: Samuel
Fecha: 05/07/2026
Actualizado: 19/07/2026 - migracion ph/salinidad/temperatura/oxigeno
a tabla de detalle (fisico_quimico_detalle), para soportar varias
mediciones del mismo tipo por dia (ej. dos lecturas de pH: dia/noche).
Modulo: Fisico Quimico
Descripcion:
Capa de datos del modulo de fisico quimica.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener,
crear y eliminar logicamente las lecturas
fisico quimicas, junto con sus mediciones asociadas
en fisico_quimico_detalle.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos.
*/

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Tipos de medicion validos en fisico_quimico_detalle.tipo_medicion.
El body/response usa "oxigenoDisuelto", pero en la BD el enum
se llama "oxigeno"; TIPOS_MEDICION mapea uno a uno con la columna.
*/

const TIPOS_MEDICION = ["ph", "salinidad", "temperatura", "oxigeno"];

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
    registradas en la base de datos, limitadas al grupo
    de datos del usuario autenticado (JWT), junto con
    sus mediciones (detalle) agrupadas por tipo.

    Parametros:
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - Lista de lecturas fisico quimicas.
    */

    const [rows] = await pool.execute (

         `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE deleted_at IS NULL
        AND activo = TRUE
        AND grupo_datos = ?
        ORDER BY id DESC
        `,
        [grupoDatos]
    );

    if (rows.length === 0) {
        return [];
    }

    const detallePorLectura = await obtenerDetallePorLecturaIds(
        rows.map((row) => row.id)
    );

    return rows.map((row) => mapearFila(row, detallePorLectura.get(row.id)));
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca una lectura fisico quimica activa por su
    identificador numerico, limitada al grupo de datos
    del usuario autenticado (JWT), junto con sus
    mediciones (detalle) agrupadas por tipo.

    Parametros:
    - id: Identificador de la lectura.
    - grupoDatos: Grupo de datos del usuario autenticado.
      Si se omite (uso interno, ej. luego de un INSERT),
      no se filtra por grupo.

    Retorna:
    - La lectura encontrada.
    - null si no existe o fue eliminada logicamente.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [id];

    if (grupoDatos !== undefined) {
        sql = sql + " AND grupo_datos = ?";
        params.push(grupoDatos);
    }

    sql = sql + " LIMIT 1";

    const [rows] = await pool.execute(sql, params);

    if (rows.length === 0) {
        return null;
    }

    const detalle = await obtenerDetallePorLecturaId(rows[0].id);

    return mapearFila(rows[0], detalle);
}

export async function findByEstanqueYFecha(estanqueId, fecha, grupoDatos) {
    /*
    Descripcion:
    Busca la lectura fisico quimica activa de un estanque
    en una fecha especifica. Sirve para que el frontend
    sepa si ya existe un registro ese dia (debe actualizar)
    o no existe todavia (debe crear uno nuevo), y para
    precargar los valores en el formulario. Al filtrar por
    fecha exacta se evita traer un registro viejo del mismo
    estanque.

    Parametros:
    - estanqueId: Identificador del estanque.
    - fecha: Fecha de la lectura (YYYY-MM-DD).
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura encontrada, con su detalle agrupado por tipo.
    - null si no existe para esa fecha.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
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
        [estanqueId, fecha, grupoDatos]
    );

    if (rows.length === 0) {
        return null;
    }

    const detalle = await obtenerDetallePorLecturaId(rows[0].id);

    return mapearFila(rows[0], detalle);
}


export async function create(dto) {
    /*
    Descripcion:
    Inserta una nueva lectura fisico quimica (cabecera) y
    sus mediciones (detalle: ph, salinidad, temperatura,
    oxigenoDisuelto) en una sola transaccion.

    Parametros:
    - dto: Objeto FisicoQuimicaDTO. Los campos ph, salinidad,
      temperatura y oxigenoDisuelto son arreglos de
      { valor, etiqueta }.

    Retorna:
    - La lectura creada, con su detalle.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `
            INSERT INTO fisico_quimico(
                grupo_datos,
                finca_id,
                estanque_id,
                fecha_registro
            )
            VALUES (?, ?, ?, ?)
            `,
            [grupoDatos, dto.fincaId, dto.estanqueId, dto.fecha]
        );

        const lecturaId = result.insertId;

        await insertarDetalle(connection, lecturaId, dto);

        await connection.commit();

        return await findById(lecturaId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza los datos de cabecera de una lectura fisico
    quimica y reemplaza por completo su detalle (se borran
    las mediciones anteriores y se insertan las nuevas que
    llegan en el body), en una sola transaccion.

    Parametros:
    - id: Identificador de la lectura a actualizar.
    - dto: Objeto FisicoQuimicaDTO con los datos nuevos.

    Retorna:
    - La lectura actualizada, con su detalle.
    - null si la lectura no existe.
    */

    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await connection.execute(
            `
            UPDATE fisico_quimico
            SET
                finca_id = ?,
                estanque_id = ?,
                fecha_registro = ?,
                version = version + 1
            WHERE id = ?
            AND deleted_at IS NULL
            AND activo = TRUE
            `,
            [dto.fincaId, dto.estanqueId, dto.fecha, id]
        );

        await connection.execute(
            `DELETE FROM fisico_quimico_detalle WHERE lectura_id = ?`,
            [id]
        );

        await insertarDetalle(connection, id, dto);

        await connection.commit();

        return await findById(id);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS - DETALLE
//////////////////////////////////////////////////////////

Manejan la insercion y lectura de fisico_quimico_detalle,
y el armado/desarmado de los arreglos de mediciones que
usa el body y la respuesta del API.
*/

async function insertarDetalle(connection, lecturaId, dto) {
    /*
    Descripcion:
    Inserta en fisico_quimico_detalle una fila por cada
    medicion recibida en el dto (ph, salinidad, temperatura,
    oxigenoDisuelto), asociada a la lectura indicada.

    Parametros:
    - connection: Conexion activa dentro de una transaccion.
    - lecturaId: Identificador de fisico_quimico.id.
    - dto: Objeto FisicoQuimicaDTO.

    Retorna:
    - No retorna nada. Si no hay mediciones, no inserta filas.
    */

    const filas = filasDetalleDesdeDto(dto);

    if (filas.length === 0) {
        return;
    }

    const placeholders = filas.map(() => "(?, ?, ?, ?)").join(", ");
    const valores = [];

    for (const fila of filas) {
        valores.push(lecturaId, fila.tipoMedicion, fila.etiqueta, fila.valor);
    }

    await connection.execute(
        `
        INSERT INTO fisico_quimico_detalle (lectura_id, tipo_medicion, etiqueta, valor)
        VALUES ${placeholders}
        `,
        valores
    );
}

function filasDetalleDesdeDto(dto) {
    /*
    Descripcion:
    Convierte los arreglos de mediciones del dto
    (ph, salinidad, temperatura, oxigenoDisuelto) en una
    lista plana de filas listas para insertar en
    fisico_quimico_detalle.

    Parametros:
    - dto: Objeto FisicoQuimicaDTO.

    Retorna:
    - Lista de { tipoMedicion, etiqueta, valor }.
    */

    const medicionesPorTipo = {
        ph: dto.ph,
        salinidad: dto.salinidad,
        temperatura: dto.temperatura,
        oxigeno: dto.oxigenoDisuelto,
    };

    const filas = [];

    for (const tipoMedicion of TIPOS_MEDICION) {
        const mediciones = medicionesPorTipo[tipoMedicion];

        if (!Array.isArray(mediciones)) {
            continue;
        }

        for (const medicion of mediciones) {
            filas.push({
                tipoMedicion,
                etiqueta: String(medicion.etiqueta),
                valor: Number(medicion.valor),
            });
        }
    }

    return filas;
}

async function obtenerDetallePorLecturaId(lecturaId) {
    /*
    Descripcion:
    Obtiene las mediciones activas de una sola lectura.

    Parametros:
    - lecturaId: Identificador de fisico_quimico.id.

    Retorna:
    - Lista de filas { tipo_medicion, etiqueta, valor }.
    */

    const [rows] = await pool.execute(
        `
        SELECT tipo_medicion, etiqueta, valor
        FROM fisico_quimico_detalle
        WHERE lectura_id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY tipo_medicion, etiqueta
        `,
        [lecturaId]
    );

    return rows;
}

async function obtenerDetallePorLecturaIds(lecturaIds) {
    /*
    Descripcion:
    Obtiene las mediciones activas de varias lecturas en
    una sola consulta (evita N+1 al listar con findAll).

    Parametros:
    - lecturaIds: Lista de identificadores de fisico_quimico.id.

    Retorna:
    - Map<lecturaId, Array<{ tipo_medicion, etiqueta, valor }>>.
    */

    const mapa = new Map();

    if (lecturaIds.length === 0) {
        return mapa;
    }

    const placeholders = lecturaIds.map(() => "?").join(", ");

    const [rows] = await pool.execute(
        `
        SELECT lectura_id, tipo_medicion, etiqueta, valor
        FROM fisico_quimico_detalle
        WHERE lectura_id IN (${placeholders})
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY lectura_id, tipo_medicion, etiqueta
        `,
        lecturaIds
    );

    for (const fila of rows) {
        if (!mapa.has(fila.lectura_id)) {
            mapa.set(fila.lectura_id, []);
        }
        mapa.get(fila.lectura_id).push(fila);
    }

    return mapa;
}

function agruparDetallePorTipo(detalleRows) {
    /*
    Descripcion:
    Agrupa las filas de fisico_quimico_detalle por tipo
    de medicion, en el formato de arreglo que espera el
    body/response ({ valor, etiqueta }).

    Parametros:
    - detalleRows: Filas { tipo_medicion, etiqueta, valor }.

    Retorna:
    - Objeto { ph, salinidad, temperatura, oxigeno }, cada uno
      un arreglo de { valor, etiqueta }.
    */

    const agrupado = {
        ph: [],
        salinidad: [],
        temperatura: [],
        oxigeno: [],
    };

    for (const fila of detalleRows || []) {
        agrupado[fila.tipo_medicion].push({
            valor: Number(fila.valor),
            etiqueta: fila.etiqueta,
        });
    }

    return agrupado;
}


function mapearFila(row, detalleRows) {
    /*
    Descripcion:
    Convierte una fila de fisico_quimico (cabecera) mas sus
    filas de detalle al formato utilizado por el backend.

    Parametros:
    - row: Fila de fisico_quimico obtenida desde MySQL.
    - detalleRows: Filas de fisico_quimico_detalle asociadas.

    Retorna:
    - Objeto lectura, con ph/salinidad/temperatura/oxigenoDisuelto
      como arreglos de { valor, etiqueta }.
    */

    const detalle = agruparDetallePorTipo(detalleRows);

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        fecha: formatearFecha(row.fecha_registro),
        ph: detalle.ph,
        salinidad: detalle.salinidad,
        temperatura: detalle.temperatura,
        oxigenoDisuelto: detalle.oxigeno,
        activo: Boolean(row.activo),
        creadoEn: row.fecha_creacion,
        actualizadoEn: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}


function obtenerGrupoDatos(valor) {
    /*
    Descripcion:
    Obtiene el grupo de datos del registro.
    Mientras no exista autenticacion utiliza el grupo 1.

    Parametros:
    - valor: Grupo recibido.

    Retorna:
    - Numero del grupo.
    */

    if (valor === undefined) {
        return 1;
    }

    if (valor === null) {
        return 1;
    }

    if (String(valor).trim() === "") {
        return 1;
    }

    return Number(valor);
}


function formatearFecha(valor) {
    /*
    Descripcion:
    Convierte una fecha de MySQL al formato
    YYYY-MM-DD.

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

    return String(valor);
}