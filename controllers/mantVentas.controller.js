/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.controller.js
Autor: Greivin Arguedas, Ricardo Chaves / Marco Vásquez
Fecha: 18/08/2026
Modulo: Ventas
Descripcion:
Recibe las peticiones HTTP, delega y devuelve respuesta.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { mantVentaDTO } from '../dtos/mantVentas.dto.js';
import * as VentaModel from '../models/mantVentas.model.js';
import pool from '../config/database.js';
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getVentas(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca, estanque,
                        peso_promedio AS pesoPromedio, cant_vendida AS cantVendida,
                        precio_kilo AS precioKilo, fecha, total, comprador, activo
                 FROM mant_ventas WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Ventas obtenidas correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await VentaModel.findAll(grupoDatos);
        return exito(res, 'Ventas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener las ventas.', err, 500);
    }
}

export async function getVentaById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca, estanque,
                        peso_promedio AS pesoPromedio, cant_vendida AS cantVendida,
                        precio_kilo AS precioKilo, fecha, total, comprador, activo
                 FROM mant_ventas WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Venta no encontrada.', null, 404);
            return exito(res, 'Venta obtenida correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const registro = await VentaModel.findById(req.params.id, grupoDatos);
        if (!registro) {
            return error(res, 'Venta no encontrada.', null, 404);
        }
        return exito(res, 'Venta obtenida correctamente.', registro);
    } catch (err) {
        return error(res, 'Error al obtener la venta.', err, 500);
    }
}

export async function createVenta(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const {
            id,
            finca,
            estanque,
            pesoPromedio,
            cantVendida,
            precioKilo,
            fecha,
            total,
            comprador
        } = req.body;

        const dto = new mantVentaDTO(
            grupoDatos,
            id,
            finca,
            estanque,
            pesoPromedio,
            cantVendida,
            precioKilo,
            fecha,
            total,
            comprador,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        );

        const nuevoRegistro = await VentaModel.create(dto);
        return exito(res, 'Venta creada correctamente.', nuevoRegistro, 201);
    } catch (err) {
        return error(res, 'Error al crear la venta.', err, 500);
    }
}

export async function updateVenta(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const {
            id,
            finca,
            estanque,
            pesoPromedio,
            cantVendida,
            precioKilo,
            fecha,
            total,
            comprador
        } = req.body;

        const dto = new mantVentaDTO(
            grupoDatos,
            id,
            finca,
            estanque,
            pesoPromedio,
            cantVendida,
            precioKilo,
            fecha,
            total,
            comprador
        );

        const actualizado = await VentaModel.update(
            req.params.id,
            grupoDatos,
            dto
        );

        if (!actualizado) {
            return error(res, 'Venta no encontrada.', null, 404);
        }

        return exito(res, 'Venta actualizada correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar la venta.', err, 500);
    }
}

export async function deleteVenta(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await VentaModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, 'Venta no encontrada.', null, 404);
        }

        return exito(res, 'Venta eliminada correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar la venta.', err, 500);
    }
}