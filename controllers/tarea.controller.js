/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.controller.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Tareas
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { TareaDTO, CategoriasTarea } from '../dtos/tarea.dto.js';

// Servicios
import { isCategoriaValida, isDuracionValida, isEmpty } from '../services/tarea.service.js';

// Modelos
import * as TareaModel from '../models/tarea.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

createTarea() y updateTarea() dependen de validarCuerpo().
*/

function validarCuerpo({ nombre, descripcion, categoria, horas }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - nombre, descripcion, categoria, horas: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(nombre) || isEmpty(descripcion))
        return error(res, 'Nombre y descripcion son requeridos.', null, 400);

    if (!isCategoriaValida(categoria))
        return error(res, `Categoria invalida. Opciones: ${Object.values(CategoriasTarea).join(', ')}`, null, 422);

    if (!isDuracionValida(horas))
        return error(res, 'Las horas estimadas deben ser un numero mayor a cero.', null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getTareas(req, res) {
    /*
    Descripcion:
    Obtiene todas las tareas del grupo.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de tareas
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const data       = await TareaModel.findAll(grupoDatos);
        return exito(res, 'Tareas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener tareas.', err);
    }
}

export async function getTareaById(req, res) {
    /*
    Descripcion:
    Obtiene una tarea por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con la tarea encontrada
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const tarea      = await TareaModel.findById(req.params.id, grupoDatos);

        if (!tarea)
            return error(res, 'Tarea no encontrada.', null, 404);

        return exito(res, 'Tarea obtenida correctamente.', tarea);
    } catch (err) {
        return error(res, 'Error al obtener tarea.', err);
    }
}

export async function getCatalogoTareas(req, res) {
    /*
    Descripcion:
    Retorna lista reducida de tareas para poblar selects en el frontend.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de { id, nombre }
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const tareas     = await TareaModel.findAll(grupoDatos);
        const catalogo   = tareas.map(t => ({ id: t.id, nombre: t.nombre }));
        return exito(res, 'Catalogo de tareas obtenido correctamente.', catalogo);
    } catch (err) {
        return error(res, 'Error al obtener catalogo de tareas.', err);
    }
}

export async function createTarea(req, res) {
    /*
    Descripcion:
    Crea una nueva tarea.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con la tarea creada
    - 400/422 si hay errores de validacion
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { nombre, descripcion, categoria, horas,
                colaboradorId, equipoId, estado } = req.body;

        const err = validarCuerpo({ nombre, descripcion, categoria, horas }, res);
        if (err) return err;

        const dto   = new TareaDTO({ nombre, descripcion, categoria, horas,
                                     colaboradorId, equipoId, estado });
        const nueva = await TareaModel.create(dto, grupoDatos);

        return exito(res, 'Tarea creada correctamente.', nueva, 201);
    } catch (err) {
        return error(res, 'Error al crear tarea.', err);
    }
}

export async function updateTarea(req, res) {
    /*
    Descripcion:
    Actualiza una tarea existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con la tarea actualizada
    - 400/422 si hay errores de validacion
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { nombre, descripcion, categoria, horas,
                colaboradorId, equipoId, estado } = req.body;

        const err = validarCuerpo({ nombre, descripcion, categoria, horas }, res);
        if (err) return err;

        const dto         = new TareaDTO({ nombre, descripcion, categoria, horas,
                                           colaboradorId, equipoId, estado });
        const actualizada = await TareaModel.update(req.params.id, dto, grupoDatos);

        if (!actualizada)
            return error(res, 'Tarea no encontrada.', null, 404);

        return exito(res, 'Tarea actualizada correctamente.', actualizada);
    } catch (err) {
        return error(res, 'Error al actualizar tarea.', err);
    }
}

export async function deleteTarea(req, res) {
    /*
    Descripcion:
    Borrado logico de una tarea por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con la tarea desactivada
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminada  = await TareaModel.remove(req.params.id, grupoDatos);

        if (!eliminada)
            return error(res, 'Tarea no encontrada.', null, 404);

        return exito(res, 'Tarea eliminada correctamente.', eliminada);
    } catch (err) {
        return error(res, 'Error al eliminar tarea.', err);
    }
}