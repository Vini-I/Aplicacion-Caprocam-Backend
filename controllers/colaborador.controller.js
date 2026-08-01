/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.controller.js
Autor: Marco Vásquez
Fecha: 29/07/2026
Modulo: Colaboradores
Descripcion:
Recibe las peticiones HTTP de colaboradores, valida campos,
hashea el PIN de 4 digitos con bcrypt y soporta consulta
por cedula para el flujo del APK movil.
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
import {
    isEmail,
    isPhone,
    isCedula,
    isPin,
    hashPin,
    isEmpty,
} from '../services/colaborador.service.js';

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

function validarCuerpo({ nombre, apellidos, telefono, email, cedula, rolId }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - nombre, apellidos, telefono, email, cedula, rolId: Campos
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(nombre) || isEmpty(apellidos))
        return error(res, 'Nombre y apellidos son requeridos.', null, 400);

    if (!rolId)
        return error(res, 'El rol es requerido.', null, 400);

    if (email && !isEmail(email))
        return error(res, 'El email no tiene un formato valido.', null, 422);

    if (telefono && !isPhone(telefono))
        return error(res, 'El telefono debe tener 8 digitos.', null, 422);

    if (cedula && !isCedula(cedula))
        return error(res, 'La cedula debe tener entre 9 y 12 digitos.', null, 422);

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
    Obtiene todos los colaboradores del grupo de datos.

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

export async function getColaboradoresByCedula(req, res) {
    /*
    Descripcion:
    Flujo APK Movil: Consulta un colaborador por su cedula,
    obtiene su grupo_datos y retorna la lista completa de
    colaboradores de ese grupo para popular el selector movil.

    Parametros:
    - req.params.cedula: Numero de cedula a consultar

    Retorna:
    - 200 con grupoDatos y lista de colaboradores del grupo
    - 404 si la cedula no existe
    */
    try {
        const cedula = req.params.cedula;

        if (!isCedula(cedula))
            return error(res, 'Formato de cedula invalido.', null, 422);

        const colaborador = await ColaboradorModel.findByCedula(cedula);

        if (!colaborador)
            return error(res, 'No se encontro colaborador con esa cedula.', null, 404);

        const listaGrupo = await ColaboradorModel.findAll(colaborador.grupoDatos);

        return exito(res, 'Datos de grupo obtenidos para APK.', {
            grupoDatos:         colaborador.grupoDatos,
            colaboradorInicial: colaborador,
            colaboradores:      listaGrupo,
        });
    } catch (err) {
        return error(res, 'Error al consultar colaborador por cedula.', err);
    }
}

export async function createColaborador(req, res) {
    /*
    Descripcion:
    Crea un nuevo colaborador. Extrae pin / pinHash / pin_hash del body
    y lo cifra con bcrypt obligatoriamente.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el colaborador creado
    - 400/422 si hay errores de validacion o falta PIN
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { nombre, apellidos, cedula, telefono, email, rolId,
                fincaId, tipoColaborador } = req.body;

        const nombreUsuario = req.body.nombreUsuario ?? req.body.usuario;
        const pinRaw        = req.body.pin ?? req.body.pinHash ?? req.body.pin_hash;

        const err = validarCuerpo({ nombre, apellidos, telefono, email,
                                    cedula, rolId }, res);
        if (err) return err;

        if (!nombreUsuario)
            return error(res, 'El nombre de usuario es requerido.', null, 400);

        if (!pinRaw)
            return error(res, 'El PIN es requerido.', null, 400);

        // Si ya viene como un hash bcrypt ($2b$ o $2a$), lo respetamos
        let finalPinHash;
        const strPin = String(pinRaw);

        if (strPin.startsWith('$2a$') || strPin.startsWith('$2b$')) {
            finalPinHash = strPin;
        } else {
            if (!isPin(strPin))
                return error(res, 'El PIN debe ser de 4 digitos numericos.', null, 422);
            finalPinHash = await hashPin(strPin);
        }

        const dto = new ColaboradorDTO({
            grupoDatos,
            fincaId,
            rolId,
            nombre,
            apellidos,
            cedula,
            telefono,
            email,
            nombreUsuario,
            pinHash: finalPinHash,
            tipoColaborador,
        });

        const nuevo = await ColaboradorModel.create(dto, grupoDatos);

        return exito(res, 'Colaborador creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear colaborador.', err);
    }
}

export async function updateColaborador(req, res) {
    /*
    Descripcion:
    Actualiza un colaborador existente por su ID. Si viene un PIN
    en texto plano, lo cifra con bcrypt.

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
        const { nombre, apellidos, cedula, telefono, email, rolId,
                fincaId, tipoColaborador } = req.body;

        const pinRaw = req.body.pin ?? req.body.pinHash ?? req.body.pin_hash;

        const err = validarCuerpo({ nombre, apellidos, telefono, email,
                                    cedula, rolId }, res);
        if (err) return err;

        let finalPinHash = null;

        if (pinRaw) {
            const strPin = String(pinRaw);
            if (strPin.startsWith('$2a$') || strPin.startsWith('$2b$')) {
                finalPinHash = strPin;
            } else {
                if (!isPin(strPin))
                    return error(res, 'El PIN debe ser de 4 digitos.', null, 422);
                finalPinHash = await hashPin(strPin);
            }
        }

        const dto = new ColaboradorDTO({
            grupoDatos,
            fincaId,
            rolId,
            nombre,
            apellidos,
            cedula,
            telefono,
            email,
            nombreUsuario: req.body.nombreUsuario ?? req.body.usuario,
            pinHash: finalPinHash,
            tipoColaborador,
        });

        const actualizado = await ColaboradorModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

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