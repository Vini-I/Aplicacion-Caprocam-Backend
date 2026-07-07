/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.model.js
Autor: Joan
Fecha: 29/06/2026
Modulo: Proveedores
Descripcion:
Capa de datos del modulo de proveedores.
Por ahora trabaja con datos mock en memoria.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';


/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

grupo_datos provisional = 1 (Grupo Demo Finca del seed).
Se reemplazara por el valor del JWT cuando exista auth.
*/

const GRUPO_DATOS = 1;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/


export async function findAll() {
    /*
    Descripcion:
    Obtiene todos los proveedores que esten activos.

    Parametros:
    No posee.

    Retorna:
    - Lista de proveedores activos.
    */
        const sql = `
        SELECT *
        FROM   proveedores
        WHERE  activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `;
    const [rows] = await pool.execute(sql);
    return rows;
}

export async function findById(id) {
    /*
    Descripcion:
    Busca un proveedor activo por su ID.

    Parametros:
    - id: ID del proveedor a buscar.

    Retorna:
    - Proveedor encontrado o null.
    */
    const sql = `
        SELECT *
        FROM   proveedores
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [rows] = await pool.execute(sql, [Number(id)]);
    return rows[0] || null;
}

export async function findByName(nombre) {
    /*
    Descripcion:
    Busca un proveedor activo por su nombre exacto (case-insensitive).

    Parametros:
    - nombre: Nombre a buscar.

    Retorna:
    - Proveedor encontrado o null.
    */
    const sql = `
        SELECT *
        FROM   proveedores
        WHERE  LOWER(TRIM(nombre_empresa)) = LOWER(TRIM(?))
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
    `;
    const [rows] = await pool.execute(sql, [nombre]);
    return rows[0] || null;
}

export async function findByNameIgnorandoId(nombre, idIgnorado) {
    /*
    Descripcion:
    Busca un proveedor activo por nombre omitiendo un ID especifico.

    Parametros:
    - nombre: Nombre a buscar.
    - idIgnorado: ID que se omitira de la busqueda.

    Retorna:
    - Proveedor duplicado encontrado o null.
    */
    const sql = `
        SELECT *
        FROM   proveedores
        WHERE  LOWER(TRIM(nombre_empresa)) = LOWER(TRIM(?))
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    id != ?
        LIMIT  1
    `;
    const [rows] = await pool.execute(sql, [nombre, Number(idIgnorado)]);
    return rows[0] || null;
}

export async function create(dto) {
    /*
    Descripcion:
    Crea un nuevo proveedor en la lista en memoria.

    Parametros:
    - dto: Objeto con los datos de entrada del proveedor.

    Retorna:
    - Proveedor creado con su ID.
    */
    const sql = `
        INSERT INTO proveedores (
            grupo_datos,
            nombre_empresa,
            tipo_producto,
            telefono,
            correo_electronico,
            direccion,
            notas
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
        GRUPO_DATOS,
        dto.nombre_empresa,
        dto.tipo_producto,
        dto.telefono,
        dto.correo_electronico || null,
        dto.direccion          || null,
        dto.notas              || null,
    ]);
    return findById(result.insertId);
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza los datos de un proveedor activo por su ID.

    Parametros:
    - id: ID del proveedor.
    - dto: Nuevos datos a actualizar.

    Retorna:
    - Proveedor actualizado o null.
    */
    const sql = `
        UPDATE proveedores
        SET    nombre_empresa      = ?,
               tipo_producto       = ?,
               telefono            = ?,
               correo_electronico  = ?,
               direccion           = ?,
               notas               = ?,
               version             = version + 1
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [result] = await pool.execute(sql, [
        dto.nombre_empresa,
        dto.tipo_producto,
        dto.telefono,
        dto.correo_electronico || null,
        dto.direccion          || null,
        dto.notas              || null,
        Number(id),
    ]);
    if (result.affectedRows === 0) return null;
    return findById(id);
}

export async function remove(id) {
    /*
    Descripcion:
    Realiza un borrado logico del proveedor asignando activo = false.

    Parametros:
    - id: ID del proveedor a eliminar.

    Retorna:
    - Proveedor desactivado o null.
    */
    const proveedor = await findById(id);
    if (!proveedor) return null;

    const sql = `
        UPDATE proveedores
        SET    activo      = FALSE,
               deleted_at  = NOW(),
               version     = version + 1
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [result] = await pool.execute(sql, [Number(id)]);
    if (result.affectedRows === 0) return null;

    return { ...proveedor, activo: false };
}