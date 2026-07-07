/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.model.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Crecimiento
Descripcion:
Capa de datos del modulo de crecimiento.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
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
export async function findAll() {
    /*
    Descripcion:
    Obtiene todos los registros de crecimiento.

    Parametros:
    No posee.

    Retorna:
    - Lista con todos los registros de crecimiento.
    */

    const [rows] = await pool.execute(
        `SELECT *
        FROM crecimientos
        WHERE deleted_at IS NULL`
    );

    return rows;
}

export async function findById(id) {
    /*
    Descripcion:
    Busca un registro de crecimiento por su ID.

    Parametros:
    - id: Identificador del crecimiento.

    Retorna:
    - El registro encontrado o null si no existe.
    */

    const [rows] = await pool.execute(
        `SELECT *
        FROM crecimientos
        WHERE id = ?
        AND deleted_at IS NULL`,
        [id]
    );

    return rows[0] || null;
}

export async function create(dto) {
    /*
    Descripcion:
    Crea un nuevo registro de crecimiento.

    Parametros:
    - dto: Objeto con los datos del crecimiento.

    Retorna:
    - El registro creado.
    */

    const [result] = await pool.execute(
        `INSERT INTO crecimientos (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            fecha_registro,
            peso_actual
        ) VALUES (?,?,?,?,?,?)`,
        [
            dto.grupoDatos,
            dto.finca,
            dto.estanque,
            dto.colaborador,
            dto.fechaRegistro,
            dto.pesoActual
        ]
    );

    return await findById(result.insertId);
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza un registro de crecimiento.

    Parametros:
    - id: Identificador del crecimiento.
    - dto: Datos actualizados.

    Retorna:
    - El registro actualizado o null si no existe.
    */

    const registro = await findById(id);

    if (!registro) {
        return null;
    }

    await pool.execute(
        `UPDATE crecimientos
        SET
            grupo_datos = ?,
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            fecha_registro = ?,
            peso_actual = ?
        WHERE id = ?`,
        [
            dto.grupoDatos,
            dto.finca,
            dto.estanque,
            dto.colaborador,
            dto.fechaRegistro,
            dto.pesoActual,
            id
        ]
    );
    return await findById(id);
}

export async function remove(id) {
    /*
    Descripcion:
    Elimina logicamente un registro de crecimiento.

    Parametros:
    - id: Identificador del crecimiento.

    Retorna:
    - El registro eliminado o null si no existe.
    */

    const registro = await findById(id);

    if (!registro) {
        return null;
    }

    await pool.execute(
        `UPDATE crecimientos
        SET deleted_at = NOW()
        WHERE id = ?`,
        [id]
    );

    return registro;
}