/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.model.js
Autor: Jose Espinoza
Fecha: 24/07/2026
Modulo: Productos
Descripcion:
Maneja las consultas SQL directas a la base de datos para Productos e
inserta la entrada inicial de inventario en la tabla correspondiente.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';

/**
 * Obtiene todos los productos activos mapeados con los nombres de propiedad que espera el Front.
 */
export async function findAll() {
    const [rows] = await pool.query(
        `SELECT 
            p.id, 
            p.uuid, 
            p.grupo_datos AS grupoDatos, 
            p.proveedor_id AS proveedorId, 
            p.nombre, 
            p.categoria, 
            p.unidad, 
            p.precio_unidad AS precioUnidad, 
            COALESCE(i.cantidad, 0) AS cantidad,
            COALESCE(i.stock_minimo, 0) AS stockMinimo,
            p.fecha_ingreso AS entryDate, 
            p.fecha_caducidad AS expirationDate, 
            p.estado 
         FROM productos p
         LEFT JOIN inventario i ON p.id = i.producto_id
         WHERE p.estado = "ACTIVO" AND p.deleted_at IS NULL`
    );
    return rows;
}

/**
 * Búsqueda recortada por nombre limpia para el combo box/autocompletado.
 */
export async function findByName(nombre) {
    const [rows] = await pool.query(
        `SELECT 
            p.id,
            p.nombre, 
            p.categoria, 
            p.precio_unidad AS precioUnidad, 
            p.proveedor_id AS proveedorId
         FROM productos p 
         WHERE p.nombre LIKE ? AND p.estado = "ACTIVO" AND p.deleted_at IS NULL`,
        [`%${nombre}%`]
    );
    return rows;
}

/**
 * Busca un producto por ID con el mapeo completo de campos e información de inventario.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        `SELECT 
            p.id, 
            p.uuid, 
            p.grupo_datos AS grupoDatos, 
            p.proveedor_id AS proveedorId, 
            p.nombre, 
            p.categoria, 
            p.unidad, 
            p.precio_unidad AS precioUnidad, 
            COALESCE(i.cantidad, 0) AS cantidad,
            COALESCE(i.stock_minimo, 0) AS stockMinimo,
            p.fecha_ingreso AS entryDate, 
            p.fecha_caducidad AS expirationDate, 
            p.estado 
         FROM productos p
         LEFT JOIN inventario i ON p.id = i.producto_id
         WHERE p.id = ? AND p.estado = "ACTIVO" AND p.deleted_at IS NULL`,
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea un producto y automáticamente registra el saldo inicial en la tabla inventario.
 */
export async function create(dto) {
    const { 
        proveedorId, 
        nombre, 
        categoria, 
        unidad, 
        precioUnidad, 
        cantidad,
        stockMinimo,
        entryDate, 
        expirationDate, 
        grupoDatos 
    } = dto;
    
    const gd = grupoDatos ?? 1;

    // 1. Insertar en la tabla productos
    const [resultProducto] = await pool.query(
        `INSERT INTO productos 
            (grupo_datos, proveedor_id, nombre, categoria, unidad, precio_unidad, fecha_ingreso, fecha_caducidad, estado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, "ACTIVO")`,
        [
            gd, 
            proveedorId || null, 
            nombre, 
            categoria || null, 
            unidad || 'unidades', 
            precioUnidad || 0, 
            entryDate || null, 
            expirationDate || null
        ]
    );

    const productoId = resultProducto.insertId;

    // 2. Insertar automáticamente el saldo inicial en la tabla inventario
    try {
        await pool.query(
            `INSERT INTO inventario (producto_id, cantidad, stock_minimo, grupo_datos) 
             VALUES (?, ?, ?, ?)`,
            [productoId, cantidad || 0, stockMinimo || 0, gd]
        );
    } catch (invError) {
        console.warn("Aviso: No se pudo insertar en la tabla inventario directamente:", invError.message);
    }

    return {
        id: productoId,
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Actualiza un producto por su ID y actualiza su registro en inventario.
 */
export async function update(id, dto) {
    const { 
        proveedorId, 
        nombre, 
        categoria, 
        unidad, 
        precioUnidad, 
        cantidad,
        stockMinimo,
        entryDate, 
        expirationDate 
    } = dto;

    const [result] = await pool.query(
        `UPDATE productos 
         SET proveedor_id = ?, nombre = ?, categoria = ?, unidad = ?, precio_unidad = ?, fecha_ingreso = ?, fecha_caducidad = ? 
         WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [
            proveedorId || null, 
            nombre, 
            categoria || null, 
            unidad || 'unidades', 
            precioUnidad || 0, 
            entryDate || null, 
            expirationDate || null, 
            id
        ]
    );

    if (result.affectedRows === 0) return null;

    // Actualizar inventario si existe
    try {
        await pool.query(
            `UPDATE inventario SET cantidad = ?, stock_minimo = ? WHERE producto_id = ?`,
            [cantidad || 0, stockMinimo || 0, id]
        );
    } catch (invError) {
        console.warn("Aviso: No se pudo actualizar en la tabla inventario:", invError.message);
    }

    return {
        id: Number(id),
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Borrado lógico (estado INACTIVO).
 */
export async function removeLogicamente(id) {
    const producto = await findById(id);
    if (!producto) return null;

    const [result] = await pool.query(
        'UPDATE productos SET estado = "INACTIVO", deleted_at = NOW() WHERE id = ?',
        [id]
    );

    if (result.affectedRows === 0) return null;

    producto.estado = 'INACTIVO';
    return producto;
}