/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.controller.js
Autor: Sebastian Villegas Barquero / Marco Vásquez
Fecha: 18/08/2026
Modulo: Raleo
Descripcion:
Recibe las peticiones HTTP, delega al modelo.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { RaleoDTO } from "../dtos/raleo.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isIdValido,
    validarRetiroBiomasa,
    validarBiomasaRestante,
    validarPorcentajeRaleo,
    validarFechaNoFutura,
    validarEstanque,
} from "../services/raleo.service.js";

// Modelos y Config
import * as RaleoModel from "../models/raleo.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

async function validarCuerpo(body, res, grupoDatos) {
    const errores = [];

    if (isEmpty(body.idFinca)) { errores.push("El campo idFinca es requerido."); }
    if (isEmpty(body.idEstanque)) { errores.push("El campo idEstanque es requerido."); }

    if (isEmpty(body.fecha)) { errores.push("El campo fecha es requerido."); }
    if (isEmpty(body.porcentaje)) { errores.push("El campo porcentaje es requerido."); }
    if (isEmpty(body.kgRetirados)) { errores.push("El campo kgRetirados es requerido."); }
    if (isEmpty(body.biomasaRestante)) { errores.push("El campo biomasaRestante es requerido."); }
    if (isEmpty(body.biomasaEstimada)) { errores.push("El campo biomasaEstimada es requerido."); }

    if (!isNumeroMayorCero(body.idFinca)) { errores.push("El campo idFinca debe ser numerico y mayor que cero."); }
    if (!isNumeroMayorCero(body.idEstanque)) { errores.push("El campo idEstanque debe ser numerico y mayor que cero."); }

    if (!isNumeroMayorCero(body.porcentaje)) { errores.push("El campo porcentaje debe ser numerico y mayor que cero."); }
    if (!isNumeroMayorCero(body.kgRetirados)) { errores.push("El campo kgRetirados debe ser numerico y mayor que cero."); }
    if (!isNumeroMayorCero(body.biomasaEstimada)) { errores.push("El campo biomasaEstimada debe ser numerico y mayor que cero."); }

    const idSiembra = await validarEstanque(body.idEstanque, grupoDatos);
    if (!idSiembra) {
        errores.push("El estanque indicado no tiene una siembra activa.");
    } else {
        body.idSiembra = idSiembra;
    }

    if (!validarFechaNoFutura(body.fecha)) { errores.push("La fecha del raleo no puede ser futura y debe ser válida."); }
    if (!validarRetiroBiomasa(body.biomasaEstimada, body.kgRetirados)) { errores.push("Los kg retirados no pueden superar la biomasa estimada."); }
    if (!validarBiomasaRestante(body.biomasaEstimada, body.kgRetirados, body.biomasaRestante)) { errores.push("Calculo recibido de BiomasaRestante incorrecto / o no debe ser negativo"); }
    if (!validarPorcentajeRaleo(body.biomasaEstimada, body.kgRetirados, body.porcentaje)) { errores.push("Calculo recibido de Porcentaje incorrecto"); }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el raleo.", errores, 422);
    }
    return null;
}

function validarIdParametro(id, res) {
    if (!isIdValido(id)) {
        return error(res, "El id debe ser numerico y mayor que cero.", null, 400);
    }
    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getRaleo(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT r.*, r.grupo_datos AS grupoDatos FROM raleos r
                 WHERE r.activo = TRUE AND r.deleted_at IS NULL`
            );
            return exito(res, "Raleos obtenidos correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await RaleoModel.findAll(grupoDatos);

        return exito(res, "Raleos obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los raleos.", err, 500);
    }
}

export async function getRaleoById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT r.*, r.grupo_datos AS grupoDatos FROM raleos r
                 WHERE r.id = ? AND r.activo = TRUE AND r.deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Raleo no encontrado.", null, 404);
            return exito(res, "Raleo obtenido correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const raleo = await RaleoModel.findById(req.params.id, grupoDatos);

        if (!raleo) {
            return error(res, "Raleo no encontrado.", null, 404);
        }

        return exito(res, "Raleo obtenido correctamente.", raleo);
    } catch (err) {
        return error(res, "Error al obtener el raleo.", err, 500);
    }
}

export async function createRaleo(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const err = await validarCuerpo(req.body, res, grupoDatos);
        if (err) return err;

        const dto = new RaleoDTO({
            ...req.body,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const nuevo = await RaleoModel.create(dto, grupoDatos);
        return exito(res, "Raleo creado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear el raleo.", err, 500);
    }
}

export async function updateRaleo(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const err = await validarCuerpo(req.body, res, grupoDatos);
        if (err) return err;

        const dto = new RaleoDTO({
            ...req.body,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const actualizado = await RaleoModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

        if (!actualizado) {
            return error(res, "Raleo no encontrado.", null, 404);
        }

        return exito(res, "Raleo actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el raleo.", err, 500);
    }
}

export async function deleteRaleo(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const eliminado = await RaleoModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, "Raleo no encontrado.", null, 404);
        }

        return exito(res, "Raleo eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el raleo.", err, 500);
    }
}