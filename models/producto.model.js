/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.model.js
Autor: Jose Espinoza
Fecha: 20/07/2026
Modulo: Productos
Descripcion:
Maneja las consultas SQL directas a la base de datos para la entidad de Productos.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';

/**
 * Obtiene todos los productos activos de la base de datos.
 */
export async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, proveedor_id AS proveedorId, nombre, categoria, unidad, precio_unidad AS precioUnidad, fecha_ingreso AS fechaIngreso, fecha_caducidad AS fechaCaducidad, estado FROM productos WHERE estado = "ACTIVO" AND deleted_at IS NULL'
    );
    return rows;
}

/**
 * Busca un producto activo por su ID.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, proveedor_id AS proveedorId, nombre, categoria, unidad, precio_unidad AS precioUnidad, fecha_ingreso AS fechaIngreso, fecha_caducidad AS fechaCaducidad, estado FROM productos WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Registra un nuevo producto en la base de datos a partir de su DTO.
 */
export async function create(dto) {
    const { proveedorId, nombre, categoria, unidad, precioUnidad, fechaIngreso, fechaCaducidad, grupoDatos } = dto;
    const gd = grupoDatos ?? 1;

    const [result] = await pool.query(
        'INSERT INTO productos (grupo_datos, proveedor_id, nombre, categoria, unidad, precio_unidad, fecha_ingreso, fecha_caducidad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "ACTIVO")',
        [gd, proveedorId || null, nombre, categoria || null, unidad || null, precioUnidad || 0, fechaIngreso || null, fechaCaducidad || null]
    );

    return {
        id: result.insertId,
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Actualiza la información de un producto por su ID.
 */
export async function update(id, dto) {
    const { proveedorId, nombre, categoria, unidad, precioUnidad, fechaIngreso, fechaCaducidad } = dto;

    const [result] = await pool.query(
        'UPDATE productos SET proveedor_id = ?, nombre = ?, categoria = ?, unidad = ?, precio_unidad = ?, fecha_ingreso = ?, fecha_caducidad = ? WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [proveedorId || null, nombre, categoria || null, unidad || null, precioUnidad || 0, fechaIngreso || null, fechaCaducidad || null, id]
    );

    if (result.affectedRows === 0) return null;

    return {
        id: Number(id),
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Realiza un borrado lógico cambiando el estado del producto a INACTIVO.
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