/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.model.js
Autor: Jose Espinoza
Fecha: 05/07/2026
Modulo: Productos
Descripcion:
Maneja las consultas SQL directas a la base de datos para la entidad de Productos.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';

/**
 * Obtiene todos los productos que estén activos en la base de datos.
 */
export async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, proveedor_id AS proveedorId, nombre, categoria, unidad, precio_unidad AS precioUnidad, estado FROM productos WHERE estado = "ACTIVO" AND deleted_at IS NULL'
    );
    return rows;
}

/**
 * Busca un producto activo específico por su ID.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, proveedor_id AS proveedorId, nombre, categoria, unidad, precio_unidad AS precioUnidad, estado FROM productos WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Inserta un nuevo producto utilizando un objeto DTO.
 */
export async function create(dto) {
    const { nombre, categoria, unidad, precioUnidad, proveedorId, grupoDatos } = dto;
    const gd = grupoDatos ?? 1;
    const provId = proveedorId ?? null;
    
    const [result] = await pool.query(
        'INSERT INTO productos (grupo_datos, proveedor_id, nombre, categoria, unidad, precio_unidad, estado) VALUES (?, ?, ?, ?, ?, ?, "ACTIVO")',
        [gd, provId, nombre, categoria, unidad, precioUnidad]
    );

    return {
        id: result.insertId,
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Actualiza los datos de un producto existente por su ID.
 */
export async function update(id, dto) {
    const { nombre, categoria, unidad, precioUnidad, proveedorId } = dto;
    const provId = proveedorId ?? null;

    const [result] = await pool.query(
        'UPDATE productos SET nombre = ?, categoria = ?, unidad = ?, precio_unidad = ?, proveedor_id = ? WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [nombre, categoria, unidad, precioUnidad, provId, id]
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