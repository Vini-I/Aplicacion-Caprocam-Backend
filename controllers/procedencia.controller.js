/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.controller.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Procedencia
Descripcion:
Controlador HTTP para el modulo de procedencia.
//////////////////////////////////////////////////////////
*/

import * as ProcedenciaModel from "../models/procedencia.model.js";
import { exito, error } from "../common/respuestaJson.js";

export async function getProcedencias(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const lista = await ProcedenciaModel.findAll(grupoDatos);
        return exito(res, "Procedencias obtenidas correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener procedencias.", err);
    }
}

export async function getProcedenciaById(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const item = await ProcedenciaModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia obtenida correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener procedencia.", err);
    }
}

export async function createProcedencia(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const creado = await ProcedenciaModel.create(req.body, grupoDatos);
        return exito(res, "Procedencia creada correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear procedencia.", err);
    }
}

export async function updateProcedencia(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const actualizado = await ProcedenciaModel.update(req.params.id, req.body, grupoDatos);
        if (!actualizado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar procedencia.", err);
    }
}

export async function deleteProcedencia(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado = await ProcedenciaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia eliminada correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar procedencia.", err);
    }
}