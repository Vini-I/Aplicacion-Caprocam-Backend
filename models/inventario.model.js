/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.model.js
Autor: Brayan / Joan
Fecha: 30/06/2026 — Adaptado a MySQL: 06/07/2026
Modulo: Inventario
Descripcion:
Capa de datos del modulo de inventario.
Sustituye datos mock por consultas reales a MySQL.
La DB separa productos e inventario:
- productos: catalogo de productos (nombre, categoria, etc.)
- inventario: cantidades disponibles por producto.
Los SELECTs usan JOIN para retornar datos completos.
Los INSERT/UPDATE usan transacciones para mantener
consistencia entre ambas tablas.
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
CONSTANTES
//////////////////////////////////////////////////////////

grupo_datos provisional = 1 (Grupo Demo Finca del seed).
Se reemplazara por el valor del JWT cuando exista auth.
*/

const GRUPO_DATOS = 1;

/*
//////////////////////////////////////////////////////////
QUERY BASE — JOIN productos + inventario
//////////////////////////////////////////////////////////

Se reutiliza en findAll y findById para evitar duplicacion.
Los alias (inv_id, prod_id, inv_uuid, inv_activo) permiten
distinguir campos con el mismo nombre en ambas tablas.
*/

const SELECT_JOIN = `
    SELECT
        i.id             AS inv_id,
        i.uuid           AS inv_uuid,
        i.activo         AS inv_activo,
        i.cantidad,
        i.stock_minimo,
        i.proveedor_id,
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
    WHERE i.activo = TRUE
    AND   i.deleted_at IS NULL
    AND   p.activo = TRUE
    AND   p.deleted_at IS NULL
`;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll() {
    /*
    Descripcion:
    Obtiene todos los registros activos de inventario
    con sus datos de producto asociados (JOIN).

    Parametros:
    No posee.

    Retorna:
    - Array de objetos mapeados a camelCase.
    */
    const [rows] = await pool.execute(
        SELECT_JOIN + ' ORDER BY i.id ASC'
    );
    return rows.map(mapearInventario);
}

export async function findById(id) {
    /*
    Descripcion:
    Busca un registro activo de inventario por su ID
    (ID de la tabla inventario, no de productos).

    Parametros:
    - id: ID del registro de inventario.

    Retorna:
    - Objeto mapeado a camelCase o null si no existe.
    */
    const [rows] = await pool.execute(
        SELECT_JOIN + ' AND i.id = ?',
        [Number(id)]
    );
    return rows[0] ? mapearInventario(rows[0]) : null;
}

export async function findByNombre(nombre) {
    /*
    Descripcion:
    Busca un producto activo en el catalogo por nombre
    exacto (case-insensitive). Usado para validar duplicados.

    Parametros:
    - nombre: Nombre del producto a buscar.

    Retorna:
    - Objeto mapeado a camelCase o null si no existe.
    */
    const [rows] = await pool.execute(
        SELECT_JOIN + ' AND LOWER(TRIM(p.nombre)) = LOWER(TRIM(?)) LIMIT 1',
        [nombre]
    );
    return rows[0] ? mapearInventario(rows[0]) : null;
}

export async function findByNombreIgnorandoId(nombre, invId) {
    /*
    Descripcion:
    Busca producto por nombre ignorando un ID de inventario.
    Usado para validar duplicados al hacer UPDATE.

    Parametros:
    - nombre: Nombre del producto.
    - invId:  ID del inventario que se esta editando.

    Retorna:
    - Objeto mapeado a camelCase o null.
    */
    const [rows] = await pool.execute(
        SELECT_JOIN +
        ' AND LOWER(TRIM(p.nombre)) = LOWER(TRIM(?)) AND i.id != ? LIMIT 1',
        [nombre, Number(invId)]
    );
    return rows[0] ? mapearInventario(rows[0]) : null;
}

