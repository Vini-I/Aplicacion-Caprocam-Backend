/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.controller.js
Autor: Marco Vásquez
Fecha: 18/08/2026
Modulo: Mantenimientos
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

import { MantenimientoDTO, EstadoTicket, TipoPersonal } from '../dtos/mantenimiento.dto.js';

// Servicios y Modelos
import { isEstadoValido, isTipoPersonalValido, isEmpty } from '../services/mantenimiento.service.js';
import * as MantenimientoModel from '../models/mantenimiento.model.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({ tituloTicket, descripcionTicket, equipoId, tipoPersonal, estadoTicket }, res) {
    if (isEmpty(tituloTicket))
        return error(res, 'El titulo del ticket es requerido.', null, 400);

    if (isEmpty(descripcionTicket))
        return error(res, 'La descripcion del ticket es requerida.', null, 400);

    if (!equipoId)
        return error(res, 'El equipo es requerido.', null, 400);

    if (tipoPersonal && !isTipoPersonalValido(tipoPersonal))
        return error(
            res,
            `Tipo de personal invalido. Opciones: ${Object.values(TipoPersonal).join(', ')}`,
            null,
            422
        );

    if (estadoTicket && !isEstadoValido(estadoTicket))
        return error(
            res,
            `Estado invalido. Opciones: ${Object.values(EstadoTicket).join(', ')}`,
            null,
            422
        );

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getMantenimientos(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, codigo_ticket AS codigoTicket,
                        equipo_id AS equipoId, fecha_mantenimiento AS fechaMantenimiento,
                        titulo_ticket AS tituloTicket, descripcion_ticket AS descripcionTicket,
                        tipo_personal AS tipoPersonal, costo_mano_obra AS costoManoObra,
                        costo_productos AS costoProductos,
                        costo_total_estimado AS costoTotalEstimado,
                        estado_ticket AS estadoTicket, activo
                 FROM mantenimiento_equipo WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Mantenimientos obtenidos correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await MantenimientoModel.findAll(grupoDatos);
        return exito(res, 'Mantenimientos obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener mantenimientos.', err);
    }
}

export async function getMantenimientoById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, codigo_ticket AS codigoTicket,
                        equipo_id AS equipoId, fecha_mantenimiento AS fechaMantenimiento,
                        titulo_ticket AS tituloTicket, descripcion_ticket AS descripcionTicket,
                        tipo_personal AS tipoPersonal, costo_mano_obra AS costoManoObra,
                        costo_productos AS costoProductos,
                        costo_total_estimado AS costoTotalEstimado,
                        estado_ticket AS estadoTicket, activo
                 FROM mantenimiento_equipo WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Mantenimiento no encontrado.', null, 404);
            return exito(res, 'Mantenimiento obtenido correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const mantenimiento = await MantenimientoModel.findById(req.params.id, grupoDatos);

        if (!mantenimiento)
            return error(res, 'Mantenimiento no encontrado.', null, 404);

        return exito(res, 'Mantenimiento obtenido correctamente.', mantenimiento);
    } catch (err) {
        return error(res, 'Error al obtener mantenimiento.', err);
    }
}

export async function createMantenimiento(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const {
            codigoTicket,
            equipoId,
            fechaMantenimiento,
            tituloTicket,
            descripcionTicket,
            tipoPersonal,
            costoManoObra,
            estadoTicket,
        } = req.body;

        const err = validarCuerpo(
            { tituloTicket, descripcionTicket, equipoId, tipoPersonal, estadoTicket },
            res
        );
        if (err) return err;

        const [equipos] = await pool.query(
            `SELECT id FROM equipos WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
            [equipoId]
        );

        if (equipos.length === 0)
            return error(res, 'El equipo indicado no existe.', null, 404);

        const dto = new MantenimientoDTO({
            codigoTicket,
            equipoId,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
            fechaMantenimiento,
            tituloTicket,
            descripcionTicket,
            tipoPersonal,
            costoManoObra:      costoManoObra ?? 0,
            costoProductos:     0,
            costoTotalEstimado: costoManoObra ?? 0,
            estadoTicket,
        });
        const nuevo = await MantenimientoModel.create(dto, grupoDatos);

        return exito(res, 'Mantenimiento creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear mantenimiento.', err);
    }
}

export async function updateMantenimiento(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const {
            equipoId,
            fechaMantenimiento,
            tituloTicket,
            descripcionTicket,
            tipoPersonal,
            costoManoObra,
            estadoTicket,
        } = req.body;

        const err = validarCuerpo(
            { tituloTicket, descripcionTicket, equipoId, tipoPersonal, estadoTicket },
            res
        );
        if (err) return err;

        const [equipos] = await pool.query(
            `SELECT id, estado_operativo FROM equipos
             WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
            [equipoId, grupoDatos]
        );

        if (equipos.length === 0)
            return error(res, 'El equipo indicado no existe.', null, 404);

        const equipoActual = equipos[0];
        const nuevoEstadoEquipo = req.body.estadoEquipo ??
                                 req.body.estadoOperativo ??
                                 equipoActual.estado_operativo;

        if (estadoTicket === EstadoTicket.TERMINADO && nuevoEstadoEquipo === 'Mantenimiento') {
            const msgErr = 'No se puede finalizar el ticket mientras el equipo ' +
                           'continúe en estado "Mantenimiento". Debe cambiar el ' +
                           'estado del equipo a "Activo" o "Inactivo".';
            return error(res, msgErr, null, 422);
        }

        const dto = new MantenimientoDTO({
            equipoId,
            fechaMantenimiento,
            tituloTicket,
            descripcionTicket,
            tipoPersonal,
            costoManoObra: costoManoObra ?? 0,
            estadoTicket,
        });
        const actualizado = await MantenimientoModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado)
            return error(res, 'Mantenimiento no encontrado.', null, 404);

        if (nuevoEstadoEquipo !== equipoActual.estado_operativo) {
            await pool.query(
                `UPDATE equipos SET estado_operativo = ?, version = version + 1
                 WHERE id = ? AND grupo_datos = ?`,
                [nuevoEstadoEquipo, equipoId, grupoDatos]
            );
        }
        return exito(res, 'Mantenimiento actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar mantenimiento.', err);
    }
}

export async function deleteMantenimiento(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await MantenimientoModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Mantenimiento no encontrado.', null, 404);

        return exito(res, 'Mantenimiento eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar mantenimiento.', err);
    }
}