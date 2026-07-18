/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.model.js
Autor: Jose Espinoza
Fecha: 05/07/2026
Modulo: Compradores
Descripcion:
Maneja las consultas SQL directas a la base de datos para la entidad de Compradores.
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
 * Obtiene todos los compradores activos de la base de datos.
 */
export async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, nombre, contacto, telefono, estado FROM compradores WHERE estado = "ACTIVO"'
    );
    return rows;
}

/**
 * Busca un comprador activo por su ID.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, nombre, contacto, telefono, estado FROM compradores WHERE id = ? AND estado = "ACTIVO"',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Registra un nuevo comprador en la base de datos a partir de su DTO.
 */
export async function create(dto) {
    const { nombre, contacto, telefono } = dto;

    const [result] = await pool.query(
        'INSERT INTO compradores (nombre, contacto, telefono, estado) VALUES (?, ?, ?, "ACTIVO")',
        [nombre, contacto, telefono || null]
    );

    return {
        id: result.insertId,
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Actualiza la información de un comprador por su ID.
 */
export async function update(id, dto) {
    const { nombre, contacto, telefono } = dto;

    const [result] = await pool.query(
        'UPDATE compradores SET nombre = ?, contacto = ?, telefono = ? WHERE id = ? AND estado = "ACTIVO"',
        [nombre, contacto, telefono || null, id]
    );

    if (result.affectedRows === 0) return null;

    return {
        id: Number(id),
        ...dto,
        estado: 'ACTIVO'
    };
}

/**
 * Realiza un borrado lógico cambiando el estado del comprador a INACTIVO.
 */
export async function removeLogicamente(id) {
    const comprador = await findById(id);
    if (!comprador) return null;

    const [result] = await pool.query(
        'UPDATE compradores SET estado = "INACTIVO" WHERE id = ?',
        [id]
    );

    if (result.affectedRows === 0) return null;

    comprador.estado = 'INACTIVO';
    return comprador;
}