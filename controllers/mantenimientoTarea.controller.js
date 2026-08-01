/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoTarea.controller.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoTareas
Descripcion:
Recibe las peticiones HTTP para el modulo de tareas
vinculadas a mantenimientos y devuelve la respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MantenimientoTareaDTO, EstadoTareaMantenimiento } from '../dtos/mantenimientoTarea.dto.js';

// Modelos
import * as MantenimientoTareaModel from '../models/mantenimientoTarea.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getTareasByMantenimiento(req, res) {
    /*
    Descripcion:
    Obtiene todas las tareas de un ticket de mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.params.mantenimientoId)
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de tareas del mantenimiento
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const data       = await MantenimientoTareaModel.findByMantenimiento(
            req.params.mantenimientoId,
            grupoDatos
        );
        return exito(res, 'Tareas del mantenimiento obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener tareas del mantenimiento.', err);
    }
}

export async function agregarTarea(req, res) {
    /*
    Descripcion:
    Vincula una tarea a un ticket de mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el vinculo creado
    - 400 si faltan campos
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { mantenimientoEquipoId, tareaId, estadoTarea } = req.body;

        const dto    = new MantenimientoTareaDTO({ mantenimientoEquipoId, tareaId, estadoTarea });
        const nuevo  = await MantenimientoTareaModel.create(dto, grupoDatos);

        return exito(res, 'Tarea agregada al mantenimiento correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al agregar tarea al mantenimiento.', err);
    }
}

export async function actualizarEstadoTarea(req, res) {
    /*
    Descripcion:
    Actualiza el estado de una tarea dentro de un mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body.estadoTarea)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro actualizado
    - 400 si el estado es invalido
    - 404 si no existe
    */
    try {
        const grupoDatos  = req.user.grupoDatos;
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
    /*
    Descripcion:
    Elimina el vinculo de una tarea con un mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro eliminado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado  = await MantenimientoTareaModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Registro no encontrado.', null, 404);

        return exito(res, 'Tarea eliminada del mantenimiento correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar tarea del mantenimiento.', err);
    }
}