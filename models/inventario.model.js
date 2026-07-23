/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.model.js
Autor: Brayan / Joan
Fecha: 30/06/2026 — Adaptado a MySQL: 06/07/2026
Modulo: Inventario
Descripcion:
Capa de datos SOLO de la tabla inventario. Ya no crea ni
actualiza productos (eso vive en producto.model.js). Los
SELECT hacen JOIN con productos unicamente para enriquecer
la respuesta con nombre/categoria/etc.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';
import { mapearInventario } from '../dtos/inventario.dto.js';

/*
//////////////////////////////////////////////////////////
QUERY BASE — JOIN productos + inventario
//////////////////////////////////////////////////////////

Tiene UN SOLO placeholder (grupo_datos). Cualquier funcion
que agregue condiciones extra debe mandar GRUPO_DATOS como
el PRIMER parametro, seguido de los parametros de sus propias
condiciones, en el mismo orden en que aparecen en el SQL.
*/

const SELECT_JOIN = `
    SELECT
        i.id             AS inv_id,
        i.uuid           AS inv_uuid,
        i.activo         AS inv_activo,
        i.cantidad,
        i.stock_minimo,
        i.proveedor_id,
        prov.nombre      AS nombre_proveedor,
        i.version,
        i.fecha_creacion,
        i.fecha_actualizacion,
        p.id             AS prod_id,
        p.nombre,
        p.categoria,
        p.unidad,
        p.precio_unidad,
        p.fecha_ingreso,
        p.fecha_caducidad,
        p.estado
    FROM  inventario i
    INNER JOIN productos p ON i.producto_id = p.id
    LEFT JOIN proveedores prov ON i.proveedor_id = prov.id
    WHERE i.grupo_datos = ?
    AND   i.activo = TRUE
    AND   i.deleted_at IS NULL
    AND   p.activo = TRUE
    AND   p.deleted_at IS NULL
`;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todos los registros de inventario activos del
    grupo_datos actual, enriquecidos con datos del producto.
 
    Parametros:
    No posee.
 
    Retorna:
    - Lista de registros de inventario (formato camelCase).
    */
    const [rows] = await pool.execute(
        SELECT_JOIN + ' ORDER BY i.id ASC', 
        [grupoDatos]
    );
    return rows.map(mapearInventario);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de inventario activo por su ID, dentro
    del grupo_datos actual.
 
    Parametros:
    - id: ID del registro de inventario.
 
    Retorna:
    - Registro de inventario (formato camelCase) o null.
    */
    const [rows] = await pool.execute(
        SELECT_JOIN + ' AND i.id = ?',
        [grupoDatos, Number(id)]
    );
    return rows[0] ? mapearInventario(rows[0]) : null;
}

export async function findByProductoId(productoId, grupoDatos) {
    /*
    Descripcion:
    Busca el registro de inventario de un producto especifico
    (relacion 1 a 1, ver UNIQUE(grupo_datos, producto_id) en
    la DB). Usado para bloquear duplicados al crear.
 
    Parametros:
    - productoId: ID del producto.
 
    Retorna:
    - Registro de inventario (formato camelCase) o null.
    */
    const [rows] = await pool.execute(
        SELECT_JOIN + ' AND i.producto_id = ? LIMIT 1',
        [grupoDatos, Number(productoId)]
    );
    return rows[0] ? mapearInventario(rows[0]) : null;
}
 
export async function verificarProveedorExiste(proveedorId, grupoDatos) {
    /*
    Descripcion:
    Verifica que el proveedor exista y este activo, dentro
    del grupo_datos actual.
 
    Parametros:
    - proveedorId: ID del proveedor a verificar.
 
    Retorna:
    - true si existe y esta activo, false en caso contrario.
    */
    if (!proveedorId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM proveedores
        WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
    `, [Number(proveedorId), grupoDatos]);
    return rows.length > 0;
}
 
export async function verificarProductoExiste(productoId, grupoDatos) {
    /*
    Descripcion:
    Verifica que el producto exista y este activo, dentro del
    grupo_datos actual.
 
    Parametros:
    - productoId: ID del producto a verificar.
 
    Retorna:
    - true si existe y esta activo, false en caso contrario.
    */
    if (!productoId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM productos
        WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
    `, [Number(productoId), grupoDatos]);
    return rows.length > 0;
}
 
 
export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Crea el registro de inventario para un producto existente,
    asociado al grupo_datos actual. cantidad siempre inicia en
    0 (ver InventarioCreateDTO); la carga inicial de stock se
    hace con un primer movimiento tipo 'Entrada'.
 
    Parametros:
    - dto: InventarioCreateDTO con producto_id, proveedor_id y
      stock_minimo.
 
    Retorna:
    - Registro de inventario recien creado (formato camelCase).
    */
    const [result] = await pool.execute(`
        INSERT INTO inventario (
            grupo_datos, producto_id, proveedor_id, cantidad, stock_minimo
        ) VALUES (?, ?, ?, 0, ?)
    `, [
        grupoDatos,
        dto.producto_id,
        dto.proveedor_id,
        dto.stock_minimo,
    ]);
    return findById(result.insertId, grupoDatos);
}
 
export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza SOLO proveedor_id y stock_minimo de un registro
    de inventario activo, dentro del grupo_datos actual.
    cantidad no se toca aqui, ver movimientoInventario.model.js.
 
    Parametros:
    - id:  ID del registro de inventario.
    - dto: InventarioUpdateDTO con proveedor_id y stock_minimo.
 
    Retorna:
    - Registro de inventario actualizado (formato camelCase) o null.
    */
    const [result] = await pool.execute(`
        UPDATE inventario
        SET    proveedor_id = ?,
               stock_minimo = ?,
               version      = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [dto.proveedor_id, dto.stock_minimo, Number(id), grupoDatos]);
 
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}
 
export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Realiza un borrado logico del registro de inventario
    (activo = false, deleted_at = NOW()), dentro del
    grupo_datos actual.
 
    Parametros:
    - id: ID del registro de inventario a eliminar.
 
    Retorna:
    - Registro de inventario desactivado (formato camelCase) o null.
    */
    const actual = await findById(id, grupoDatos);
    if (!actual) return null;
 
    const [result] = await pool.execute(`
        UPDATE inventario
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
 
    if (result.affectedRows === 0) return null;
    return { ...actual, activo: false };
}