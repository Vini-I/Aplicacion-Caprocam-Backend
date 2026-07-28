/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.controller.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Compradores
Descripcion:
Recibe las peticiones HTTP de compradores, delega al modelo
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as CompradorModel from '../models/comprador.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getCompradores(req, res) {
    /*
    Descripcion:
    Obtiene todos los compradores del grupo.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de compradores
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const data       = await CompradorModel.findAll(grupoDatos);
        return exito(res, 'Compradores obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener compradores.', err);
    }
}

export async function getCompradorById(req, res) {
    /*
    Descripcion:
    Obtiene un comprador por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el comprador encontrado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const comprador  = await CompradorModel.findById(req.params.id, grupoDatos);

        if (!comprador)
            return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador obtenido correctamente.', comprador);
    } catch (err) {
        return error(res, 'Error al obtener comprador.', err);
    }
}

export async function createComprador(req, res) {
    /*
    Descripcion:
    Crea un nuevo comprador.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el comprador creado
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const nuevo      = await CompradorModel.create(req.body, grupoDatos);

        return exito(res, 'Comprador creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear comprador.', err);
    }
}

export async function updateComprador(req, res) {
    /*
    Descripcion:
    Actualiza un comprador existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el comprador actualizado
    - 404 si no existe
    */
    try {
        const grupoDatos  = req.user.grupoDatos;
        const actualizado = await CompradorModel.update(
            req.params.id, 
            req.body, 
            grupoDatos
        );

        if (!actualizado)
            return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar comprador.', err);
    }
}

export async function deleteComprador(req, res) {
    /*
    Descripcion:
    Borrado logico de un comprador por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el comprador desactivado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado  = await CompradorModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar comprador.', err);
    }
}