export async function verificarProveedorExiste(proveedorId) {
    /*
    Descripcion:
    Verifica que un proveedor exista y este activo antes de
    usarlo como FK en productos/inventario.

    Parametros:
    - proveedorId: ID numerico del proveedor.

    Retorna:
    - true si existe, false si no.
    */
    if (!proveedorId) return false;

    const [rows] = await pool.execute(`
        SELECT id
        FROM   proveedores
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(proveedorId)]);

    return rows.length > 0;
}

export async function create(dto) {
    /*
    Descripcion:
    Crea un producto en la tabla productos y su registro
    correspondiente en inventario. Usa transaccion para
    garantizar consistencia entre ambas tablas.

    Parametros:
    - dto: Objeto InventarioDTO con los datos del producto.

    Retorna:
    - Objeto mapeado a camelCase del registro creado.
    */
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Insertar en catalogo de productos
        const sqlProducto = `
            INSERT INTO productos (
                grupo_datos,
                proveedor_id,
                nombre,
                categoria,
                unidad,
                precio_unidad,
                fecha_ingreso,
                fecha_caducidad,
                estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [prodResult] = await conn.execute(sqlProducto, [
            GRUPO_DATOS,
            dto.proveedor_id || null,
            dto.nombre,
            dto.categoria,
            dto.unidad,
            dto.precio_unidad,
            dto.fecha_ingreso,
            dto.fecha_caducidad,
            dto.estado || 'ACTIVO',
        ]);

        const productoId = prodResult.insertId;

        // 2. Insertar registro de inventario (cantidad + stock_minimo)
        const sqlInventario = `
            INSERT INTO inventario (
                grupo_datos,
                producto_id,
                proveedor_id,
                cantidad,
                stock_minimo
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const [invResult] = await conn.execute(sqlInventario, [
            GRUPO_DATOS,
            productoId,
            dto.proveedor_id || null,
            dto.cantidad,
            dto.stock_minimo,
        ]);

        await conn.commit();
        return findById(invResult.insertId);

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza el producto (catalogo) y el inventario
    (cantidades) de forma atomica usando transaccion.
    Incrementa version en ambas tablas.

    Parametros:
    - id:  ID del registro de inventario a actualizar.
    - dto: Objeto InventarioDTO con los nuevos datos.

    Retorna:
    - Objeto mapeado a camelCase actualizado o null.
    */
    const actual = await findById(id);
    if (!actual) return null;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Actualizar catalogo de productos
        const sqlProducto = `
            UPDATE productos
            SET    nombre       = ?,
                   categoria    = ?,
                   unidad       = ?,
                   precio_unidad= ?,
                   proveedor_id = ?,
                   fecha_ingreso= ?,
                   fecha_caducidad = ?,
                   estado       = ?,
                   version      = version + 1
            WHERE  id = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `;
        await conn.execute(sqlProducto, [
            dto.nombre,
            dto.categoria,
            dto.unidad,
            dto.precio_unidad,
            dto.proveedor_id || null,
            dto.fecha_ingreso,
            dto.fecha_caducidad,
            dto.estado || 'ACTIVO',
            actual.productoId,
        ]);

        // 2. Actualizar registro de inventario
        const sqlInventario = `
            UPDATE inventario
            SET    cantidad    = ?,
                   stock_minimo= ?,
                   proveedor_id= ?,
                   version     = version + 1
            WHERE  id = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `;
        await conn.execute(sqlInventario, [
            dto.cantidad,
            dto.stock_minimo,
            dto.proveedor_id || null,
            Number(id),
        ]);

        await conn.commit();
        return findById(id);

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function remove(id) {
    /*
    Descripcion:
    Borrado logico en inventario y en productos.
    Ambas tablas se desactivan de forma atomica.
    No elimina filas fisicamente.

    Parametros:
    - id: ID del registro de inventario a desactivar.

    Retorna:
    - Objeto mapeado del registro desactivado o null.
    */
    const actual = await findById(id);
    if (!actual) return null;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Borrado logico en inventario
        await conn.execute(`
            UPDATE inventario
            SET    activo     = FALSE,
                   deleted_at = NOW(),
                   version    = version + 1
            WHERE  id = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `, [Number(id)]);

        // 2. Borrado logico en productos
        await conn.execute(`
            UPDATE productos
            SET    activo     = FALSE,
                   deleted_at = NOW(),
                   version    = version + 1
            WHERE  id = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `, [actual.productoId]);

        await conn.commit();
        return { ...actual, activo: false };

    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}