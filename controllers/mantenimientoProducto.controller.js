/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.controller.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoProductos
Descripcion:
Recibe las peticiones HTTP para el modulo de productos
vinculados a mantenimientos y devuelve la respuesta.
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

// Common
import { exito, error } from '../common/respuestaJson.js';

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
        const grupoDatos = req.user.grupoDatos;
        const data       = await MantenimientoProductoModel.findByMantenimiento(
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

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el vinculo creado
    - 400 si faltan campos
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { mantenimientoEquipoId, productoId, cantidad, costoUnitario, subtotal } = req.body;

        const dto   = new MantenimientoProductoDTO({ mantenimientoEquipoId, productoId, cantidad, costoUnitario, subtotal });
        const nuevo = await MantenimientoProductoModel.create(dto, grupoDatos);

        return exito(res, 'Producto agregado al mantenimiento correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al agregar producto al mantenimiento.', err);
    }
}

export async function actualizarProducto(req, res) {
    /*
    Descripcion:
    Actualiza cantidad, costo y subtotal de un producto en un mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro actualizado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { cantidad, costoUnitario, subtotal } = req.body;

        const dto         = new MantenimientoProductoDTO({ cantidad, costoUnitario, subtotal });
        const actualizado = await MantenimientoProductoModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado)
            return error(res, 'Registro no encontrado.', null, 404);

        return exito(res, 'Producto del mantenimiento actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar producto del mantenimiento.', err);
    }
}

export async function eliminarProducto(req, res) {
    /*
    Descripcion:
    Elimina el vinculo de un producto con un mantenimiento.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro eliminado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado  = await MantenimientoProductoModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Registro no encontrado.', null, 404);

        return exito(res, 'Producto eliminado del mantenimiento correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar producto del mantenimiento.', err);
    }
}