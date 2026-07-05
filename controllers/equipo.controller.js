/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.controller.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
Recibe las peticiones HTTP, delega al modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { EquipoDTO, TipoEquipo, EstadoEquipo } from "../dtos/equipo.dto.js";

// Servicios
import {
    isEmpty,
    isTipoEquipo,
    isEstadoEquipo,
    isIdValido,
    isFechaValida
} from "../services/equipo.service.js";

// Modelos
import * as EquipoModel from "../models/equipo.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Las funciones createEquipo() y updateEquipo() dependen
de esta funcion para trabajar.
*/

async function validarCuerpo({ codigoInterno, descripcion, fechaInstalacion,
    tipo, estado, funcionEquipo }, res, idExcluir = null) {
    /*
    Descripcion:
    Valida las reglas de negocio sobre los campos del body
    antes de construir el DTO.

    Parametros:
    - codigoInterno, descripcion, fechaInstalacion, tipo,
      estado, funcionEquipo: Campos del body.
    - res:         Objeto response de Express.
    - idExcluir:   ID del equipo actual al actualizar,
                   para no detectar su propio codigo como duplicado.

    Retorna:
    - Una respuesta de error si algo falla, null si todo bien.
    */
    if (isEmpty(codigoInterno))
        return error(res, "El identificador es obligatorio.", null, 422);

    if (isEmpty(descripcion))
        return error(res, "La descripcion es obligatoria.", null, 422);

    if (!isFechaValida(fechaInstalacion))
        return error(
            res,
            "La fecha de instalacion debe tener formato dd/mm/aaaa.",
            null,
            422
        );

    if (!isTipoEquipo(tipo))
        return error(
            res,
            "Tipo invalido. Opciones: " + Object.values(TipoEquipo).join(", ") + ".",
            null,
            422
        );

    if (!isEstadoEquipo(estado))
        return error(
            res,
            "Estado invalido. Opciones: " + Object.values(EstadoEquipo).join(", ") + ".",
            null,
            422
        );

    if (isEmpty(funcionEquipo))
        return error(res, "La funcion del equipo es obligatoria.", null, 422);

    const existente = await EquipoModel.findByCodigoInterno(codigoInterno);
    if (existente && String(existente.id) !== String(idExcluir))
        return error(res, "Ya existe un equipo con ese codigo interno.", null, 409);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de equipos.
*/

export async function getEquipos(req, res) {
    /*
    Descripcion:
    Obtiene todos los equipos activos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de equipos
    */
    try {
        const data = await EquipoModel.findAll();
        return exito(res, "Equipos obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener equipos.", null, 500);
    }
}

export async function getEquipoById(req, res) {
    /*
    Descripcion:
    Obtiene un equipo por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el equipo encontrado
    - 400 si el id es invalido
    - 404 si no existe
    */
    try {
        if (!isIdValido(req.params.id))
            return error(res, "El id del equipo es invalido.", null, 400);

        const equipo = await EquipoModel.findById(req.params.id);

        if (!equipo)
            return error(res, "Equipo no encontrado.", null, 404);

        return exito(res, "Equipo obtenido correctamente.", equipo);
    } catch (err) {
        return error(res, "Error al obtener el equipo.", null, 500);
    }
}

export async function createEquipo(req, res) {
    /*
    Descripcion:
    Registra un nuevo equipo.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el equipo creado
    - 409 si el codigo interno ya existe
    - 422 si algun campo es invalido
    */
    try {
        const { codigoInterno, descripcion, fechaInstalacion,
            tipo, estado, funcionEquipo } = req.body;

        const err = await validarCuerpo(
            { codigoInterno, descripcion, fechaInstalacion, tipo, estado, funcionEquipo },
            res
        );
        if (err) return err;

        const dto   = new EquipoDTO({ codigoInterno, descripcion,
            fechaInstalacion, tipo, estado, funcionEquipo });
        const nuevo = await EquipoModel.create(dto);

        return exito(res, "Equipo registrado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al registrar el equipo.", null, 500);
    }
}

export async function updateEquipo(req, res) {
    /*
    Descripcion:
    Actualiza un equipo existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el equipo actualizado
    - 400 si el id es invalido
    - 404 si no existe
    - 409 si el codigo interno ya pertenece a otro equipo
    - 422 si algun campo es invalido
    */
    try {
        if (!isIdValido(req.params.id))
            return error(res, "El id del equipo es invalido.", null, 400);

        const { codigoInterno, descripcion, fechaInstalacion,
            tipo, estado, funcionEquipo } = req.body;

        const err = await validarCuerpo(
            { codigoInterno, descripcion, fechaInstalacion, tipo, estado, funcionEquipo },
            res,
            req.params.id
        );
        if (err) return err;

        const dto         = new EquipoDTO({ codigoInterno, descripcion,
            fechaInstalacion, tipo, estado, funcionEquipo });
        const actualizado = await EquipoModel.update(req.params.id, dto);

        if (!actualizado)
            return error(res, "Equipo no encontrado.", null, 404);

        return exito(res, "Equipo actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el equipo.", null, 500);
    }
}

export async function deleteEquipo(req, res) {
    /*
    Descripcion:
    Elimina un equipo por su ID (borrado logico).

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el equipo eliminado
    - 400 si el id es invalido
    - 404 si no existe
    */
    try {
        if (!isIdValido(req.params.id))
            return error(res, "El id del equipo es invalido.", null, 400);

        const eliminado = await EquipoModel.remove(req.params.id);

        if (!eliminado)
            return error(res, "Equipo no encontrado.", null, 404);

        return exito(res, "Equipo eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el equipo.", null, 500);
    }
}