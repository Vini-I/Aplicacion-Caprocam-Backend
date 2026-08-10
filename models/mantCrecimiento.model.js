/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.model.js
Autor: Greivin Arguedas
Fecha: 03/08/2026
Modulo: Crecimiento
Descripcion:
Modelo para interactuar con la base de datos del modulo de crecimiento.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// IMPORT DTO
import { MantCrecimientoDto } from "../dtos/mantCrecimiento.dto.js";

//IMPORT DE CONEXION DE BASE DE DATOS
import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de crecimiento.
*/
export async function findAll(grupoDatos) {
  /*
    Descripcion:
    Obtiene todos los registros de crecimiento.

    Parametros:
    - grupoDatos: Grupo de datos al que pertenecen los registros.

    Retorna:
    - Lista con todos los registros de crecimiento.
    */

    const [rows] = await pool.execute(
        `SELECT 
            id,
            grupo_datos AS grupoDatos,
            finca_id AS finca,
            estanque_id AS estanque,
            fecha_registro AS fechaRegistro,
            peso_actual AS pesoActual,
            creado_por_usuario_id AS creadoPorUsuarioId,
            creado_por_colaborador_id AS creadoPorColaboradorId
        FROM crecimientos
        WHERE grupo_datos = ?
        AND deleted_at IS NULL`,
        [grupoDatos]
    );
    if (rows.length === 0) return [];

    const [calculos] = await pool.execute(
        `SELECT 
            id,
            crecimiento_id AS crecimientoId,
            cantidad_individuos AS cantidad,
            peso_total AS pesoTotal,
            peso_promedio_individual AS pesoPromedio
        FROM calculos_crecimiento
        WHERE grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL`,
        [grupoDatos]
    );

    const calculosMap = {};
    for (const c of calculos) {
        if (!calculosMap[c.crecimientoId]) {
            calculosMap[c.crecimientoId] = [];
        }
        const { crecimientoId, ...datosMuestreo } = c;
        calculosMap[c.crecimientoId].push(datosMuestreo);
    }

    for (const row of rows) {
        row.muestreos = calculosMap[row.id] || [];
    }
    return rows;
}

export async function findById(id, grupoDatos) {
  /*
    Descripcion:
    Busca un registro de crecimiento por su ID.

    Parametros:
    - id: Identificador del crecimiento.
    - grupoDatos: Grupo de datos al que pertenece el crecimiento.

    Retorna:
    - El registro encontrado o null si no existe.
    */

    const [rows] = await pool.execute(
        `SELECT 
            id,
            grupo_datos AS grupoDatos,
            finca_id AS finca,
            estanque_id AS estanque,
            fecha_registro AS fechaRegistro,
            peso_actual AS pesoActual,
            creado_por_usuario_id AS creadoPorUsuarioId,
            creado_por_colaborador_id AS creadoPorColaboradorId
        FROM crecimientos
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    const crecimiento = rows[0] || null;
    if (!crecimiento) return null;

    const [calculos] = await pool.execute(
        `SELECT 
            id,
            cantidad_individuos AS cantidad,
            peso_total AS pesoTotal,
            peso_promedio_individual AS pesoPromedio
        FROM calculos_crecimiento
        WHERE crecimiento_id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    crecimiento.muestreos = calculos;
    return crecimiento;
}

export async function create(dto) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.execute(
      `INSERT INTO crecimientos (
                grupo_datos,
                finca_id,
                estanque_id,
                fecha_registro,
                peso_actual,
                creado_por_usuario_id,
                creado_por_colaborador_id
            ) VALUES (?,?,?,?,?,?,?)`,
      [
        dto.grupoDatos,
        dto.finca,
        dto.estanque,
        dto.fechaRegistro,
        dto.pesoActual,
        dto.creadoPorUsuarioId,
        dto.creadoPorColaboradorId,
      ],
    );
    const crecimientoId = result.insertId;
    
    if (dto.muestreos && dto.muestreos.length > 0) {
        for (const m of dto.muestreos) {
            await conn.execute(
                `INSERT INTO calculos_crecimiento (
                    grupo_datos,
                    crecimiento_id,
                    cantidad_individuos,
                    peso_total,
                    peso_promedio_individual,
                    creado_por_usuario_id,
                    creado_por_colaborador_id
                ) VALUES (?,?,?,?,?,?,?)`,
                [
                    dto.grupoDatos,
                    crecimientoId,
                    m.cantidad,
                    m.pesoTotal,
                    m.pesoPromedio,
                    dto.creadoPorUsuarioId,
                    dto.creadoPorColaboradorId,
                ],
            );
        }
    }
        await conn.commit();
        return await findById(crecimientoId, dto.grupoDatos);

  } catch (err) {
        await conn.rollback();
        throw err;

  } finally {
        conn.release();
  }
}

