/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.controller.js
Autor: Samuel Cerdas
Fecha: 27/07/2026
Modulo: Fisico Quimica
Descripcion:
Recibe las peticiones HTTP, delega al model y
devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTO
*/
import { FisicoQuimicaDTO } from '../dtos/fisicoQuimica.dto.js';

// Modelos
import * as FisicoQuimicaModel from '../models/fisicoQuimica.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de fisico quimica.
*/

export async function obtenerTodasLasLecturas(req, res) {
    /*
    Descripcion:
    Obtiene todas las lecturas fisico quimicas del grupo
    de datos autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lista de lecturas.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } = req.user;
        const data = await FisicoQuimicaModel.findAll(grupoDatos);

        return exito(res, 'Lecturas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener las lecturas.', err);
    }
}

export async function obtenerLecturaPorId(req, res) {
    /*
    Descripcion:
    Obtiene una lectura fisico quimica por su ID y grupo
    de datos.

    Parametros:
    - req: Objeto request de Express (req.params.id).
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura encontrada.
    - 404 si no existe.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } = req.user;
        const data = await FisicoQuimicaModel.findById(
            req.params.id,
            grupoDatos
        );

        if (!data) {
            return error(res, 'Lectura no encontrada.', null, 404);
        }

        return exito(res, 'Lectura obtenida correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener la lectura.', err);
    }
}

export async function registrarLectura(req, res) {
    /*
    Descripcion:
    Registra una nueva lectura fisico quimica para el grupo
    de datos autenticado.

    Parametros:
    - req: Objeto request de Express (req.body y req.user).
    - res: Objeto response de Express.

    Retorna:
    - 201 con la lectura creada.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } = req.user;
        const dto = new FisicoQuimicaDTO({
            ...req.body,
            grupoDatos
        });
        const data = await FisicoQuimicaModel.create(
            dto,
            grupoDatos
        );

        return exito(
            res,
            'Lectura registrada correctamente.',
            data,
            201
        );
    } catch (err) {
        return error(res, 'Error al registrar la lectura.', err);
    }
}

export async function actualizarLectura(req, res) {
    /*
    Descripcion:
    Actualiza una lectura fisico quimica perteneciente al
    grupo de datos autenticado.

    Parametros:
    - req: Objeto request de Express (req.params.id,
      req.body y req.user).
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura actualizada.
    - 404 si no existe.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } = req.user;
        const dto = new FisicoQuimicaDTO({
            ...req.body,
            grupoDatos
        });
        const data = await FisicoQuimicaModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

        if (!data) {
            return error(res, 'Lectura no encontrada.', null, 404);
        }

        return exito(res, 'Lectura actualizada correctamente.', data);
    } catch (err) {
        return error(res, 'Error al actualizar la lectura.', err);
    }
}

export async function desactivarLectura(req, res) {
    /*
    Descripcion:
    Realiza el borrado logico de una lectura fisico quimica
    perteneciente al grupo de datos autenticado.

    Parametros:
    - req: Objeto request de Express (req.params.id y req.user).
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura desactivada.
    - 404 si no existe.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } = req.user;
        const data = await FisicoQuimicaModel.remove(
            req.params.id,
            grupoDatos
        );

        if (!data) {
            return error(res, 'Lectura no encontrada.', null, 404);
        }

        return exito(res, 'Estado actualizado correctamente.', data);
    } catch (err) {
        return error(res, 'Error al actualizar el estado.', err);
    }
}