/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.controller.js
Autor: Oscar Mario / Marco Vásquez
Fecha: 18/08/2026
Modulo: Procedencia
Descripcion:
Controlador HTTP para el modulo de procedencia.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

import { ProcedenciaDTO } from "../dtos/procedencia.dto.js";
import * as ProcedenciaModel from "../models/procedencia.model.js";
import pool from "../config/database.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

export async function getProcedencias(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion, activo
                 FROM procedencias WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, "Procedencias obtenidas correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const lista = await ProcedenciaModel.findAll(grupoDatos);
        return exito(res, "Procedencias obtenidas correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener procedencias.", err);
    }
}

export async function getProcedenciaById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion, activo
                 FROM procedencias WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Procedencia no encontrada.", null, 404);
            return exito(res, "Procedencia obtenida correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const item = await ProcedenciaModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia obtenida correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener procedencia.", err);
    }
}

export async function createProcedencia(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new ProcedenciaDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const creado = await ProcedenciaModel.create(dto, grupoDatos);
        return exito(res, "Procedencia creada correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear procedencia.", err);
    }
}

export async function updateProcedencia(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const dto = new ProcedenciaDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null
        });

        const actualizado = await ProcedenciaModel.update(req.params.id, dto, grupoDatos);
        if (!actualizado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar procedencia.", err);
    }
}

export async function deleteProcedencia(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await ProcedenciaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia eliminada correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar procedencia.", err);
    }
}