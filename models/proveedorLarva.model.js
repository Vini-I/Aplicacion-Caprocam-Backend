/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.model.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Proveedor Larva
Descripcion:
Capa de acceso a datos para el modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";
import { ProveedorLarvaDTO } from "../dtos/proveedorLarva.dto.js";

export async function findAll(grupoDatos) {
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion
         FROM proveedores_larva
         WHERE grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         ORDER BY id DESC`,
        [grupoDatos]
    );
    return rows.map((row) => new ProveedorLarvaDTO(row));
}

export async function findById(id, grupoDatos) {
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion
         FROM proveedores_larva
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         LIMIT 1`,
        [id, grupoDatos]
    );
    return rows.length > 0 ? new ProveedorLarvaDTO(rows[0]) : null;
}

export async function create(dto, grupoDatos) {
    const [result] = await pool.execute(
        `INSERT INTO proveedores_larva (grupo_datos, nombre, descripcion)
         VALUES (?, ?, ?)`,
        [grupoDatos, dto.nombre, dto.descripcion ?? null]
    );
    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    await pool.execute(
        `UPDATE proveedores_larva
         SET nombre = COALESCE(?, nombre),
             descripcion = COALESCE(?, descripcion)
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [dto.nombre ?? null, dto.descripcion ?? null, id, grupoDatos]
    );
    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    const [result] = await pool.execute(
        `UPDATE proveedores_larva
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return result.affectedRows > 0;
}