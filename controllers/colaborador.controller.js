/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.controller.js
Autor: Marco Vásquez
Fecha: 18/08/2026
Modulo: Colaboradores
Descripcion:
Recibe las peticiones HTTP de colaboradores.
Soporta GETs globales ejecutando consulta directa para Caprocam.
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

// Modelos y Config
import * as ColaboradorModel from '../models/colaborador.model.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({ nombre, apellidos, telefono, email, cedula }, res) {
    if (isEmpty(nombre) || isEmpty(apellidos))
        return error(res, 'Nombre y apellidos son requeridos.', null, 400);

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
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS fincaId,
                        nombre, apellidos, cedula, telefono, email,
                        nombre_usuario AS nombreUsuario,
                        tipo_colaborador AS tipoColaborador, activo
                 FROM colaboradores WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Colaboradores obtenidos correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await ColaboradorModel.findAll(grupoDatos);
        return exito(res, 'Colaboradores obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener colaboradores.', err);
    }
}

export async function getColaboradorById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS fincaId,
                        nombre, apellidos, cedula, telefono, email,
                        nombre_usuario AS nombreUsuario,
                        tipo_colaborador AS tipoColaborador, activo
                 FROM colaboradores
                 WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Colaborador no encontrado.', null, 404);
            return exito(res, 'Colaborador obtenido correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const colaborador = await ColaboradorModel.findById(req.params.id, grupoDatos);

        if (!colaborador)
            return error(res, 'Colaborador no encontrado.', null, 404);

        return exito(res, 'Colaborador obtenido correctamente.', colaborador);
    } catch (err) {
        return error(res, 'Error al obtener colaborador.', err);
    }
}

export async function getColaboradoresByCedula(req, res) {
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
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { nombre, apellidos, cedula, telefono, email,
                fincaId, tipoColaborador } = req.body;

        const nombreUsuario = req.body.nombreUsuario ?? req.body.usuario;
        const pinRaw        = req.body.pin ?? req.body.pinHash ?? req.body.pin_hash;

        const err = validarCuerpo({ nombre, apellidos, telefono, email, cedula }, res);
        if (err) return err;

        if (!nombreUsuario)
            return error(res, 'El nombre de usuario es requerido.', null, 400);

        if (!pinRaw)
            return error(res, 'El PIN es requerido.', null, 400);

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
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { nombre, apellidos, cedula, telefono, email,
                fincaId, tipoColaborador } = req.body;

        const pinRaw = req.body.pin ?? req.body.pinHash ?? req.body.pin_hash;

        const err = validarCuerpo({ nombre, apellidos, telefono, email, cedula }, res);
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
            nombre,
            apellidos,
            cedula,
            telefono,
            email,
            nombreUsuario: req.body.nombreUsuario ?? req.body.usuario,
            pinHash: finalPinHash,
            tipoColaborador,
        });

        const actualizado = await ColaboradorModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado)
            return error(res, 'Colaborador no encontrado.', null, 404);

        return exito(res, 'Colaborador actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar colaborador.', err);
    }
}

export async function deleteColaborador(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado  = await ColaboradorModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Colaborador no encontrado.', null, 404);

        return exito(res, 'Colaborador eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar colaborador.', err);
    }
}