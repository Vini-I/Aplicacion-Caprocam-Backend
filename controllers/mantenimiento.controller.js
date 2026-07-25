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

import { MantenimientoDTO, EstadoTicket } from '../dtos/mantenimiento.dto.js';

// Servicios
import { isEstadoValido, isEmpty } from '../services/mantenimiento.service.js';

// Modelos
import * as MantenimientoModel from '../models/mantenimiento.model.js';
import * as TareaModel from '../models/tarea.model.js';

// Config
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

createMantenimiento() y updateMantenimiento() dependen de validarCuerpo().
getMantenimientos() y getMantenimientoById() dependen de enriquecerMantenimiento().
*/

function validarCuerpo({ tituloTicket, descripcionTicket, equipoId }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - tituloTicket, descripcionTicket, equipoId: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(tituloTicket))
        return error(res, 'El titulo del ticket es requerido.', null, 400);

    if (isEmpty(descripcionTicket))
        return error(res, 'La descripcion del ticket es requerida.', null, 400);

    if (!equipoId)
        return error(res, 'El equipo es requerido.', null, 400);

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
*/

export async function getMantenimientos(req, res) {
    /*
    Descripcion:
    Obtiene todos los tickets de mantenimiento del grupo.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de mantenimientos
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const data = await MantenimientoModel.findAll(grupoDatos);
        return exito(res, 'Mantenimientos obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener mantenimientos.', err);
    }
}

export async function getMantenimientoById(req, res) {
    /*
    Descripcion:
    Obtiene un ticket de mantenimiento por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el ticket encontrado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const mantenimiento = await MantenimientoModel.findById(req.params.id, grupoDatos);

        if (!mantenimiento)
            return error(res, 'Mantenimiento no encontrado.', null, 404);

        return exito(res, 'Mantenimiento obtenido correctamente.', mantenimiento);
    } catch (err) {
        return error(res, 'Error al obtener mantenimiento.', err);
    }
}

export async function createMantenimiento(req, res) {
    /*
    Descripcion:
    Crea un nuevo ticket de mantenimiento.
    La fecha de creacion la maneja la DB automaticamente.
    El creador se extrae del JWT, no del body.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el ticket creado
    - 400 si hay errores de validacion
    - 404 si el equipo no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const creadoPorUsuarioId = req.user?.id ?? null;
        const creadoPorColaboradorId = req.colaborador?.id ?? null;

        const { tituloTicket, descripcionTicket, equipoId, estadoEquipo } = req.body;

        const err = validarCuerpo({ tituloTicket, descripcionTicket, equipoId }, res);
        if (err) return err;

        const [equipos] = await pool.query(
            `SELECT id FROM equipos WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
            [equipoId]
        );

        if (equipos.length === 0)
            return error(res, 'El equipo indicado no existe.', null, 404);

        const dto = new MantenimientoDTO({
            tituloTicket, descripcionTicket, equipoId,
            creadoPorColaboradorId, estadoEquipo
        });
        const nuevo = await MantenimientoModel.create(dto, grupoDatos);

        return exito(res, 'Mantenimiento creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear mantenimiento.', err);
    }
}

export async function updateMantenimiento(req, res) {
    /*
    Descripcion:
    Actualiza un ticket de mantenimiento existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el ticket actualizado
    - 400/422 si hay errores de validacion
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { tituloTicket, descripcionTicket, equipoId,
            estadoTicket, estadoEquipo } = req.body;

        const err = validarCuerpo({ tituloTicket, descripcionTicket, equipoId }, res);
        if (err) return err;

        if (estadoTicket && !isEstadoValido(estadoTicket))
            return error(res, `Estado invalido. Opciones: ${Object.values(EstadoTicket).join(', ')}`, null, 422);

        const [equipos] = await pool.query(
            `SELECT id FROM equipos WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
            [equipoId]
        );

        if (equipos.length === 0)
            return error(res, 'El equipo indicado no existe.', null, 404);

        const dto = new MantenimientoDTO({
            tituloTicket, descripcionTicket,
            equipoId, estadoTicket, estadoEquipo
        });
        const actualizado = await MantenimientoModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado)
            return error(res, 'Mantenimiento no encontrado.', null, 404);

        return exito(res, 'Mantenimiento actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar mantenimiento.', err);
    }
}

export async function deleteMantenimiento(req, res) {
    /*
    Descripcion:
    Borrado logico de un ticket de mantenimiento por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el ticket desactivado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado = await MantenimientoModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Mantenimiento no encontrado.', null, 404);

        return exito(res, 'Mantenimiento eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar mantenimiento.', err);
    }
}