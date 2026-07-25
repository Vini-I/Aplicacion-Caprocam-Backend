/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.model.js
Autor: Jose Espinoza
Fecha: 24/07/2026
Modulo: Productos
Descripcion:
Maneja las consultas SQL directas a la base de datos para Productos,
mapeando los campos del frontend con el esquema real de MySQL.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';

/**
 * Obtiene todos los productos activos mapeados con los nombres de propiedad que espera el Front.
 */
export async function findAll() {
    const [rows] = await pool.query(
        `SELECT 
            id, 
            uuid, 
            grupo_datos AS grupoDatos, 
            proveedor_id AS proveedorId, 
            nombre, 
            categoria, 
            unidad, 
            precio_unidad AS precioUnidad, 
            fecha_ingreso AS entryDate, 
            fecha_caducidad AS expirationDate, 
            estado 
         FROM productos 
         WHERE estado = "ACTIVO" AND deleted_at IS NULL`
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
 * Busca un producto por ID con el mapeo completo de campos.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        `SELECT 
            id, 
            uuid, 
            grupo_datos AS grupoDatos, 
            proveedor_id AS proveedorId, 
            nombre, 
            categoria, 
            unidad, 
            precio_unidad AS precioUnidad, 
            fecha_ingreso AS entryDate, 
            fecha_caducidad AS expirationDate, 
            estado 
         FROM productos 
         WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea un producto procesando el DTO enviado por el Front 
 * (recibe codigo, cantidad, stockMinimo pero inserta en las columnas validas de la BD).
 */
export async function create(dto) {
    const { 
        proveedorId, 
        nombre, 
        categoria, 
        unidad, 
        precioUnidad, 
        entryDate, 
        expirationDate, 
        grupoDatos 
    } = dto;
    
    const gd = grupoDatos ?? 1;

    const [result] = await pool.query(
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

    return {
        id: result.insertId,
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Actualiza un producto por su ID.
 */
export async function update(id, dto) {
    const { 
        proveedorId, 
        nombre, 
        categoria, 
        unidad, 
        precioUnidad, 
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