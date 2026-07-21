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

export async function findAll() {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, nombre, contacto AS cedula, telefono, correo, estado FROM compradores WHERE estado = "ACTIVO" AND deleted_at IS NULL'
    );
    return rows;
}

export async function findById(id) {
    const [rows] = await pool.query(
        'SELECT id, uuid, grupo_datos AS grupoDatos, nombre, contacto AS cedula, telefono, correo, estado FROM compradores WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [id]
    );
    return rows.length > 0 ? rows[0] : null;
}

export async function create(dto) {
    const { nombre, cedula, contacto, telefono, correo, grupoDatos } = dto;
    const valorCedula = cedula || contacto || null;
    const gd = grupoDatos ?? 1;

    const [result] = await pool.query(
        'INSERT INTO compradores (grupo_datos, nombre, contacto, telefono, correo, estado) VALUES (?, ?, ?, ?, ?, "ACTIVO")',
        [gd, nombre, valorCedula, telefono || null, correo || null]
    );

    return {
        id: result.insertId,
        nombre,
        cedula: valorCedula,
        telefono: telefono || null,
        correo: correo || null,
        grupoDatos: gd,
        estado: 'ACTIVO'
    };
}

export async function update(id, dto) {
    const { nombre, cedula, contacto, telefono, correo } = dto;
    const valorCedula = cedula || contacto || null;

    const [result] = await pool.query(
        'UPDATE compradores SET nombre = ?, contacto = ?, telefono = ?, correo = ? WHERE id = ? AND estado = "ACTIVO" AND deleted_at IS NULL',
        [nombre, valorCedula, telefono || null, correo || null, id]
    );

    if (result.affectedRows === 0) return null;

    return {
        id: Number(id),
        nombre,
        cedula: valorCedula,
        telefono: telefono || null,
        correo: correo || null,
        estado: 'ACTIVO'
    };
}

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