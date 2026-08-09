/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.model.js
Autor: Gerald Alfaro
Fecha: 31/07/2026
Modulo: Estanques
Descripcion:
Capa de datos del modulo de estanques.
Trabaja con la base de datos principal MySQL.
Todas las operaciones utilizan el grupo de datos obtenido
desde el JWT para proteger los registros.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos
*/

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll(filtros) {
    /*
    Descripcion:
    Obtiene los estanques activos que pertenecen al grupo
    de datos del usuario autenticado.
    Permite filtrar opcionalmente por finca.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            fecha_mantenimiento,
            precria,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM estanques
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [
        filtros.grupoDatos
    ];

    if (filtros.idFinca) {
        sql = sql + " AND finca_id = ?";

        params.push(
            filtros.idFinca
        );
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(
        sql,
        params
    );

    return mapearLista(
        rows
    );
}

export async function findById(
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Busca un estanque activo por su identificador numerico
    y por el grupo de datos del usuario autenticado.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            fecha_mantenimiento,
            precria,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM estanques
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

    return mapearFila(
        rows[0]
    );
}

export async function findByCodigoAndFinca(
    codigo,
    idFinca,
    idIgnorado,
    grupoDatos
) {
    /*
    Descripcion:
    Busca un estanque por codigo, finca y grupo de datos.
    Permite ignorar un id durante una actualizacion.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            fecha_mantenimiento,
            precria,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM estanques
        WHERE LOWER(TRIM(codigo)) = LOWER(TRIM(?))
        AND finca_id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [
        codigo,
        idFinca,
        grupoDatos
    ];

    if (
        idIgnorado !== null &&
        idIgnorado !== undefined
    ) {
        sql = sql + " AND id <> ?";

        params.push(
            idIgnorado
        );
    }

    sql = sql + " LIMIT 1";

    const [rows] = await pool.execute(
        sql,
        params
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(
        rows[0]
    );
}

export async function fincaPerteneceGrupo(
    idFinca,
    grupoDatos
) {
    /*
    Descripcion:
    Verifica que una finca exista, se encuentre activa
    y pertenezca al grupo de datos del usuario.
    */

    const [rows] = await pool.execute(
        `
        SELECT id
        FROM fincas
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [
            idFinca,
            grupoDatos
        ]
    );

    if (rows.length === 0) {
        return false;
    }

    return true;
}

export async function create(dto) {
    /*
    Descripcion:
    Inserta un nuevo estanque utilizando el grupo de datos
    y la identidad del creador recibidos desde el controller.
    */

    const fechaMantenimiento =
        normalizarFechaMysqlOpcional(
            dto.fechaMantenimiento
        );

    const [result] = await pool.execute(
        `
        INSERT INTO estanques (
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            fecha_mantenimiento,
            precria,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            dto.grupoDatos,
            dto.idFinca,
            dto.codigo,
            dto.tipoEstanque,
            dto.estado,
            dto.largo,
            dto.ancho,
            dto.profundidad,
            dto.fuenteAgua,
            fechaMantenimiento,
            dto.precria,
            dto.creadoPorUsuarioId,
            dto.creadoPorColaboradorId
        ]
    );

    return await findById(
        result.insertId,
        dto.grupoDatos
    );
}

