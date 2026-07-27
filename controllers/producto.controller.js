/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.controller.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Productos
Descripcion:
Recibe las peticiones HTTP de productos, delega al modelo
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as ProductoModel from '../models/producto.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getProductos(req, res) {
    /*
    Descripcion:
    Obtiene todos los productos del grupo.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de productos
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const data       = await ProductoModel.findAll(grupoDatos);
        return exito(res, 'Productos obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener productos.', err);
    }
}

export async function getProductoById(req, res) {
    /*
    Descripcion:
    Obtiene un producto por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el producto encontrado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const producto   = await ProductoModel.findById(req.params.id, grupoDatos);

        if (!producto)
            return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto obtenido correctamente.', producto);
    } catch (err) {
        return error(res, 'Error al obtener producto.', err);
    }
}

export async function createProducto(req, res) {
    /*
    Descripcion:
    Crea un nuevo producto.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el producto creado
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const nuevo      = await ProductoModel.create(req.body, grupoDatos);

        return exito(res, 'Producto creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear producto.', err);
    }
}

export async function updateProducto(req, res) {
    /*
    Descripcion:
    Actualiza un producto existente por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el producto actualizado
    - 404 si no existe
    */
    try {
        const grupoDatos  = req.user.grupoDatos;
        const actualizado = await ProductoModel.update(
            req.params.id, 
            req.body, 
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
    /*
    Descripcion:
    Borrado logico de un producto por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el producto desactivado
    - 404 si no existe
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado  = await ProductoModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar producto.', err);
    }
}