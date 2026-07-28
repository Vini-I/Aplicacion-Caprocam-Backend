/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.controller.js
Autor: Marco Vásquez
Fecha: 20/07/2026
Modulo: Colaboradores
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

import { ColaboradorDTO } from '../dtos/colaborador.dto.js';

// Servicios
import { isEmail, isPhone, isEmpty } from '../services/colaborador.service.js';

// Modelos
import * as ColaboradorModel from '../models/colaborador.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

createColaborador() y updateColaborador() dependen de validarCuerpo().
*/

function validarCuerpo({ nombre, apellidos, telefono, email, rolId }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - nombre, apellidos, telefono, email, rolId: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(nombre) || isEmpty(apellidos))
        return error(res, 'Nombre y apellidos son requeridos.', null, 400);

    if (!rolId)
        return error(res, 'El rol es requerido.', null, 400);

    if (email && !isEmail(email))
        return error(res, 'El email no tiene un formato válido.', null, 422);

    if (telefono && !isPhone(telefono))
        return error(res, 'El teléfono debe tener 8 dígitos.', null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getColaboradores(req, res) {
    /*
    Descripcion:
    Obtiene todos los colaboradores del grupo.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de colaboradores
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const data       = await ColaboradorModel.findAll(grupoDatos);
        return exito(res, 'Colaboradores obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener colaboradores.', err);
    }
}

export async function getColaboradorById(req, res) {
    /*
    Descripcion:
    Obtiene un colaborador por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el colaborador encontrado
    - 404 si no existe
    */
    try {
        const grupoDatos  = req.user.grupoDatos;
        const colaborador = await ColaboradorModel.findById(req.params.id, grupoDatos);

        if (!colaborador)
            return error(res, 'Colaborador no encontrado.', null, 404);

        return exito(res, 'Colaborador obtenido correctamente.', colaborador);
    } catch (err) {
        return error(res, 'Error al obtener colaborador.', err);
    }
}

export async function createColaborador(req, res) {
    /*
    Descripcion:
    Crea un nuevo colaborador.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el colaborador creado
    - 400/422 si hay errores de validacion
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { nombre, apellidos, telefono, email, rolId,
                fincaId, nombreUsuario, pinHash, tipoColaborador } = req.body;

        const err = validarCuerpo({ nombre, apellidos, telefono, email, rolId }, res);
        if (err) return err;

        const dto   = new ColaboradorDTO({ nombre, apellidos, telefono, email, rolId,
                                           fincaId, nombreUsuario, pinHash, tipoColaborador });
        const nuevo = await ColaboradorModel.create(dto, grupoDatos);

        return exito(res, 'Colaborador creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear colaborador.', err);
    }
}

export async function updateColaborador(req, res) {
    /*
    Descripcion:
    Actualiza un colaborador existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el colaborador actualizado
    - 400/422 si hay errores de validacion
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { nombre, apellidos, telefono, email, rolId,
                fincaId, tipoColaborador } = req.body;

        const err = validarCuerpo({ nombre, apellidos, telefono, email, rolId }, res);
        if (err) return err;

        const dto         = new ColaboradorDTO({ nombre, apellidos, telefono, email,
                                                 rolId, fincaId, tipoColaborador });
        const actualizado = await ColaboradorModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado)
            return error(res, 'Colaborador no encontrado.', null, 404);

        return exito(res, 'Colaborador actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar colaborador.', err);
    }
}

export async function deleteColaborador(req, res) {
    /*
    Descripcion:
    Borrado logico de un colaborador por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el colaborador desactivado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado  = await ColaboradorModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Colaborador no encontrado.', null, 404);

        return exito(res, 'Colaborador eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar colaborador.', err);
    }
}