/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.controller.js
Autor: Greivin Arguedas / Marco Vásquez
Fecha: 18/08/2026
Modulo: Crecimiento
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MantCrecimientoDto } from "../dtos/mantCrecimiento.dto.js";

// Servicios
import { isEmpty, isNumeroMayorIgualCero } from '../services/mantCrecimiento.service.js';

// Modelos y Config
import * as MantCrecimientoModel from "../models/mantCrecimiento.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({ finca, estanque, pesoActual }, res) {
    if (isEmpty(finca) || isEmpty(estanque)) {
        return error(res, 'Finca y estanque son requeridos.', null, 400);
    }
    if (isEmpty(pesoActual) || !isNumeroMayorIgualCero(pesoActual)) {
        return error(
            res,
            'El peso actual es requerido y debe ser un numero mayor o igual a cero.',
            null,
            422
        );
    }
    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getCrecimientos(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca, estanque,
                        fecha_registro AS fechaRegistro, peso_actual AS pesoActual,
                        muestreos, activo
                 FROM mant_crecimiento WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Registros de crecimiento obtenidos correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await MantCrecimientoModel.findAll(grupoDatos);
        return exito(res, 'Registros de crecimiento obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener registros de crecimiento.', err, 500);
    }
}

export async function getCrecimientoById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca, estanque,
                        fecha_registro AS fechaRegistro, peso_actual AS pesoActual,
                        muestreos, activo
                 FROM mant_crecimiento
                 WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Registro no encontrado.', null, 404);
            return exito(res, 'Registro obtenido correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const registro = await MantCrecimientoModel.findById(req.params.id, grupoDatos);

        if (!registro) {
            return error(res, 'Registro no encontrado.', null, 404);
        }

        return exito(res, 'Registro obtenido correctamente.', registro);
    } catch (err) {
        return error(res, 'Error al obtener registro de crecimiento.', err, 500);
    }
}

export async function createCrecimiento(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const validacionErr = validarCuerpo(req.body, res);
        if (validacionErr) return validacionErr;

        const { finca, estanque, fechaRegistro, pesoActual, muestreos } = req.body;
        const dto = new MantCrecimientoDto(
            grupoDatos,
            finca,
            estanque,
            fechaRegistro,
            pesoActual,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
            muestreos
        );

        const nuevoRegistro = await MantCrecimientoModel.create(dto);
        return exito(
            res,
            "Registro de crecimiento creado correctamente.",
            nuevoRegistro,
            201
        );
    } catch (err) {
        return error(res, "Error al crear registro de crecimiento.", err, 500);
    }
}

export async function updateCrecimiento(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const validacionErr = validarCuerpo(req.body, res);
        if (validacionErr) return validacionErr;

        const { finca, estanque, fechaRegistro, pesoActual, muestreos } = req.body;
        const dto = new MantCrecimientoDto(
            grupoDatos,
            finca,
            estanque,
            fechaRegistro,
            pesoActual,
            undefined,
            undefined,
            muestreos
        );

        const actualizado = await MantCrecimientoModel.update(
            req.params.id,
            grupoDatos,
            dto
        );

        if (!actualizado) {
            return error(res, "Registro no encontrado", null, 404);
        }
        return exito(
            res,
            "Registro de crecimiento actualizado correctamente.",
            actualizado
        );
    } catch (err) {
        return error(res, "Error al actualizar registro de crecimiento.", err, 500);
    }
}

export async function deleteCrecimiento(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await MantCrecimientoModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, "Registro no encontrado", null, 404);
        }
        return exito(res, "Registro eliminado correctamente", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar registro de crecimiento.", err, 500);
    }
}