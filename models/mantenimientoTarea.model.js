/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoTarea.model.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoTareas
Descripcion:
Capa de datos para mantenimiento_equipo_tareas.
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

Todas las funciones principales dependen de mapearMantenimientoTarea().
*/

function mapearMantenimientoTarea(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto mantenimientoTarea en camelCase.
    */
    return {
        id:                    fila.id,
        uuid:                  fila.uuid,
        grupoDatos:            fila.grupo_datos,
        mantenimientoEquipoId: fila.mantenimiento_equipo_id,
        tareaId:               fila.tarea_id,
        estadoTarea:           fila.estado_tarea,
        fechaCreacion:         fila.fecha_creacion,
        fechaActualizacion:    fila.fecha_actualizacion,
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findByMantenimiento(mantenimientoId, grupoDatos) {
    /*
    Descripcion:
    Obtiene todas las tareas de un ticket de mantenimiento.

    Parametros:
    - mantenimientoId: ID del ticket de mantenimiento.
    - grupoDatos:      Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de tareas del mantenimiento.
    */
    const [filas] = await pool.query(
        `SELECT * FROM mantenimiento_equipo_tareas
         WHERE mantenimiento_equipo_id = ? AND grupo_datos = ?
         AND activo = TRUE AND deleted_at IS NULL`,
        [mantenimientoId, grupoDatos]
    );
    return filas.map(mapearMantenimientoTarea);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro por su ID dentro del grupo.

    Parametros:
    - id:         ID del registro.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT * FROM mantenimiento_equipo_tareas
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearMantenimientoTarea(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Vincula una tarea a un ticket de mantenimiento.

    Parametros:
    - dto:        Objeto MantenimientoTareaDTO con los datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro recien creado.
    */
    const [result] = await pool.query(
        `INSERT INTO mantenimiento_equipo_tareas
         (grupo_datos, mantenimiento_equipo_id, tarea_id, estado_tarea)
         VALUES (?, ?, ?, ?)`,
        [grupoDatos, dto.mantenimientoEquipoId, dto.tareaId, dto.estadoTarea]
    );
    return findById(result.insertId, grupoDatos);
}

export async function updateEstado(id, estadoTarea, grupoDatos) {
    /*
    Descripcion:
    Actualiza el estado de una tarea dentro de un mantenimiento.

    Parametros:
    - id:          ID del registro.
    - estadoTarea: Nuevo estado.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El registro actualizado o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE mantenimiento_equipo_tareas
         SET estado_tarea = ?, version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [estadoTarea, id, grupoDatos]
    );
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Borrado logico del vinculo tarea-mantenimiento.

    Parametros:
    - id:         ID del registro.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro antes de ser desactivado, o null si no existe.
    */
    const registro = await findById(id, grupoDatos);
    if (!registro) return null;

    await pool.query(
        `UPDATE mantenimiento_equipo_tareas
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return registro;
}