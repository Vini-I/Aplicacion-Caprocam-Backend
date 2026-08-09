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
    [grupoDatos],
  );
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
    [id, grupoDatos],
  );

  return rows[0] || null;
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
    
    // Si existen muestreos, guardarlos en calculos_crecimiento
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
    Actualiza un registro de crecimiento.

    Parametros:
    - id: Identificador del crecimiento.
    - grupoDatos: Grupo de datos al que pertenece el crecimiento.
    - dto: Datos actualizados.

    Retorna:
    - El registro actualizado o null si no existe.
    */

    const registro = await findById(id, grupoDatos);
    if (!registro) return null;
    await pool.execute(
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
    return await findById(id, grupoDatos);
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
        // Soft delete del registro principal
        await conn.execute(
            `UPDATE crecimientos
            SET deleted_at = NOW()
            WHERE id = ?
            AND grupo_datos = ?`,
            [id, grupoDatos]
        );
        // Soft delete coordinado de los calculos relacionados
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