/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.model.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Pre-Cria
Descripcion:
Capa de datos para pre-crias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { EstadoLote } from "../dtos/loteLarva.dto.js";

import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
constantes
//////////////////////////////////////////////////////////
*/

const GRUPO_DATOS = 1;


/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll() {
    const [rows] = await pool.execute(`
        SELECT *
        FROM   precrias
        WHERE  grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `, [GRUPO_DATOS]);
    return rows;
}
 
export async function findById(id) {
    const [rows] = await pool.execute(`
        SELECT *
        FROM   precrias
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), GRUPO_DATOS]);
    return rows[0] || null;
}
 
export async function create(dto) {
    /*
    Descripcion:
    Crea una pre-cria y transiciona el lote asociado a
    'En PreCria' (solo si estaba 'Disponible'), en una sola
    transaccion.
    */
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
 
        const [result] = await connection.execute(`
            INSERT INTO precrias (
                grupo_datos, lote_larva_id, finca_id, estanque_id,
                fecha_inicio, fecha_fin, duracion_dias,
                cantidad_inicial, cantidad_final, pl_inicial, pl_final, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
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
 
        await connection.execute(`
            UPDATE lotes_larva
            SET    estado_lote = ?,
                   version     = version + 1
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    estado_lote = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `, [
            EstadoLote.EN_PRECRIA,
            dto.lote_larva_id,
            GRUPO_DATOS,
            EstadoLote.DISPONIBLE,
        ]);
 
        await connection.commit();
        return findById(result.insertId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
 
export async function update(id, datos) {
    /*
    Descripcion:
    Actualiza una pre-cria activa. Solo actualiza los campos
    presentes en "datos" (actualizacion parcial), usado tambien
    por finalizarPrecria en el controller.
    */
    const mapaCampos = {
        lote_larva_id:    'lote_larva_id',
        finca_id:         'finca_id',
        estanque_id:      'estanque_id',
        fecha_inicio:     'fecha_inicio',
        cantidad_inicial: 'cantidad_inicial',
        pl_inicial:       'pl_inicial',
        estado:           'estado',
        fecha_fin:        'fecha_fin',
        cantidad_final:   'cantidad_final',
        pl_final:         'pl_final',
        duracion_dias:    'duracion_dias',
    };
 
    const setParts = [];
    const valores  = [];
 
    for (const [clave, columna] of Object.entries(mapaCampos)) {
        if (datos[clave] !== undefined) {
            setParts.push(`${columna} = ?`);
            valores.push(datos[clave]);
        }
    }
    if (setParts.length === 0) return findById(id);
 
    setParts.push('version = version + 1');
    valores.push(Number(id), GRUPO_DATOS);
 
    const [result] = await pool.execute(`
        UPDATE precrias
        SET    ${setParts.join(', ')}
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, valores);
 
    if (result.affectedRows === 0) return null;
    return findById(id);
}
 
export async function remove(id) {
    const pc = await findById(id);
    if (!pc) return null;
 
    const [result] = await pool.execute(`
        UPDATE precrias
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), GRUPO_DATOS]);
 
    if (result.affectedRows === 0) return null;
    return { ...pc, activo: false };
}
 
 
export async function verificarFincaExiste(fincaId) {
    if (!fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM fincas
        WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
    `, [Number(fincaId), GRUPO_DATOS]);
    return rows.length > 0;
}
 
export async function verificarEstanqueExiste(estanqueId, fincaId) {
    if (!estanqueId || !fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM estanques
        WHERE id = ? AND finca_id = ? AND grupo_datos = ?
        AND activo = TRUE AND deleted_at IS NULL
    `, [Number(estanqueId), Number(fincaId), GRUPO_DATOS]);
    return rows.length > 0;
}
 