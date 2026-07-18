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

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import pool from '../config/db.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

/**
 * Obtiene todos los productos que estén activos en la base de datos.
 */
export async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, nombre, categoria, cantidad, stock_minimo AS stockMinimo, precio_unidad AS precioUnidad, estado FROM productos WHERE estado = "ACTIVO"'
    );
    return rows;
}

/**
 * Busca un producto activo específico por su ID.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, nombre, categoria, cantidad, stock_minimo AS stockMinimo, precio_unidad AS precioUnidad, estado FROM productos WHERE id = ? AND estado = "ACTIVO"',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Inserta un nuevo producto utilizando un objeto DTO.
 */
export async function create(dto) {
    const { nombre, categoria, cantidad, stockMinimo, precioUnidad } = dto;
    
    const [result] = await pool.query(
        'INSERT INTO productos (nombre, categoria, cantidad, stock_minimo, precio_unidad, estado) VALUES (?, ?, ?, ?, ?, "ACTIVO")',
        [nombre, categoria, cantidad, stockMinimo, precioUnidad]
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
    const { nombre, categoria, cantidad, stockMinimo, precioUnidad } = dto;

    const [result] = await pool.query(
        'UPDATE productos SET nombre = ?, categoria = ?, cantidad = ?, stock_minimo = ?, precio_unidad = ? WHERE id = ? AND estado = "ACTIVO"',
        [nombre, categoria, cantidad, stockMinimo, precioUnidad, id]
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
        'UPDATE productos SET estado = "INACTIVO" WHERE id = ?',
        [id]
    );

    if (result.affectedRows === 0) return null;

    producto.estado = 'INACTIVO';
    return producto;
}