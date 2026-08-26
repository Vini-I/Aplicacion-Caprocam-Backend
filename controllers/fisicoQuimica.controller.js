/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.controller.js
Autor: Samuel Cerdas / Marco Vásquez
Fecha: 18/08/2026
Modulo: Fisico Quimica
Descripcion:
Recibe las peticiones HTTP, delega al model.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTO
*/

import { FisicoQuimicaDTO } from '../dtos/fisicoQuimica.dto.js';

// Modelos y Config
import * as FisicoQuimicaModel from '../models/fisicoQuimica.model.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function esIdValido(valor) {
    const id = Number(valor);
    return Number.isInteger(id) && id > 0;
}

function esFechaConsultaValida(fecha) {
    if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return false;
    }
    const fechaConvertida = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(fechaConvertida.getTime())) {
        return false;
    }
    return fechaConvertida.toISOString().slice(0, 10) === fecha;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerTodasLasLecturas(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS fincaId,
                        estanque_id AS estanqueId, fecha_registro AS fechaRegistro,
                        activo
                 FROM fisico_quimico WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Lecturas obtenidas correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await FisicoQuimicaModel.findAll(grupoDatos);

        return exito(res, 'Lecturas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener las lecturas.', err);
    }
}

export async function obtenerLecturaPorEstanqueYFecha(req, res) {
    try {
        const { estanqueId } = req.params;
        const { fecha } = req.query;

        if (!esIdValido(estanqueId)) {
            return error(res, 'El estanqueId no es valido.', null, 400);
        }

        if (!esFechaConsultaValida(fecha)) {
            return error(
                res,
                'Debe indicar una fecha valida (YYYY-MM-DD) en el query string.',
                null,
                400
            );
        }

        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS fincaId,
                        estanque_id AS estanqueId, fecha_registro AS fechaRegistro, activo
                 FROM fisico_quimico
                 WHERE estanque_id = ? AND fecha_registro = ? AND activo = TRUE AND deleted_at IS NULL`,
                [estanqueId, fecha]
            );
            return exito(res, 'Consulta realizada correctamente.', rows[0] ?? null);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await FisicoQuimicaModel.findByEstanqueAndFecha(
            estanqueId,
            fecha,
            grupoDatos
        );

        return exito(res, 'Consulta realizada correctamente.', data);
    } catch (err) {
        return error(res, 'Error al consultar la lectura.', err);
    }
}

export async function obtenerLecturaPorId(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS fincaId,
                        estanque_id AS estanqueId, fecha_registro AS fechaRegistro, activo
                 FROM fisico_quimico WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Lectura no encontrada.', null, 404);
            return exito(res, 'Lectura obtenida correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await FisicoQuimicaModel.findById(req.params.id, grupoDatos);

        if (!data) {
            return error(res, 'Lectura no encontrada.', null, 404);
        }

        return exito(res, 'Lectura obtenida correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener la lectura.', err);
    }
}

export async function registrarLectura(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new FisicoQuimicaDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const data = await FisicoQuimicaModel.create(dto, grupoDatos);
        return exito(res, 'Lectura registrada correctamente.', data, 201);
    } catch (err) {
        return error(res, 'Error al registrar la lectura.', err);
    }
}

export async function actualizarLectura(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new FisicoQuimicaDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const data = await FisicoQuimicaModel.update(req.params.id, dto, grupoDatos);

        if (!data) {
            return error(res, 'Lectura no encontrada.', null, 404);
        }

        return exito(res, 'Lectura actualizada correctamente.', data);
    } catch (err) {
        return error(res, 'Error al actualizar la lectura.', err);
    }
}

export async function desactivarLectura(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await FisicoQuimicaModel.remove(req.params.id, grupoDatos);

        if (!data) {
            return error(res, 'Lectura no encontrada.', null, 404);
        }

        return exito(res, 'Estado actualizado correctamente.', data);
    } catch (err) {
        return error(res, 'Error al actualizar el estado.', err);
    }
}