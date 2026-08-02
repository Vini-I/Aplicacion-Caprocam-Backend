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
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo proveedorLarva.
    Parametros:
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
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
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
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
    Registra una nueva entidad de proveedorLarva en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [result] = await pool.execute(
        `INSERT INTO proveedores_larva (grupo_datos, nombre, descripcion, creado_por_usuario_id, creado_por_colaborador_id)
         VALUES (?, ?, ?, ?, ?)`,
        [grupoDatos, dto.nombre, dto.descripcion ?? null, dto.creadoPorUsuarioId ?? null, dto.creadoPorColaboradorId ?? null]
    );
    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de proveedorLarva, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
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
    Realiza un borrado logico (soft-delete) sobre un registro de proveedorLarva, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [result] = await pool.execute(
        `UPDATE proveedores_larva
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return result.affectedRows > 0;
}