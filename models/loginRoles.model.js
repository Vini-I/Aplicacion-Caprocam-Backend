/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginRoles.model.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Capa de datos del modulo de login para roles.
Trabaja con la tabla roles de MySQL.
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de login para roles.
*/

export async function findById(id) {
      /*
    Descripcion:
    Busca un rol por su ID numerico.

    Parametros:
    - id: ID del rol (numero o string numerico).

    Retorna:
    - El objeto rol si existe, o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            nombre,
            descripcion,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM roles
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

    return mapearRol(rows[0]);
}

export async function findAll() {
    /*
    Descripcion:
    Devuelve todos los roles disponibles en el sistema.

    Parametros:
    No posee.

    Retorna:
    - Arreglo con todos los roles disponibles.
    */
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            nombre,
            descripcion,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM roles
        WHERE deleted_at IS NULL
          AND activo = TRUE
        ORDER BY nombre ASC
        `
    );

    return rows.map(mapearRol);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
 
Contiene funciones internas de mapeo de roles.
*/

function mapearRol(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        nombre: row.nombre,
        descripcion: row.descripcion,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}
