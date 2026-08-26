/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.controller.js
Autor: Jose Espinoza
Fecha: 18/08/2026
Modulo: Compradores
Descripcion:
Recibe las peticiones HTTP de compradores, delega al modelo.
Soporta GETs globales ejecutando consulta directa para Caprocam.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import * as CompradorModel from '../models/comprador.model.js';
import { CompradorDTO } from '../dtos/comprador.dto.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getCompradores(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, cedula,
                        telefono, correo, direccion, notas, estado, activo
                 FROM compradores WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Compradores obtenidos correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await CompradorModel.findAll(grupoDatos);
        return exito(res, 'Compradores obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener compradores.', err);
    }
}

export async function getCompradorById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, cedula,
                        telefono, correo, direccion, notas, estado, activo
                 FROM compradores
                 WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Comprador no encontrado.', null, 404);
            return exito(res, 'Comprador obtenido correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const comprador = await CompradorModel.findById(req.params.id, grupoDatos);

        if (!comprador)
            return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador obtenido correctamente.', comprador);
    } catch (err) {
        return error(res, 'Error al obtener comprador.', err);
    }
}

export async function createComprador(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new CompradorDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });
        const nuevo = await CompradorModel.create(dto, grupoDatos);

        return exito(res, 'Comprador creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear comprador.', err);
    }
}

export async function updateComprador(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const dto = new CompradorDTO({ ...req.body, grupoDatos });
        const actualizado = await CompradorModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado)
            return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar comprador.', err);
    }
}

export async function deleteComprador(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await CompradorModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar comprador.', err);
    }
}