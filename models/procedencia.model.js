/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.model.js
Autor: oscar mario-Joan Campos
Fecha: 25/08/2026
Modulo: Procedencia
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";
import { ProcedenciaDTO } from "../dtos/procedencia.dto.js";

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo procedencia.
    
    Parametros:
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Array de objetos ProcedenciaDTO.
    */
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id, activo, fecha_creacion, fecha_actualizacion
         FROM procedencias
         WHERE grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         ORDER BY id DESC`,
        [grupoDatos]
    );
    return rows.map((row) => new ProcedenciaDTO(row));
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de procedencia.
    
    Parametros:
    - id: Identificador unico del registro.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Objeto ProcedenciaDTO o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id, activo, fecha_creacion, fecha_actualizacion
         FROM procedencias
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         LIMIT 1`,
        [id, grupoDatos]
    );
    return rows.length > 0 ? new ProcedenciaDTO(rows[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Registra una nueva procedencia en la base de datos.
    
    Parametros:
    - dto: Objeto ProcedenciaDTO con los datos.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Objeto ProcedenciaDTO del registro creado.
    */
    const [result] = await pool.execute(
        `INSERT INTO procedencias (grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id)
         VALUES (?, ?, ?, ?, ?)`,
        [grupoDatos, dto.nombre, dto.descripcion ?? null, dto.creado_por_usuario_id, dto.creado_por_colaborador_id]
    );
    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de una procedencia.
    
    Parametros:
    - id: Identificador unico del registro.
    - dto: Objeto ProcedenciaDTO con los datos a actualizar.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Objeto ProcedenciaDTO del registro actualizado.
    */
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
    /*
    Descripcion:
    Realiza un borrado logico sobre un registro de procedencia.
    
    Parametros:
    - id: Identificador unico del registro.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Booleano indicando exito.
    */
    const [result] = await pool.execute(
        `UPDATE procedencias
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return result.affectedRows > 0;
}

export async function estaEnUso(procedenciaId, grupoDatos) {
    /*
    Descripcion:
    Verifica si una procedencia esta asignada a algun lote de larva activo.
    
    Parametros:
    - procedenciaId: Identificador unico de la procedencia.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Booleano true si esta en uso, false de lo contrario.
    */
    const [rows] = await pool.execute(`
        SELECT id FROM lotes_larva
        WHERE procedencia_id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
        LIMIT 1
    `, [procedenciaId, grupoDatos]);
    return rows.length > 0;
}