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

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/


import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
cosntantes 
//////////////////////////////////////////////////////////
*/

const GRUPO_DATOS = 1;


/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES 
//////////////////////////////////////////////////////////
*/

export async function findAll() {
    /*
    Descripcion:
    Obtiene todos los lotes de larva activos.
    */
        const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `, [GRUPO_DATOS]);
    return rows;
}

export async function findById(id) {
    /*
    Descripcion:
    Busca un lote de larva activo por su ID.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), GRUPO_DATOS]);
    return rows[0] || null;
}

export async function findByCodigo(codigo) {
    /*
    Descripcion:
    Busca un lote activo por su codigo (case-insensitive).
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
    `, [codigo, GRUPO_DATOS]);
     return rows[0] || null;
}

export async function findByCodigoIgnorandoId(codigo, id) {
    /*
    Descripcion:
    Busca un lote por codigo ignorando un ID especifico.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    id != ?
        LIMIT  1
    `, [codigo, GRUPO_DATOS, Number(id)]);
    return rows[0] || null;
}

export async function createLote(dto) {
    /*
    Descripcion:
    Crea un nuevo lote de larva.
    */
    const sql = `
        INSERT INTO lotes_larva (
            grupo_datos,
            codigo_lote,
            proveedor_id,
            laboratorio,
            lugar_procedencia,
            certificado_larva,
            pl_inicial,
            cantidad_inicial,
            fecha_ingreso,
            estado_lote
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
        GRUPO_DATOS,
        dto.codigo_lote,
        dto.proveedor_id  || null,
        dto.laboratorio,
        dto.lugar_procedencia,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        dto.estado_lote || 'Disponible',
    ]);
    return findById(result.insertId);
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza un lote de larva activo.
    */
    const sql = `
        UPDATE lotes_larva
        SET    codigo_lote       = ?,
               proveedor_id      = ?,
               laboratorio       = ?,
               lugar_procedencia = ?,
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
        dto.laboratorio,
        dto.lugar_procedencia,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        dto.estado_lote || 'Disponible',
        Number(id),
        GRUPO_DATOS
    ]);
    if (result.affectedRows === 0) return null;
    return findById(id);
}

export async function remove(id) {
    /*
    Descripcion:
    Borrado logico de un lote de larva.
    */
    const lote = await findById(id);
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
    `, [Number(id), GRUPO_DATOS]);

    if (result.affectedRows === 0) return null;
    return { ...lote, activo: false };
}

export async function actualizarEstado(id, estado) {
    /*
    Descripcion:
    Actualiza unicamente el estado_lote. Pensada para ser llamada
    desde precria.model.js / siembra.model.js al transicionar el
    ciclo de vida del lote (Disponible -> En PreCria -> Sembrado).
 
    Parametros:
    - id:     ID del lote.
    - estado: Nuevo valor de estado_lote (debe ser un valor exacto del ENUM).
 
    Retorna:
    - true si se actualizo, false si el lote no existe/no esta activo.
    */
    const [result] = await pool.execute(`
        UPDATE lotes_larva
        SET    estado_lote = ?,
               version     = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [estado, Number(id), GRUPO_DATOS]);
    return result.affectedRows > 0;
}

export async function verificarProveedorExiste(proveedorId) {
    if (!proveedorId) return false;
    const [rows] = await pool.execute(`
        SELECT id
        FROM   proveedores
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(proveedorId), GRUPO_DATOS]);
    return rows.length > 0;
}