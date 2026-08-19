/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoTarea.controller.js
Autor: Marco Vásquez
Fecha: 18/08/2026
Modulo: MantenimientoTareas
Descripcion:
Recibe las peticiones HTTP para tareas vinculadas a mantenimientos.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MantenimientoTareaDTO, EstadoTareaMantenimiento } from '../dtos/mantenimientoTarea.dto.js';

// Modelos y Config
import * as MantenimientoTareaModel from '../models/mantenimientoTarea.model.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getTareasByMantenimiento(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT mt.*, mt.grupo_datos AS grupoDatos
                 FROM mantenimiento_tareas mt
                 WHERE mt.mantenimiento_equipo_id = ?
                   AND mt.activo = TRUE AND mt.deleted_at IS NULL`,
                [req.params.mantenimientoId]
            );
            return exito(res, 'Tareas del mantenimiento obtenidas correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await MantenimientoTareaModel.findByMantenimiento(
            req.params.mantenimientoId,
            grupoDatos
        );
        return exito(res, 'Tareas del mantenimiento obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener tareas del mantenimiento.', err);
    }
}

export async function agregarTarea(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { mantenimientoEquipoId, tareaId, estadoTarea } = req.body;

        const dto   = new MantenimientoTareaDTO({ mantenimientoEquipoId, tareaId, estadoTarea });
        const nuevo = await MantenimientoTareaModel.create(dto, grupoDatos);

        return exito(res, 'Tarea agregada al mantenimiento correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al agregar tarea al mantenimiento.', err);
    }
}

export async function actualizarEstadoTarea(req, res) {
    try {
        const { grupoDatos }  = obtenerContextoPeticion(req);
        const { estadoTarea } = req.body;

        if (!estadoTarea || !Object.values(EstadoTareaMantenimiento).includes(estadoTarea))
            return error(res, `Estado invalido. Opciones: ${Object.values(EstadoTareaMantenimiento).join(', ')}`, null, 422);

        const actualizado = await MantenimientoTareaModel.updateEstado(req.params.id, estadoTarea, grupoDatos);

        if (!actualizado)
            return error(res, 'Registro no encontrado.', null, 404);

        return exito(res, 'Estado de tarea actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar estado de tarea.', err);
    }
}

export async function eliminarTarea(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado     = await MantenimientoTareaModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Registro no encontrado.', null, 404);

        return exito(res, 'Tarea eliminada del mantenimiento correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar tarea del mantenimiento.', err);
    }
}