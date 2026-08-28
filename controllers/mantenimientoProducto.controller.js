/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.controller.js
Autor: Marco Vásquez
Fecha: 18/08/2026
Modulo: MantenimientoProductos
Descripcion:
Recibe las peticiones HTTP para productos vinculados a mantenimientos.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MantenimientoProductoDTO } from '../dtos/mantenimientoProducto.dto.js';

// Modelos y Config
import * as MantenimientoProductoModel from '../models/mantenimientoProducto.model.js';
import * as MantenimientoModel         from '../models/mantenimiento.model.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getProductosByMantenimiento(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT mp.*, mp.grupo_datos AS grupoDatos, p.nombre AS nombreProducto
                 FROM mantenimiento_equipo_productos mp
                 LEFT JOIN productos p ON mp.producto_id = p.id
                 WHERE mp.mantenimiento_equipo_id = ?
                   AND mp.activo = TRUE AND mp.deleted_at IS NULL`,
                [req.params.mantenimientoId]
            );
            return exito(res, 'Productos del mantenimiento obtenidos correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await MantenimientoProductoModel.findByMantenimiento(
            req.params.mantenimientoId,
            grupoDatos
        );
        return exito(res, 'Productos del mantenimiento obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener productos del mantenimiento.', err);
    }
}

export async function agregarProducto(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { mantenimientoEquipoId, productoId, cantidad } = req.body;

        const ticket = await MantenimientoModel.findById(mantenimientoEquipoId, grupoDatos);
        if (!ticket)
            return error(res, 'El mantenimiento indicado no existe.', null, 404);

        if (ticket.estadoTicket === 'Terminado') {
            return error(
                res,
                'No se pueden agregar productos a un ticket en estado Terminado. Debe reabrir el ticket para realizar modificaciones.',
                null,
                422
            );
        }

        const cantNum = Number(cantidad);
        if (isNaN(cantNum) || cantNum <= 0)
            return error(res, 'La cantidad debe ser un numero mayor a 0.', null, 400);

        let costoNum = req.body.costoUnitario !== undefined
            ? Number(req.body.costoUnitario)
            : null;

        if (costoNum === null || isNaN(costoNum)) {
            const [prods] = await pool.query(
                `SELECT precio_unidad FROM productos
                 WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
                [productoId, grupoDatos]
            );

            if (prods.length === 0)
                return error(res, 'El producto indicado no existe.', null, 404);

            costoNum = Number(prods[0].precio_unidad) || 0;
        }

        const subtotal = req.body.subtotal !== undefined
            ? Number(req.body.subtotal)
            : (cantNum * costoNum);

        const dto = new MantenimientoProductoDTO({
            mantenimientoEquipoId,
            productoId,
            cantidad: cantNum,
            costoUnitario: costoNum,
            subtotal,
        });

        const nuevo = await MantenimientoProductoModel.create(dto, grupoDatos);
        await MantenimientoModel.recalcularCostos(mantenimientoEquipoId, grupoDatos);

        return exito(res, 'Producto agregado al mantenimiento correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al agregar producto al mantenimiento.', err);
    }
}

export async function actualizarProducto(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { cantidad }   = req.body;

        const cantNum = Number(cantidad);
        if (isNaN(cantNum) || cantNum <= 0)
            return error(res, 'La cantidad debe ser un numero mayor a 0.', null, 400);

        const existente = await MantenimientoProductoModel.findById(req.params.id, grupoDatos);
        if (!existente)
            return error(res, 'Registro no encontrado.', null, 404);

        const ticket = await MantenimientoModel.findById(existente.mantenimientoEquipoId, grupoDatos);
        if (ticket && ticket.estadoTicket === 'Terminado') {
            return error(
                res,
                'No se pueden modificar productos de un ticket en estado Terminado. Debe reabrir el ticket para realizar modificaciones.',
                null,
                422
            );
        }

        let costoNum = req.body.costoUnitario !== undefined
            ? Number(req.body.costoUnitario)
            : Number(existente.costoUnitario);

        const subtotal = req.body.subtotal !== undefined
            ? Number(req.body.subtotal)
            : (cantNum * costoNum);

        const dto = new MantenimientoProductoDTO({
            cantidad: cantNum,
            costoUnitario: costoNum,
            subtotal,
        });

        const actualizado = await MantenimientoProductoModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

        await MantenimientoModel.recalcularCostos(
            existente.mantenimientoEquipoId,
            grupoDatos
        );

        return exito(
            res,
            'Producto del mantenimiento actualizado correctamente.',
            actualizado
        );
    } catch (err) {
        return error(res, 'Error al actualizar producto del mantenimiento.', err);
    }
}

export async function eliminarProducto(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const existente = await MantenimientoProductoModel.findById(req.params.id, grupoDatos);
        if (!existente)
            return error(res, 'Registro no encontrado.', null, 404);

        const ticket = await MantenimientoModel.findById(existente.mantenimientoEquipoId, grupoDatos);
        if (ticket && ticket.estadoTicket === 'Terminado') {
            return error(
                res,
                'No se pueden eliminar productos de un ticket en estado Terminado. Debe reabrir el ticket para realizar modificaciones.',
                null,
                422
            );
        }

        const eliminado = await MantenimientoProductoModel.remove(
            req.params.id,
            grupoDatos
        );

        if (!eliminado)
            return error(res, 'Registro no encontrado.', null, 404);

        await MantenimientoModel.recalcularCostos(
            eliminado.mantenimientoEquipoId,
            grupoDatos
        );

        return exito(
            res,
            'Producto eliminado del mantenimiento correctamente.',
            eliminado
        );
    } catch (err) {
        return error(res, 'Error al eliminar producto del mantenimiento.', err);
    }
}