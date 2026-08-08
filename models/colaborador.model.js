/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.model.js
Autor: Marco Vásquez
Fecha: 08/08/2026
Modulo: Colaboradores
Descripcion:
Capa de datos del modulo de colaboradores (sin roles).
Conectado a MySQL via pool. Usa borrado logico y soporte
para busquedas por cedula para el flujo APK movil.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';

function mapearColaborador(fila) {
    return {
        id:                 fila.id,
        uuid:               fila.uuid,
        grupoDatos:         fila.grupo_datos,
        fincaId:            fila.finca_id,
        nombre:             fila.nombre,
        apellidos:          fila.apellidos,
        cedula:             fila.cedula,
        telefono:           fila.telefono,
        email:              fila.email,
        nombreUsuario:      fila.nombre_usuario,
        tipoColaborador:    fila.tipo_colaborador,
        activo:             fila.activo,
        fechaCreacion:      fila.fecha_creacion,
        fechaActualizacion: fila.fecha_actualizacion,
    };
}

export async function findAll(grupoDatos) {
    const [filas] = await pool.query(
        `SELECT * FROM colaboradores
         WHERE grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearColaborador);
}

export async function findById(id, grupoDatos) {
    const [filas] = await pool.query(
        `SELECT * FROM colaboradores
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearColaborador(filas[0]) : null;
}

export async function findByCedula(cedula) {
    const [filas] = await pool.query(
        `SELECT * FROM colaboradores
         WHERE cedula = ? AND activo = TRUE AND deleted_at IS NULL`,
        [cedula]
    );
    return filas.length > 0 ? mapearColaborador(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    const [result] = await pool.query(
        `INSERT INTO colaboradores
         (grupo_datos, finca_id, nombre, apellidos, cedula,
          telefono, email, nombre_usuario, pin_hash, tipo_colaborador)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            grupoDatos,
            dto.fincaId,
            dto.nombre,
            dto.apellidos,
            dto.cedula,
            dto.telefono,
            dto.email,
            dto.nombreUsuario,
            dto.pinHash,
            dto.tipoColaborador,
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    let querySQL = `UPDATE colaboradores
         SET finca_id = ?, nombre = ?, apellidos = ?,
             cedula = ?, telefono = ?, email = ?, tipo_colaborador = ?`;
    const params = [
        dto.fincaId,
        dto.nombre,
        dto.apellidos,
        dto.cedula,
        dto.telefono,
        dto.email,
        dto.tipoColaborador,
    ];

    if (dto.pinHash) {
        querySQL += `, pin_hash = ?`;
        params.push(dto.pinHash);
    }

    querySQL += `, version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`;
    params.push(id, grupoDatos);

    const [result] = await pool.query(querySQL, params);

    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    const colaborador = await findById(id, grupoDatos);
    if (!colaborador) return null;

    await pool.query(
        `UPDATE colaboradores
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return colaborador;
}