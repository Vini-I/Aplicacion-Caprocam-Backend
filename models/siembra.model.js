/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.model.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Capa de datos para lotes de larva y pre-crias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import * as proveedorModel from "./proveedor.model.js";

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/


/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES - LOTES DE LARVA
//////////////////////////////////////////////////////////
*/

export async function findLotesAll() {
    /*
    Descripcion:
    Obtiene todos los lotes de larva activos.
    */
        const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `);
    return rows;
}

export async function findLoteById(id) {
    /*
    Descripcion:
    Busca un lote de larva activo por su ID.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id)]);
    return rows[0] || null;
}

export async function findLoteByCodigo(codigo) {
    /*
    Descripcion:
    Busca un lote activo por su codigo (case-insensitive).
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
    `, [codigo]);
     return rows[0] || null;
}

export async function findLoteByCodigoIgnorandoId(codigo, id) {
    /*
    Descripcion:
    Busca un lote por codigo ignorando un ID especifico.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    id != ?
        LIMIT  1
    `, [codigo, Number(id)]);
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
    return findLoteById(result.insertId);
}

export async function updateLote(id, dto) {
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
    ]);
    if (result.affectedRows === 0) return null;
    return findLoteById(id);
}

export async function removeLote(id) {
    /*
    Descripcion:
    Borrado logico de un lote de larva.
    */
    const lote = await findLoteById(id);
    if (!lote) return null;

    const [result] = await pool.execute(`
        UPDATE lotes_larva
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id)]);

    if (result.affectedRows === 0) return null;
    return { ...lote, activo: false };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES - PRE-CRIAS
//////////////////////////////////////////////////////////
*/

export async function findPrecriasAll() {
    /*
    Descripcion:
    Obtiene todas las pre-crias activas.
    */
        const [rows] = await pool.execute(`
        SELECT *
        FROM   precrias
        WHERE  activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `);
    return rows;
}

export async function findPrecriaById(id) {
    /*
    Descripcion:
    Busca una pre-cria activa por su ID.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   precrias
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id)]);
    return rows[0];
}

export async function createPrecria(dto) {
    /*
    Descripcion:
    Crea una nueva pre-cria.
    */
    const sql = `
        INSERT INTO precrias (
            grupo_datos,
            lote_larva_id,
            finca_id,
            estanque_id,
            fecha_inicio,
            fecha_fin,
            duracion_dias,
            cantidad_inicial,
            cantidad_final,
            pl_inicial,
            pl_final,
            estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
        GRUPO_DATOS,
        dto.lote_larva_id,
        dto.finca_id,
        dto.estanque_id,
        dto.fecha_inicio,
        dto.fecha_fin,
        dto.duracion_dias,
        dto.cantidad_inicial,
        dto.cantidad_final,
        dto.pl_inicial,
        dto.pl_final,
        dto.estado || 'Activa',
    ]);
    return findPrecriaById(result.insertId);
}

export async function updatePrecria(id, datos) {
    /*
    Descripcion:
    Actualiza una pre-cria activa.
    */
    const mapaCampos = {
        lote_larva_id:   'lote_larva_id',
        finca_id:        'finca_id',
        estanque_id:     'estanque_id',
        fecha_inicio:    'fecha_inicio',
        cantidad_inicial:'cantidad_inicial',
        pl_inicial:      'pl_inicial',
        estado:          'estado',
        fecha_fin:       'fecha_fin',
        cantidad_final:  'cantidad_final',
        pl_final:        'pl_final',
        duracion_dias:   'duracion_dias',
    };

    const setParts = [];
    const valores  = [];

    for (const [clave, columna] of Object.entries(mapaCampos)) {
        if (datos[clave] !== undefined) {
            setParts.push(`${columna} = ?`);
            valores.push(datos[clave]);
        }
    }

    if (setParts.length === 0) return findPrecriaById(id);

    setParts.push('version = version + 1');
    valores.push(Number(id));

    const sql = `
        UPDATE precrias
        SET    ${setParts.join(', ')}
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const [result] = await pool.execute(sql, valores);
    if (result.affectedRows === 0) return null;
    return findPrecriaById(id);
}

export async function removePrecria(id) {
    /*
    Descripcion:
    Borrado logico de una pre-cria.
    */
    const pc = await findPrecriaById(id);
    if (!pc) return null;

    const [result] = await pool.execute(`
        UPDATE precrias
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id)]);

    if (result.affectedRows === 0) return null;
    return { ...pc, activo: false };
}

export async function verificarProveedorExiste(proveedorId) {
    /*
    Descripcion:
    Verifica que el nombre del proveedor exista en el modulo de proveedores.
    */
    if (!proveedorId) return false;
    const [rows] = await pool.execute(`
        SELECT id
        FROM   proveedores
        WHERE  id = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(proveedorId)]);
    return rows.length > 0;
}