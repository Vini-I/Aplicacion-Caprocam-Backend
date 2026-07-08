/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.model.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Tareas
Descripcion:
Capa de datos del modulo de tareas.
Conectado a MySQL via pool. Usa borrado logico.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Config
*/

import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Todas las funciones principales dependen de mapearTarea().
*/

function mapearTarea(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto tarea en camelCase.
    */
    return {
        id:            fila.id,
        uuid:          fila.uuid,
        grupoDatos:    fila.grupo_datos,
        colaboradorId: fila.colaborador_id,
        equipoId:      fila.equipo_id,
        nombre:        fila.nombre,
        descripcion:   fila.descripcion,
        categoria:     fila.categoria,
        horas:         fila.horas,
        estado:        fila.estado,
        fechaCreacion: fila.fecha_creacion,
        fechaActualizacion: fila.fecha_actualizacion,
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todas las tareas activas del grupo.

    Parametros:
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de tareas mapeadas a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT * FROM tareas
         WHERE grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearTarea);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca una tarea por ID dentro del grupo.

    Parametros:
    - id:          ID de la tarea.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - La tarea encontrada o null.
    */
    const [filas] = await pool.query(
        `SELECT * FROM tareas
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearTarea(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta una nueva tarea en la DB.

    Parametros:
    - dto:         Objeto TareaDTO con los datos.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - La tarea recien creada.
    */
    const [result] = await pool.query(
        `INSERT INTO tareas
         (grupo_datos, colaborador_id, equipo_id, nombre, descripcion, categoria, horas, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            grupoDatos,
            dto.colaboradorId,
            dto.equipoId,
            dto.nombre,
            dto.descripcion,
            dto.categoria,
            dto.horas,
            dto.estado,
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza una tarea existente e incrementa version.

    Parametros:
    - id:          ID de la tarea.
    - dto:         Objeto TareaDTO con los nuevos datos.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - La tarea actualizada o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE tareas
         SET colaborador_id = ?, equipo_id = ?, nombre = ?, descripcion = ?,
             categoria = ?, horas = ?, estado = ?, version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [
            dto.colaboradorId,
            dto.equipoId,
            dto.nombre,
            dto.descripcion,
            dto.categoria,
            dto.horas,
            dto.estado,
            id,
            grupoDatos,
        ]
    );
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Borrado logico de la tarea. No elimina el registro.

    Parametros:
    - id:          ID de la tarea.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - La tarea antes de ser desactivada, o null si no existe.
    */
    const tarea = await findById(id, grupoDatos);
    if (!tarea) return null;

    await pool.query(
        `UPDATE tareas
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return tarea;
}