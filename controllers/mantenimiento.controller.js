/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.controller.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
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

import { MantenimientoDTO, EstadoMantenimiento } from '../dtos/mantenimiento.dto.js';

// Servicios
import { isEstadoValido, isEmpty } from '../services/mantenimiento.service.js';

// Modelos
import * as MantenimientoModel from '../models/mantenimiento.model.js';
import * as TareaModel         from '../models/tarea.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

La funcion createMantenimiento() y updateMantenimiento()
dependen de validarCuerpo().

Las funciones getMantenimientos() y getMantenimientoById()
dependen de enriquecerMantenimiento().
*/

function validarCuerpo({ titulo, equipo, tarea, descripcion }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - titulo, equipo, tarea, descripcion: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(titulo))
        return error(res, 'El titulo es requerido.', null, 400);

    if (isEmpty(equipo))
        return error(res, 'El equipo es requerido.', null, 400);

    if (!tarea)
        return error(res, 'La tarea es requerida.', null, 400);

    if (isEmpty(descripcion))
        return error(res, 'La descripcion es requerida.', null, 400);

    return null;
}

function enriquecerMantenimiento(mantenimiento) {
    /*
    Descripcion:
    Reemplaza el ID de tarea con el objeto tarea completo
    para que el frontend no necesite hacer una segunda llamada.

    Parametros:
    - mantenimiento: Objeto mantenimiento crudo del model.

    Retorna:
    - Mantenimiento con tarea como objeto en lugar de solo ID.
    */
    const tarea = TareaModel.findById(mantenimiento.tarea);
    return { ...mantenimiento, tarea: tarea ?? mantenimiento.tarea };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de mantenimientos.
*/

export function getMantenimientos(req, res) {
    /*
    Descripcion:
    Obtiene todos los mantenimientos con su tarea enriquecida.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de mantenimientos
    */
    const data = MantenimientoModel.findAll().map(enriquecerMantenimiento);
    return exito(res, 'Mantenimientos obtenidos correctamente.', data);
}

export function getMantenimientoById(req, res) {
    /*
    Descripcion:
    Obtiene un mantenimiento por su ID con su tarea enriquecida.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el mantenimiento encontrado
    - 404 si no existe
    */
    const mantenimiento = MantenimientoModel.findById(req.params.id);

    if (!mantenimiento)
        return error(res, 'Mantenimiento no encontrado.', null, 404);

    return exito(res, 'Mantenimiento obtenido correctamente.', enriquecerMantenimiento(mantenimiento));
}

export function createMantenimiento(req, res) {
    /*
    Descripcion:
    Crea un nuevo ticket de mantenimiento.
    La fecha y hora se genera automaticamente del sistema.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el mantenimiento creado
    - 400/422 si hay errores de validacion
    */

    // TO-DO: reemplazar req.body.creadoPor con req.user.nombre cuando JWT este implementado
    const { creadoPor, titulo, equipo, tarea, descripcion } = req.body;
    const fechaHora = new Date().toISOString().slice(0, 19);

    const err = validarCuerpo({ titulo, equipo, tarea, descripcion }, res);
    if (err) return err;

    const tareaExiste = TareaModel.findById(tarea);
    if (!tareaExiste)
        return error(res, 'La tarea indicada no existe.', null, 404);

    const dto   = new MantenimientoDTO({ fechaHora, creadoPor, titulo, equipo, tarea, descripcion });
    const nuevo = MantenimientoModel.create(dto);

    return exito(res, 'Mantenimiento creado correctamente.', enriquecerMantenimiento(nuevo), 201);
}

export function updateMantenimiento(req, res) {
    /*
    Descripcion:
    Actualiza un mantenimiento existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el mantenimiento actualizado
    - 400/422 si hay errores de validacion
    - 404 si no existe
    */
    const { creadoPor, titulo, equipo, tarea, descripcion, estado } = req.body;

    const err = validarCuerpo({ titulo, equipo, tarea, descripcion }, res);
    if (err) return err;

    if (estado && !isEstadoValido(estado))
        return error(res, `Estado invalido. Opciones: ${Object.values(EstadoMantenimiento).join(', ')}`, null, 422);

    const tareaExiste = TareaModel.findById(tarea);
    if (!tareaExiste)
        return error(res, 'La tarea indicada no existe.', null, 404);

    const dto         = new MantenimientoDTO({ creadoPor, titulo, equipo, tarea, descripcion, estado });
    const actualizado = MantenimientoModel.update(req.params.id, dto);

    if (!actualizado)
        return error(res, 'Mantenimiento no encontrado.', null, 404);

    return exito(res, 'Mantenimiento actualizado correctamente.', enriquecerMantenimiento(actualizado));
}

export function deleteMantenimiento(req, res) {
    /*
    Descripcion:
    Elimina un mantenimiento por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el mantenimiento eliminado
    - 404 si no existe
    */
    const eliminado = MantenimientoModel.remove(req.params.id);

    if (!eliminado)
        return error(res, 'Mantenimiento no encontrado.', null, 404);

    return exito(res, 'Mantenimiento eliminado correctamente.', eliminado);
}