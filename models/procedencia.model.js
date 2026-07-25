/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.model.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Procedencia
Descripcion:
Capa de acceso a datos para el modulo de procedencia.
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";
import { ProcedenciaDTO } from "../dtos/procedencia.dto.js";

export async function findAll(grupoDatos) {
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion
         FROM procedencias
         WHERE grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         ORDER BY id DESC`,
        [grupoDatos]
    );
    return rows.map((row) => new ProcedenciaDTO(row));
}

export async function findById(id, grupoDatos) {
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion
         FROM procedencias
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         LIMIT 1`,
        [id, grupoDatos]
    );
    return rows.length > 0 ? new ProcedenciaDTO(rows[0]) : null;
}

export async function create(dto, grupoDatos) {
    const [result] = await pool.execute(
        `INSERT INTO procedencias (grupo_datos, nombre, descripcion)
         VALUES (?, ?, ?)`,
        [grupoDatos, dto.nombre, dto.descripcion ?? null]
    );
    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    await pool.execute(
        `UPDATE procedencias
         SET nombre = COALESCE(?, nombre),
             descripcion = COALESCE(?, descripcion)
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [dto.nombre ?? null, dto.descripcion ?? null, id, grupoDatos]
    );
    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    const [result] = await pool.execute(
        `UPDATE procedencias
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return result.affectedRows > 0;
}