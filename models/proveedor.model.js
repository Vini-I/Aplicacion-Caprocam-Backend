/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.model.js
Autor: Joan
Fecha: 4/08/2026
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
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/


export async function findAll(grupoDatos) {
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
        WHERE  grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `;
    const [rows] = await pool.execute(sql, [grupoDatos]);
    return rows;
}

export async function findById(id, grupoDatos) {
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
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [rows] = await pool.execute(sql, [Number(id), grupoDatos]);
    return rows[0] || null;
}

export async function findByName(nombre, grupoDatos) {
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
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
    `;
    const [rows] = await pool.execute(sql, [nombre, grupoDatos]);
    return rows[0] || null;
}

export async function findByNameIgnorandoId(nombre, idIgnorado, grupoDatos) {
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
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    id != ?
        LIMIT  1
    `;
    const [rows] = await pool.execute(sql, [nombre, Number(idIgnorado), grupoDatos]);
    return rows[0] || null;
}

export async function create(dto, grupoDatos) {
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
            notas,
            creado_por_usuario_id,
            creado_por_colaborador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
        grupoDatos,
        dto.nombre_empresa,
        dto.tipo_producto,
        dto.telefono           || null,
        dto.correo_electronico || null,
        dto.direccion          || null,
        dto.notas              || null,
        dto.creado_por_usuario_id,
        dto.creado_por_colaborador_id,
    ]);
    return findById(result.insertId, grupoDatos);
}

export async function update(id, grupoDatos, dto) {
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
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [result] = await pool.execute(sql, [
        dto.nombre_empresa,
        dto.tipo_producto,
        dto.telefono           || null,
        dto.correo_electronico || null,
        dto.direccion          || null,
        dto.notas              || null,
        Number(id),
        grupoDatos,
    ]);
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Realiza un borrado logico del proveedor asignando activo = false.

    Parametros:
    - id: ID del proveedor a eliminar.

    Retorna:
    - Proveedor desactivado o null.
    */
    const proveedor = await findById(id, grupoDatos);
    if (!proveedor) return null;

    const sql = `
        UPDATE proveedores
        SET    activo      = FALSE,
               deleted_at  = NOW(),
               version     = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [result] = await pool.execute(sql, [Number(id), grupoDatos]);
    if (result.affectedRows === 0) return null;

    return { ...proveedor, activo: false };
}

export async function tieneInventarioAsociado(id, grupoDatos) {
    /*
    Descripcion:
    Verifica si el proveedor esta asociado a algun registro de inventario activo,
    cuyo producto NO haya sido eliminado.
    */
    const sql = `
        SELECT i.id
        FROM   inventario i
        JOIN   productos p ON i.producto_id = p.id
        WHERE  i.proveedor_id = ?
        AND    i.grupo_datos = ?
        AND    p.activo = TRUE
        AND    p.deleted_at IS NULL
        LIMIT  1
    `;
    const [rows] = await pool.execute(sql, [Number(id), grupoDatos]);
    return rows.length > 0;
}