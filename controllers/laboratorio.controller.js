/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: laboratorio.controller.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Laboratorio
Descripcion:
Controlador HTTP para el modulo de laboratorio.
//////////////////////////////////////////////////////////
*/

import * as LaboratorioModel from "../models/laboratorio.model.js";
import { exito, error } from "../common/respuestaJson.js";

export async function getLaboratorios(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const lista = await LaboratorioModel.findAll(grupoDatos);
        return exito(res, "Laboratorios obtenidos correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener laboratorios.", err);
    }
}

export async function getLaboratorioById(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const item = await LaboratorioModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener laboratorio.", err);
    }
}

export async function createLaboratorio(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const creado = await LaboratorioModel.create(req.body, grupoDatos);
        return exito(res, "Laboratorio creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear laboratorio.", err);
    }
}

export async function updateLaboratorio(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const actualizado = await LaboratorioModel.update(req.params.id, req.body, grupoDatos);
        if (!actualizado) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar laboratorio.", err);
    }
}

export async function deleteLaboratorio(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado = await LaboratorioModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar laboratorio.", err);
    }
}