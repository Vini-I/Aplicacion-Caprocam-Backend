/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarvas.model.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Lotes de Larva
Descripcion:
Capa de datos para lotes de larva.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';


/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES 
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `, [grupoDatos]);
    return rows;
}

export async function findById(id, grupoDatos) {
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
    return rows[0] || null;
}

export async function findByCodigo(codigo, grupoDatos) {
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
    `, [codigo, grupoDatos]);
     return rows[0] || null;
}

export async function findByCodigoIgnorandoId(codigo, id, grupoDatos) {
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    id != ?
        LIMIT  1
    `, [codigo, grupoDatos, Number(id)]);
    return rows[0] || null;
}

export async function createLote(dto, grupoDatos) {
    const sql = `
        INSERT INTO lotes_larva (
            grupo_datos,
            codigo_lote,
            proveedor_larva_id,
            laboratorio_id,
            procedencia_id,
            certificado_larva,
            pl_inicial,
            cantidad_inicial,
            fecha_ingreso,
            estado_lote
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
        grupoDatos,
        dto.codigo_lote,
        dto.proveedor_id  || null,
        dto.laboratorio || null,
        dto.lugar_procedencia || null,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        dto.estado_lote || 'Disponible',
    ]);
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    const sql = `
        UPDATE lotes_larva
        SET    codigo_lote       = ?,
               proveedor_larva_id = ?,
               laboratorio_id    = ?,
               procedencia_id    = ?,
               certificado_larva = ?,
               pl_inicial        = ?,
               cantidad_inicial   = ?,
               fecha_ingreso      = ?,
               estado_lote        = ?,
               version           = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [result] = await pool.execute(sql, [
        dto.codigo_lote,
        dto.proveedor_id  || null,
        dto.laboratorio || null,
        dto.lugar_procedencia || null,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        dto.estado_lote || 'Disponible',
        Number(id),
        grupoDatos
    ]);
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    const lote = await findById(id, grupoDatos);
    if (!lote) return null;

    const [result] = await pool.execute(`
        UPDATE lotes_larva
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);

    if (result.affectedRows === 0) return null;
    return { ...lote, activo: false };
}

export async function actualizarEstado(id, estado, grupoDatos) {
    const [result] = await pool.execute(`
        UPDATE lotes_larva
        SET    estado_lote = ?,
               version     = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [estado, Number(id), grupoDatos]);
    return result.affectedRows > 0;
}

export async function verificarProveedorExiste(proveedorId, grupoDatos) {
    if (!proveedorId) return false;
    const [rows] = await pool.execute(`
        SELECT id
        FROM   proveedores_larva
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(proveedorId), grupoDatos]);
    return rows.length > 0;
}