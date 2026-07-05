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

La funcion createTarea() y updateTarea() dependen de esta funcion.
*/

function validarCuerpo({ nombre, descripcion, categoria, duracionEstimada }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - nombre, descripcion, categoria, duracionEstimada: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(nombre) || isEmpty(descripcion))
        return error(res, 'Nombre y descripcion son requeridos.', null, 400);

    if (!isCategoriaValida(categoria))
        return error(res, `Categoria invalida. Opciones: ${Object.values(CategoriasTarea).join(', ')}`, null, 422);

    if (!isDuracionValida(duracionEstimada))
        return error(res, 'La duracion estimada debe ser un numero mayor a cero.', null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de tareas.
*/

export function getTareas(req, res) {
    /*
    Descripcion:
    Obtiene todas las tareas.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de tareas
    */
    const data = TareaModel.findAll();
    return exito(res, 'Tareas obtenidas correctamente.', data);
}

export function getCatalogoTareas(req, res) {
    /*
    Descripcion:
    Retorna una lista reducida de tareas para poblar
    selects en el frontend.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de { id, nombre } de cada tarea
    */
    const tareas  = TareaModel.findAll();
    const catalogo = tareas.map(t => ({ id: t.id, nombre: t.nombre }));
    return exito(res, 'Catalogo de tareas obtenido correctamente.', catalogo);
}

export function getTareaById(req, res) {
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
    const tarea = TareaModel.findById(req.params.id);

    if (!tarea)
        return error(res, 'Tarea no encontrada.', null, 404);

    return exito(res, 'Tarea obtenida correctamente.', tarea);
}

export function createTarea(req, res) {
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
    const { nombre, descripcion, categoria, duracionEstimada } = req.body;

    const err = validarCuerpo({ nombre, descripcion, categoria, duracionEstimada }, res);
    if (err) return err;

    const dto = new TareaDTO({ nombre, descripcion, categoria, duracionEstimada });
    const nueva = TareaModel.create(dto);

    return exito(res, 'Tarea creada correctamente.', nueva, 201);
}

export function updateTarea(req, res) {
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
    const { nombre, descripcion, categoria, duracionEstimada } = req.body;

    const err = validarCuerpo({ nombre, descripcion, categoria, duracionEstimada }, res);
    if (err) return err;

    const dto = new TareaDTO({ nombre, descripcion, categoria, duracionEstimada });
    const actualizada = TareaModel.update(req.params.id, dto);

    if (!actualizada)
        return error(res, 'Tarea no encontrada.', null, 404);

    return exito(res, 'Tarea actualizada correctamente.', actualizada);
}

export function deleteTarea(req, res) {
    /*
    Descripcion:
    Elimina una tarea por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con la tarea eliminada
    - 404 si no existe
    */
    const eliminada = TareaModel.remove(req.params.id);

    if (!eliminada)
        return error(res, 'Tarea no encontrada.', null, 404);

    return exito(res, 'Tarea eliminada correctamente.', eliminada);
}