/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.controller.js
Autor: Oscar Mario / Marco Vásquez / Joan Campos
Fecha: 25/08/2026
Modulo: Procedencia
//////////////////////////////////////////////////////////
*/

import { ProcedenciaDTO } from "../dtos/procedencia.dto.js";
import * as ProcedenciaModel from "../models/procedencia.model.js";
import pool from "../config/database.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

export async function getProcedencias(req, res) {
    /*
    Descripcion:
    Maneja la peticion GET para obtener todas las procedencias.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Lista de procedencias.
    */
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
    /*
    Descripcion:
    Maneja la peticion GET para obtener una procedencia por ID.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Procedencia solicitada.
    */
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
    /*
    Descripcion:
    Maneja la peticion POST para crear una procedencia.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Procedencia creada.
    */
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
    /*
    Descripcion:
    Maneja la peticion PUT para actualizar una procedencia.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Procedencia actualizada.
    */
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
    /*
    Descripcion:
    Maneja la peticion DELETE para borrar (logico) una procedencia.
    Valida previamente que no este asignada a lotes de larva.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Confirmacion de eliminacion o error 409 si esta en uso.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        
        const enUso = await ProcedenciaModel.estaEnUso(req.params.id, grupoDatos);
        if (enUso) {
            return error(res, "No se puede eliminar esta procedencia porque está asignada a uno o más lotes de larva.", null, 409);
        }

        const eliminado = await ProcedenciaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia eliminada correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar procedencia.", err);
    }
}