/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.model.js
Autor: Joan Campos
Fecha: 25/08/2026
Modulo: Proveedor Larva
Descripcion:
Capa de acceso a datos para el modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";
import { ProveedorLarvaDTO } from "../dtos/proveedorLarva.dto.js";

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo proveedorLarva.
    
    Parametros:
    - grupoDatos: Entero que identifica el tenant (grupo de datos).

    Retorna:
    - Array de objetos ProveedorLarvaDTO.
    */
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id, activo, fecha_creacion, fecha_actualizacion
         FROM proveedores_larva
         WHERE grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         ORDER BY id DESC`,
        [grupoDatos]
    );
    return rows.map((row) => new ProveedorLarvaDTO(row));
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de proveedorLarva mediante su identificador unico.
    
    Parametros:
    - id: Identificador unico del registro.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Objeto ProveedorLarvaDTO o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `SELECT id, uuid, grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id, activo, fecha_creacion, fecha_actualizacion
         FROM proveedores_larva
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL AND activo = TRUE
         LIMIT 1`,
        [id, grupoDatos]
    );
    return rows.length > 0 ? new ProveedorLarvaDTO(rows[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Registra una nueva entidad de proveedorLarva en la base de datos.
    
    Parametros:
    - dto: Objeto ProveedorLarvaDTO con los datos.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Objeto ProveedorLarvaDTO del registro creado.
    */
    const [result] = await pool.execute(
        `INSERT INTO proveedores_larva (grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id)
         VALUES (?, ?, ?, ?, ?)`,
        [grupoDatos, dto.nombre, dto.descripcion ?? null, dto.creado_por_usuario_id, dto.creado_por_colaborador_id]
    );
    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de proveedorLarva.
    
    Parametros:
    - id: Identificador unico del registro.
    - dto: Objeto ProveedorLarvaDTO con los datos a actualizar.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Objeto ProveedorLarvaDTO del registro actualizado.
    */
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
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de proveedorLarva.
    
    Parametros:
    - id: Identificador unico del registro.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Booleano indicando si se elimino correctamente.
    */
    const [result] = await pool.execute(
        `UPDATE proveedores_larva
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return result.affectedRows > 0;
}

export async function estaEnUso(proveedorId, grupoDatos) {
    /*
    Descripcion:
    Verifica si un proveedor de larva esta asignado a algun lote de larva activo.
    
    Parametros:
    - proveedorId: Identificador unico del proveedor.
    - grupoDatos: Entero que identifica el tenant.

    Retorna:
    - Booleano true si esta en uso, false si no lo esta.
    */
    const [rows] = await pool.execute(`
        SELECT id FROM lotes_larva
        WHERE proveedor_larva_id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
        LIMIT 1
    `, [proveedorId, grupoDatos]);
    return rows.length > 0;
}