export async function update(id, grupoDatos, dto) {
    /*
    Descripcion:
    Actualiza un registro de crecimiento y opcionalmente sus muestreos asociados de forma transaccional.

    Parametros:
    - id: Identificador del crecimiento.
    - grupoDatos: Grupo de datos al que pertenece el crecimiento.
    - dto: Datos actualizados (puede o no contener el arreglo de muestreos).

    Retorna:
    - El registro actualizado con sus muestreos o null si no existe.
    */

    const registro = await findById(id, grupoDatos);
    if (!registro) return null;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.execute(
            `UPDATE crecimientos
            SET
                finca_id = ?,
                estanque_id = ?,
                fecha_registro = ?,
                peso_actual = ?
            WHERE id = ?
            AND grupo_datos = ?`,
            [
                dto.finca,
                dto.estanque,
                dto.fechaRegistro,
                dto.pesoActual,
                id,
                grupoDatos
            ]
        );

        if (dto.muestreos !== undefined && Array.isArray(dto.muestreos)) {
            
            const [muestreosActivos] = await conn.execute(
                `SELECT id FROM calculos_crecimiento
                WHERE crecimiento_id = ?
                AND grupo_datos = ?
                AND activo = TRUE
                AND deleted_at IS NULL`,
                [id, grupoDatos]
            );
            const idsEnDB = muestreosActivos.map(r => r.id);

            const idsEnviados = dto.muestreos
                .filter(m => m.id != null)
                .map(m => Number(m.id));

            const idsAEliminar = idsEnDB.filter(idDB => !idsEnviados.includes(idDB));
            for (const idEliminar of idsAEliminar) {
                await conn.execute(
                    `UPDATE calculos_crecimiento
                    SET
                        activo = FALSE,
                        deleted_at = NOW()
                    WHERE id = ?
                    AND grupo_datos = ?`,
                    [idEliminar, grupoDatos]
                );
            }
            // Procesar cada muestreo del DTO
            for (const m of dto.muestreos) {
                if (m.id != null) {
                    await conn.execute(
                        `UPDATE calculos_crecimiento
                        SET
                            cantidad_individuos = ?,
                            peso_total = ?,
                            peso_promedio_individual = ?
                        WHERE id = ?
                        AND crecimiento_id = ?
                        AND grupo_datos = ?`,
                        [
                            m.cantidad, 
                            m.pesoTotal, 
                            m.pesoPromedio, 
                            m.id, 
                            id, 
                            grupoDatos
                        ]
                    );
                } else {
                    await conn.execute(
                        `INSERT INTO calculos_crecimiento (
                            grupo_datos,
                            crecimiento_id,
                            cantidad_individuos,
                            peso_total,
                            peso_promedio_individual,
                            creado_por_usuario_id,
                            creado_por_colaborador_id
                        ) VALUES (?,?,?,?,?,?,?)`,
                        [
                            grupoDatos, 
                            id, 
                            m.cantidad, 
                            m.pesoTotal, 
                            m.pesoPromedio,
                            registro.creadoPorUsuarioId, 
                            registro.creadoPorColaboradorId
                        ]
                    );
                }
            }
        }
        await conn.commit();
        return await findById(id, grupoDatos);
        
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
}

export async function remove(id, grupoDatos) {
  /*
    Descripcion:
    Elimina logicamente un registro de crecimiento.

    Parametros:
    - id: Identificador del crecimiento.
    - grupoDatos: Grupo de datos al que pertenece el crecimiento.

    Retorna:
    - El registro eliminado o null si no existe.
    */

    const registro = await findById(id, grupoDatos);
    if (!registro) return null;

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        await conn.execute(
            `UPDATE crecimientos
            SET deleted_at = NOW()
            WHERE id = ?
            AND grupo_datos = ?`,
            [id, grupoDatos]
        );

        await conn.execute(
            `UPDATE calculos_crecimiento
            SET deleted_at = NOW()
            WHERE crecimiento_id = ?
            AND grupo_datos = ?`,
            [id, grupoDatos]
        );
        await conn.commit();
        return registro;

    } catch (err) {
        await conn.rollback();
        throw err;

    } finally {
        conn.release();
    }
};