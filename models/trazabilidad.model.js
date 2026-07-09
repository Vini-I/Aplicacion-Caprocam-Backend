/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.model.js
Autor: Samuel
Fecha: 05/07/2026
Modulo: Trazabilidad
Descripcion:
Capa de datos del modulo de trazabilidad.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener,
crear y eliminar logicamente registros de
trazabilidad.
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

Constantes utilizadas por el modelo.
*/

const TIPO_MOVIMIENTO = "SIEMBRA";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll() {

    /*
    Descripcion:
    Obtiene todos los registros activos de
    trazabilidad.

    Parametros:
    No posee.

    Retorna:
    Lista de registros.
    */

    const [rows] = await pool.execute(`
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_origen_id,
            estanque_destino_id,
            colaborador_id,
            fecha,
            tamano,
            dias,
            pl,
            tipo_movimiento,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM trazabilidad
        WHERE deleted_at IS NULL
        AND activo = TRUE
        ORDER BY id DESC
    `);

    return mapearLista(rows);
}

export async function findById(id) {

    /*
    Descripcion:
    Busca un registro por su identificador.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    Registro encontrado o null.
    */

    const [rows] = await pool.execute(`
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_origen_id,
            estanque_destino_id,
            colaborador_id,
            fecha,
            tamano,
            dias,
            pl,
            tipo_movimiento,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM trazabilidad
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
    `, [id]);

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function create(dto) {

    /*
    Descripcion:
    Inserta un nuevo registro de trazabilidad
    en la base de datos.

    Parametros:
    - dto: Objeto TrazabilidadDTO con la
      informacion del registro.

    Retorna:
    - Registro creado consultado nuevamente
      desde la base de datos.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fecha = normalizarFechaMysql(dto.fecha);

    const [result] = await pool.execute(
        `
        INSERT INTO trazabilidad (
            grupo_datos,
            finca_id,
            estanque_origen_id,
            estanque_destino_id,
            colaborador_id,
            fecha,
            tamano,
            dias,
            pl,
            tipo_movimiento
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.fincaId,
            dto.estanqueOrigenId,
            dto.estanqueDestinoId,
            dto.colaboradorId,
            fecha,
            dto.tamano,
            dto.dias,
            dto.pl,
            TIPO_MOVIMIENTO
        ]
    );

    return await findById(result.insertId);
}

export async function remove(id) {

    /*
    Descripcion:
    Realiza el borrado logico de un registro
    de trazabilidad.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    - Registro eliminado logicamente.
    - null si no existe.
    */

    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE trazabilidad
        SET
        activo = FALSE,
        deleted_at = CURRENT_TIMESTAMP,
        version = version + 1
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [id]
    );

    return actual;
}


/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas para
mapear y normalizar la informacion obtenida
desde la base de datos.
*/

function mapearLista(rows) {

    /*
    Descripcion:
    Convierte una lista de filas obtenidas
    desde MySQL al formato utilizado por el
    backend.

    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.

    Retorna:
    Lista de registros mapeados.
    */

    const resultado = [];

    for (let i = 0; i < rows.length; i++) {
        resultado.push(mapearFila(rows[i]));
    }

    return resultado;
}

function mapearFila(row) {

    /*
    Descripcion:
    Convierte una fila de MySQL al formato
    camelCase utilizado por el backend.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    Objeto de trazabilidad.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueOrigenId: row.estanque_origen_id,
        estanqueDestinoId: row.estanque_destino_id,
        colaboradorId: row.colaborador_id,
        fecha: formatearFecha(row.fecha),
        tamano: Number(row.tamano),
        dias: Number(row.dias),
        pl: Number(row.pl),
        tipoMovimiento: row.tipo_movimiento,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function obtenerGrupoDatos(valor) {

    /*
    Descripcion:
    Obtiene el grupo de datos que utilizara
    el registro.

    Si no se recibe ningun valor se utiliza
    el grupo 1 mientras se implementa la
    autenticacion.

    Parametros:
    - valor: Grupo de datos.

    Retorna:
    Numero del grupo de datos.
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

function normalizarFechaMysql(valor) {

    /*
    Descripcion:
    Convierte una fecha al formato
    YYYY-MM-DD compatible con MySQL.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    Fecha normalizada.
    */

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}

function formatearFecha(valor) {

    /*
    Descripcion:
    Convierte una fecha obtenida desde MySQL
    al formato YYYY-MM-DD.

    Parametros:
    - valor: Fecha recibida desde MySQL.

    Retorna:
    Fecha formateada.
    */

    if (!valor) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}