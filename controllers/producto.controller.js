/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.controller.js
Autor: Jose Espinoza / Marco Vásquez
Fecha: 18/08/2026
Modulo: Productos
Descripcion:
Recibe las peticiones HTTP de productos, delega al modelo.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos y DTOs
*/

import * as ProductoModel from '../models/producto.model.js';
import { ProductoDTO } from '../dtos/producto.dto.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getProductos(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion,
                        unidad_medida AS unidadMedida, precio_unidad AS precioUnidad,
                        activo
                 FROM productos WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Productos obtenidos correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await ProductoModel.findAll(grupoDatos);
        return exito(res, 'Productos obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener productos.', err);
    }
}

export async function getProductoById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion,
                        unidad_medida AS unidadMedida, precio_unidad AS precioUnidad,
                        activo
                 FROM productos WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Producto no encontrado.', null, 404);
            return exito(res, 'Producto obtenido correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const producto = await ProductoModel.findById(req.params.id, grupoDatos);

        if (!producto)
            return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto obtenido correctamente.', producto);
    } catch (err) {
        return error(res, 'Error al obtener producto.', err);
    }
}

export async function createProducto(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new ProductoDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });
        const nuevo = await ProductoModel.create(dto, grupoDatos);

        return exito(res, 'Producto creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear producto.', err);
    }
}

export async function updateProducto(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const dto = new ProductoDTO({ ...req.body, grupoDatos });
        const actualizado = await ProductoModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

        if (!actualizado)
            return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar producto.', err);
    }
}

export async function deleteProducto(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await ProductoModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar producto.', err);
    }
}