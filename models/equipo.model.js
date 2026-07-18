/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.model.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
Capa de datos del modulo de equipos.
Trabaja con la base de datos principal MySQL.
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


export async function findAll(filtros = {}) {

        /*
    Descripcion:
    Obtiene todos los equipos activos desde la base de datos.
    Permite filtrar por grupo de datos.
 
    Parametros:
    - filtros: Objeto con filtros opcionales.
        - grupoDatos: Codigo del grupo de datos.
 
    Retorna:
    - Lista de equipos mapeados a camelCase.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            nombre AS identificador,
            descripcion,
            fecha_instalacion,
            tipo,
            estado,
            funcion,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM equipos
        WHERE deleted_at IS NULL
          AND activo = TRUE
    `;

    const params = [];

    if (filtros.grupoDatos !== undefined && filtros.grupoDatos !== null) {
        sql += " AND grupo_datos = ?";
        params.push(Number(filtros.grupoDatos));
    }

    sql += " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);

    return rows.map(mapearFila);
}

export async function findById(id) {

    /*
    Descripcion:
    Busca un equipo activo por su identificador numerico.
 
    Parametros:
    - id: Identificador del equipo.
 
    Retorna:
    - El equipo encontrado mapeado a camelCase.
    - null si no existe o fue eliminado logicamente.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            nombre AS identificador,
            descripcion,
            fecha_instalacion,
            tipo,
            estado,
            funcion,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM equipos
        WHERE id = ?
          AND deleted_at IS NULL
          AND activo = TRUE
        LIMIT 1
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function findByIdentificador(identificador, idIgnorado) {
        /*
    Descripcion:
    Busca un equipo por nombre para validar unicidad.
    Permite ignorar un id especifico al actualizar.
 
    Parametros:
    - nombre:     Nombre del equipo a buscar.
    - idIgnorado: ID a excluir de la busqueda (update).
 
    Retorna:
    - El equipo encontrado o null.
    */

    let sql = `
        SELECT id, nombre AS identificador
        FROM equipos
        WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
          AND deleted_at IS NULL
          AND activo = TRUE
    `;

    const params = [identificador];

    if (idIgnorado !== null && idIgnorado !== undefined) {
        sql += " AND id <> ?";
        params.push(idIgnorado);
    }

    sql += " LIMIT 1";

    const [rows] = await pool.execute(sql, params);

    return rows.length === 0 ? null : rows[0];
}

export async function create(dto) {
        /*
    Descripcion:
    Inserta un nuevo equipo en la base de datos.
 
    Parametros:
    - dto: Objeto EquipoDTO con los datos normalizados.
 
    Retorna:
    - El equipo recien creado consultado desde la base de datos.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fechaInstalacion = normalizarFechaMysql(dto.fechaInstalacion);

    const [result] = await pool.execute(
        `
        INSERT INTO equipos (
            grupo_datos,
            nombre,
            descripcion,
            fecha_instalacion,
            tipo,
            estado,
            funcion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.identificador,
            dto.descripcion,
            fechaInstalacion,
            dto.tipo,
            dto.estado,
            dto.funcionEquipo
        ]
    );

    return await findById(result.insertId);
}

export async function update(id, dto) {
        /*
    Descripcion:
    Actualiza un equipo existente en la base de datos.
    Incrementa version para control de cambios.
 
    Parametros:
    - id:  Identificador del equipo a actualizar.
    - dto: Objeto EquipoDTO con los datos actualizados.
 
    Retorna:
    - El equipo actualizado.
    - null si no existe o fue eliminado logicamente.
    */

    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    const fechaInstalacion = normalizarFechaMysql(dto.fechaInstalacion);

    await pool.execute(
        `
        UPDATE equipos
        SET
            nombre = ?,
            descripcion = ?,
            fecha_instalacion = ?,
            tipo = ?,
            estado = ?,
            funcion = ?,
            version = version + 1
        WHERE id = ?
          AND deleted_at IS NULL
          AND activo = TRUE
        `,
        [
            dto.identificador,
            dto.descripcion,
            fechaInstalacion,
            dto.tipo,
            dto.estado,
            dto.funcionEquipo,
            id
        ]
    );

    return await findById(id);
}

export async function remove(id) {
        /*
    Descripcion:
    Elimina logicamente un equipo.
    No borra fisicamente el registro.
    Cambia activo a FALSE, llena deleted_at e incrementa version.
 
    Parametros:
    - id: Identificador del equipo a eliminar.
 
    Retorna:
    - El equipo antes de ser eliminado.
    - null si no existe o ya fue eliminado.
    */

    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE equipos
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
 
Contiene funciones internas de mapeo y normalizacion.
Las funciones findAll(), findById(), create(), update()
y remove() dependen de estas funciones para trabajar.
*/


function mapearFila(row) {
        /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato
    camelCase esperado por el frontend.
 
    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.
 
    Retorna:
    - Lista de equipos mapeados.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        identificador: row.identificador,
        descripcion: row.descripcion,
        fechaInstalacion: formatearFecha(row.fecha_instalacion),
        tipo: row.tipo,
        estado: row.estado,
        funcionEquipo: row.funcion,
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
    Convierte una fila de MySQL en un objeto camelCase.
 
    Parametros:
    - row: Fila obtenida desde MySQL.
 
    Retorna:
    - Objeto equipo en el formato esperado por el frontend.
    */

    if (valor === undefined || valor === null || String(valor).trim() === "") {
        return 1;
    }

    return Number(valor);
}

function normalizarFechaMysql(valor) {
        /*
    Descripcion:
    Convierte una fecha al formato YYYY-MM-DD compatible
    con MySQL. Acepta formato dd/mm/aaaa o YYYY-MM-DD.
 
    Parametros:
    - valor: Fecha recibida desde el body.
 
    Retorna:
    - Fecha en formato YYYY-MM-DD o null si no existe.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();

    if (texto === "") {
        return null;
    }

    if (texto.includes("/")) {
        const partes = texto.split("/");

        if (partes.length === 3) {
            const dia = partes[0].padStart(2, "0");
            const mes = partes[1].padStart(2, "0");
            const anio = partes[2];

            return `${anio}-${mes}-${dia}`;
        }
    }

    return texto;
}

function formatearFecha(valor) {
        /*
    Descripcion:
    Formatea una fecha recibida desde MySQL para devolverla
    en formato YYYY-MM-DD al frontend.
 
    Parametros:
    - valor: Fecha recibida desde MySQL.
 
    Retorna:
    - Fecha formateada o null si no existe.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}
