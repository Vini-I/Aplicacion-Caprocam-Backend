/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: laboratorio.controller.js
Autor: Oscar Mario-Joan Campos / Marco Vásquez
Fecha: 18/08/2026
Modulo: Laboratorio
Descripcion:
Controlador HTTP para el modulo de laboratorio.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

import { LaboratorioDTO } from "../dtos/laboratorio.dto.js";
import * as LaboratorioModel from "../models/laboratorio.model.js";
import pool from "../config/database.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

export async function getLaboratorios(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion, activo
                 FROM laboratorios WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, "Laboratorios obtenidos correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const lista = await LaboratorioModel.findAll(grupoDatos);
        return exito(res, "Laboratorios obtenidos correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener laboratorios.", err);
    }
}

export async function getLaboratorioById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion, activo
                 FROM laboratorios WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Laboratorio no encontrado.", null, 404);
            return exito(res, "Laboratorio obtenido correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const item = await LaboratorioModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener laboratorio.", err);
    }
}

export async function createLaboratorio(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new LaboratorioDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const creado = await LaboratorioModel.create(dto, grupoDatos);
        return exito(res, "Laboratorio creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear laboratorio.", err);
    }
}

export async function updateLaboratorio(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const dto = new LaboratorioDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null
        });

        const actualizado = await LaboratorioModel.update(req.params.id, dto, grupoDatos);
        if (!actualizado) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar laboratorio.", err);
    }
}

export async function deleteLaboratorio(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await LaboratorioModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar laboratorio.", err);
    }
}