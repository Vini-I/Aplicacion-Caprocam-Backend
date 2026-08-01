/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.model.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Capa de datos para siembra.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { EstadoLote }from "../dtos/loteLarva.dto.js";

import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo siembra.
    Parametros:
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [rows] = await pool.execute(`
        SELECT *
        FROM   siembras
        WHERE  grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY id ASC
    `, [grupoDatos]);
    return rows;
}
 
export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de siembra mediante su identificador unico.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [rows] = await pool.execute(`
        SELECT *
        FROM   siembras
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
    return rows[0] || null;
}
 
export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Registra una nueva entidad de siembra en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */

/*
    Descripcion:
    Crea una siembra y transiciona el lote asociado a 'Sembrado',
    en una sola transaccion.
    */
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
 
        const [result] = await connection.execute(`
            INSERT INTO siembras (
                grupo_datos, lote_larva_id, precria_id, finca_id, estanque_id,
                fecha_siembra, tecnica_cultivo, densidad_poblacional,
                cantidad_sembrada, pl_siembra, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            grupoDatos,
            dto.lote_larva_id,
            dto.precria_id,
            dto.finca_id,
            dto.estanque_id,
            dto.fecha_siembra,
            dto.tecnica_cultivo,
            dto.densidad_poblacional,
            dto.cantidad_sembrada,
            dto.pl_siembra,
            dto.estado || 'Activa',
        ]);
 
        await connection.execute(`
            UPDATE lotes_larva
            SET    estado_lote = ?,
                   version     = version + 1
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `, [EstadoLote.SEMBRADO, dto.lote_larva_id, grupoDatos]);
 
        await connection.commit();
        return findById(result.insertId, grupoDatos);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
 
export async function update(id, grupoDatos, datos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de siembra, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.
    - datos: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */

/*
    Descripcion:
    Actualiza una siembra activa. Solo actualiza los campos
    presentes en "datos" (actualizacion parcial).
    */
    const mapaCampos = {
        lote_larva_id:         'lote_larva_id',
        precria_id:            'precria_id',
        finca_id:              'finca_id',
        estanque_id:           'estanque_id',
        fecha_siembra:         'fecha_siembra',
        tecnica_cultivo:       'tecnica_cultivo',
        densidad_poblacional:  'densidad_poblacional',
        cantidad_sembrada:     'cantidad_sembrada',
        pl_siembra:            'pl_siembra',
        estado:                'estado',
    };
 
    const setParts = [];
    const valores  = [];
 
    for (const [clave, columna] of Object.entries(mapaCampos)) {
        if (datos[clave] !== undefined) {
            setParts.push(`${columna} = ?`);
            valores.push(datos[clave]);
        }
    }
    if (setParts.length === 0) return findById(id, grupoDatos);
 
    setParts.push('version = version + 1');
    valores.push(Number(id), grupoDatos);
 
    const [result] = await pool.execute(`
        UPDATE siembras
        SET    ${setParts.join(', ')}
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, valores);
 
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}
 
export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de siembra, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const siembra = await findById(id, grupoDatos);
    if (!siembra) return null;
 
    const [result] = await pool.execute(`
        UPDATE siembras
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
 
    if (result.affectedRows === 0) return null;
    return { ...siembra, activo: false };
}
 
 
export async function verificarFincaExiste(fincaId, grupoDatos) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'verificarFincaExiste' en el modulo siembra.
    Parametros:
    - fincaId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
if (!fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM fincas
        WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
    `, [Number(fincaId), grupoDatos]);
    return rows.length > 0;
}
 
export async function verificarEstanqueExiste(estanqueId, fincaId, grupoDatos) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'verificarEstanqueExiste' en el modulo siembra.
    Parametros:
    - estanqueId: Argumento requerido para el procesamiento interno de la logica.
    - fincaId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
if (!estanqueId || !fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM estanques
        WHERE id = ? AND finca_id = ? AND grupo_datos = ?
        AND activo = TRUE AND deleted_at IS NULL
    `, [Number(estanqueId), Number(fincaId), grupoDatos]);
    return rows.length > 0;
}

export async function findActivaByEstanque(estanqueId, grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo siembra.
    Parametros:
    - estanqueId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [rows] = await pool.execute(`
        SELECT *
        FROM   siembras
        WHERE  estanque_id = ?
        AND    grupo_datos = ?
        AND    LOWER(TRIM(estado)) = 'activa'
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY fecha_siembra DESC, id DESC
        LIMIT 1
    `, [Number(estanqueId), grupoDatos]);
    return rows[0] || null;
}