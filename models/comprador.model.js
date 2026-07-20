/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.model.js
Autor: Jose Espinoza
Fecha: 20/07/2026
Modulo: Compradores
Descripcion:
Maneja las consultas SQL directas a la base de datos para la entidad de Compradores.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';

/**
 * Obtiene todos los compradores activos de la base de datos.
 */
export async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, nombre, contacto, telefono, correo, notas, direccion, estado FROM compradores WHERE estado = "ACTIVO" AND deleted_at IS NULL'
    );
    return rows;
}

/**
 * Busca un comprador activo por su ID.
 */
export async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, nombre, contacto, telefono, correo, notas, direccion, estado FROM compradores WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Registra un nuevo comprador en la base de datos a partir de su DTO.
 */
export async function create(dto) {
    const { nombre, contacto, telefono, correo, direccion, notas, grupoDatos } = dto;
    const gd = grupoDatos ?? 1;

    const [result] = await pool.query(
        'INSERT INTO compradores (grupo_datos, nombre, contacto, telefono, correo, direccion, notas, estado) VALUES (?, ?, ?, ?, ?, ?, ?, "ACTIVO")',
        [gd, nombre, contacto, telefono || null, correo || null, direccion || null, notas || null]
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
    const { nombre, contacto, telefono, correo, direccion, notas } = dto;

    const [result] = await pool.query(
        'UPDATE compradores SET nombre = ?, contacto = ?, telefono = ?, correo = ?, direccion = ?, notas = ? WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [nombre, contacto, telefono || null, correo || null, direccion || null, notas || null, id]
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
        'UPDATE compradores SET estado = "INACTIVO", deleted_at = NOW() WHERE id = ?',
        [id]
    );

    if (result.affectedRows === 0) return null;

    comprador.estado = 'INACTIVO';
    return comprador;
}