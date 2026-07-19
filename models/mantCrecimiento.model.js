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
export async function findAll(grupoDatos) {
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
        WHERE grupo_datos = ?
        AND deleted_at IS NULL`,
        [grupoDatos]
    );

    return rows;
}

export async function findById(id, grupoDatos) {
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
        AND grupo_datos = ?
        AND deleted_at IS NULL`,
        [id, grupoDatos]
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

    return await findById(result.insertId, dto.grupoDatos);
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

    if (!registro) {
        return null;
    }

    await pool.execute(
        `UPDATE crecimientos
        SET
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            fecha_registro = ?,
            peso_actual = ?
        WHERE id = ?
        AND grupo_datos = ?`,
        [
            dto.finca,
            dto.estanque,
            dto.colaborador,
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

    if (!registro) {
        return null;
    }

    await pool.execute(
        `UPDATE crecimientos
        SET deleted_at = NOW()
        WHERE id = ?
        AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return registro;
}