export async function update(
    id,
    dto,
    grupoDatos
) {
    /*
    Descripcion:
    Actualiza un estanque que pertenece al grupo del usuario.
    El campo grupo_datos y los campos de auditoria del
    creador no se modifican.
    */

    const actual = await findById(
        id,
        grupoDatos
    );

    if (!actual) {
        return null;
    }

    const fechaMantenimiento =
        normalizarFechaMysqlOpcional(
            dto.fechaMantenimiento
        );

    await pool.execute(
        `
        UPDATE estanques
        SET
            finca_id = ?,
            codigo = ?,
            tipo_estanque = ?,
            estado = ?,
            largo = ?,
            ancho = ?,
            profundidad = ?,
            fuente_agua = ?,
            fecha_mantenimiento = ?,
            precria = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            dto.idFinca,
            dto.codigo,
            dto.tipoEstanque,
            dto.estado,
            dto.largo,
            dto.ancho,
            dto.profundidad,
            dto.fuenteAgua,
            fechaMantenimiento,
            dto.precria,
            id,
            grupoDatos
        ]
    );

    return await findById(
        id,
        grupoDatos
    );
}

export async function actualizarEstanqueOrigen(
    connection,
    idEstanque,
    grupoDatos,
    estado
) {
    /*
    Descripcion:
    Actualiza el estado del estanque de origen durante
    un movimiento realizado desde el modulo Trazabilidad.

    Esta funcion no crea ni confirma una transaccion.
    Utiliza la connection recibida desde Trazabilidad
    para formar parte de la misma transaccion.

    Parametros:
    - connection: Conexion MySQL con transaccion activa.
    - idEstanque: Identificador del estanque de origen.
    - grupoDatos: Grupo de datos obtenido desde el JWT.
    - estado: Nuevo estado definido por la logica del
      movimiento de Trazabilidad.

    Retorna:
    - true si el estanque fue actualizado.
    - false si no se encontro un estanque valido.
    */

    const [resultado] =
        await connection.execute(
            `
            UPDATE estanques
            SET
                estado = ?,
                version = version + 1
            WHERE id = ?
            AND grupo_datos = ?
            AND deleted_at IS NULL
            AND activo = TRUE
            `,
            [
                estado,
                idEstanque,
                grupoDatos
            ]
        );

    return (
        resultado.affectedRows > 0
    );
}

export async function actualizarEstanqueDestino(
    connection,
    idEstanque,
    grupoDatos,
    estado
) {
    /*
    Descripcion:
    Actualiza el estado del estanque de destino durante
    un movimiento realizado desde el modulo Trazabilidad.

    Esta funcion no crea ni confirma una transaccion.
    Utiliza la connection recibida desde Trazabilidad
    para formar parte de la misma transaccion.

    Parametros:
    - connection: Conexion MySQL con transaccion activa.
    - idEstanque: Identificador del estanque de destino.
    - grupoDatos: Grupo de datos obtenido desde el JWT.
    - estado: Nuevo estado definido por la logica del
      movimiento de Trazabilidad.

    Retorna:
    - true si el estanque fue actualizado.
    - false si no se encontro un estanque valido.
    */

    const [resultado] =
        await connection.execute(
            `
            UPDATE estanques
            SET
                estado = ?,
                version = version + 1
            WHERE id = ?
            AND grupo_datos = ?
            AND deleted_at IS NULL
            AND activo = TRUE
            `,
            [
                estado,
                idEstanque,
                grupoDatos
            ]
        );

    return (
        resultado.affectedRows > 0
    );
}

export async function remove(
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Elimina logicamente un estanque y deja sin asignar
    los equipos que se encontraban relacionados.

    Parametros:
    - id: Identificador del estanque.
    - grupoDatos: Grupo de datos obtenido desde el JWT.

    Retorna:
    - Estanque eliminado logicamente.
    - null si el estanque no existe.
    */

    const actual = await findById(
        id,
        grupoDatos
    );

    if (!actual) {
        return null;
    }

    const connection =
        await pool.getConnection();

    try {
        await connection.beginTransaction();

        /*
        Deja sin asignar los equipos relacionados,
        pero no elimina ni desactiva los equipos.
        */

        await connection.execute(
            `
            UPDATE equipos
            SET
                estanque_id = NULL,
                version = version + 1
            WHERE estanque_id = ?
            AND grupo_datos = ?
            AND deleted_at IS NULL
            `,
            [
                id,
                grupoDatos
            ]
        );

        /*
        Realiza la eliminacion logica del estanque.
        */

        const [resultado] =
            await connection.execute(
                `
                UPDATE estanques
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
                    grupoDatos
                ]
            );

        if (resultado.affectedRows === 0) {
            await connection.rollback();

            return null;
        }

        await connection.commit();

        return actual;
    } catch (err) {
        await connection.rollback();

        throw err;
    } finally {
        connection.release();
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function mapearLista(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato usado
    por el backend y el frontend.
    */

    const resultado = [];

    for (
        let i = 0;
        i < rows.length;
        i++
    ) {
        resultado.push(
            mapearFila(
                rows[i]
            )
        );
    }

    return resultado;
}

function mapearFila(row) {
    /*
    Descripcion:
    Convierte una fila de MySQL en un objeto camelCase.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        codigo: row.codigo,
        tipoEstanque: row.tipo_estanque,
        estado: row.estado,

        largo: Number(
            row.largo
        ),

        ancho: Number(
            row.ancho
        ),

        profundidad: Number(
            row.profundidad
        ),

        fuenteAgua:
            row.fuente_agua,

        fechaMantenimiento:
            formatearFecha(
                row.fecha_mantenimiento
            ),

        precria: Boolean(
            row.precria
        ),

        creadoPorUsuarioId:
            row.creado_por_usuario_id,

        creadoPorColaboradorId:
            row.creado_por_colaborador_id,

        activo: Boolean(
            row.activo
        ),

        fechaCreacion:
            row.fecha_creacion,

        fechaActualizacion:
            row.fecha_actualizacion,

        deletedAt:
            row.deleted_at,

        version:
            row.version
    };
}

function normalizarFechaMysqlOpcional(valor) {
    /*
    Descripcion:
    Normaliza una fecha opcional para guardarla en MySQL.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim() === "") {
        return null;
    }

    return normalizarFechaMysql(
        valor
    );
}

function normalizarFechaMysql(valor) {
    /*
    Descripcion:
    Convierte una fecha al formato YYYY-MM-DD.
    Acepta Date, YYYY-MM-DD o DD/MM/YYYY.
    */

    if (valor instanceof Date) {
        return valor.toISOString().slice(
            0,
            10
        );
    }

    const texto = String(
        valor
    ).trim();

    if (texto.includes("/")) {
        const partes = texto.split("/");

        if (partes.length === 3) {
            const dia = partes[0].padStart(
                2,
                "0"
            );

            const mes = partes[1].padStart(
                2,
                "0"
            );

            const anio = partes[2];

            return (
                anio +
                "-" +
                mes +
                "-" +
                dia
            );
        }
    }

    return texto;
}

function formatearFecha(valor) {
    /*
    Descripcion:
    Formatea una fecha recibida desde MySQL.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(
            0,
            10
        );
    }

    return String(valor);
}