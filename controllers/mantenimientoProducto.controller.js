/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.controller.js
Autor: Marco Vásquez
Fecha: 30/07/2026
Modulo: MantenimientoProductos
Descripcion:
Recibe las peticiones HTTP para el modulo de productos
vinculados a mantenimientos. Extrae precio_unidad de la BD,
calcula subtotal y recalcula costos del ticket de forma automatica.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MantenimientoProductoDTO } from '../dtos/mantenimientoProducto.dto.js';

// Modelos
import * as MantenimientoProductoModel from '../models/mantenimientoProducto.model.js';
import * as MantenimientoModel         from '../models/mantenimiento.model.js';

// Config
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
    /*
    Descripcion:
    Obtiene todos los productos de un ticket de mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.params.mantenimientoId)
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de productos del mantenimiento
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const data           = await MantenimientoProductoModel.findByMantenimiento(
            req.params.mantenimientoId,
            grupoDatos
        );
        return exito(res, 'Productos del mantenimiento obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener productos del mantenimiento.', err);
    }
}

export async function agregarProducto(req, res) {
    /*
    Descripcion:
    Vincula un producto a un ticket de mantenimiento.
    Extrae el precio_unidad de la tabla productos en BD si no viene.
    Calcula subtotal de forma automatica y recalcula los
    costos totales del ticket.

    Parametros:
    - req: Objeto request de Express (req.body: { mantenimientoEquipoId, productoId, cantidad })
    - res: Objeto response de Express

    Retorna:
    - 201 con el vinculo creado
    - 400/404 si faltan campos o no existe el producto/ticket
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { mantenimientoEquipoId, productoId, cantidad } = req.body;

        const cantNum = Number(cantidad);
        if (isNaN(cantNum) || cantNum <= 0)
            return error(res, 'La cantidad debe ser un numero mayor a 0.', null, 400);

        // Buscar el precio de unidad en la tabla productos de la BD
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

        const dto   = new MantenimientoProductoDTO({
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
    /*
    Descripcion:
    Actualiza cantidad, costo y subtotal de un producto en un mantenimiento.
    Recalcula costo_productos y costo_total_estimado del ticket.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro actualizado
    - 404 si no existe
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { cantidad }   = req.body;

        const cantNum = Number(cantidad);
        if (isNaN(cantNum) || cantNum <= 0)
            return error(res, 'La cantidad debe ser un numero mayor a 0.', null, 400);

        const existente = await MantenimientoProductoModel.findById(req.params.id, grupoDatos);
        if (!existente)
            return error(res, 'Registro no encontrado.', null, 404);

        let costoNum = req.body.costoUnitario !== undefined
            ? Number(req.body.costoUnitario)
            : Number(existente.costoUnitario);

        const subtotal = req.body.subtotal !== undefined
            ? Number(req.body.subtotal)
            : (cantNum * costoNum);

        const dto         = new MantenimientoProductoDTO({
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
    /*
    Descripcion:
    Elimina el vinculo de un producto con un mantenimiento.
    Recalcula costo_productos y costo_total_estimado del ticket.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro eliminado
    - 404 si no existe
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado      = await MantenimientoProductoModel.remove(
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