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
y devuelve la respuesta al cliente soportando contexto dual.
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

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function obtenerContextoPeticion(req) {
    /*
    Descripcion:
    Extrae grupoDatos e identificadores de auditoria independientemente
    de si la peticion proviene de un Usuario Web o Colaborador Mobil.

    Parametros:
    - req: Objeto request de Express.

    Retorna:
    - Objeto con { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId }
    */
    const grupoDatos = req.user?.grupoDatos || req.colaborador?.grupoDatos;
    const creadoPorUsuarioId = req.user?.id || null;
    const creadoPorColaboradorId = req.colaborador?.id || null;

    return { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId };
}

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
        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await ProductoModel.findAll(grupoDatos);
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
    /*
    Descripcion:
    Crea un nuevo producto capturando auditoria de sesion.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el producto creado
    */
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } = obtenerContextoPeticion(req);
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
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await ProductoModel.remove(req.params.id, grupoDatos);

        if (!eliminado)
            return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto eliminado correctamente.', eliminado);
    } catch (err) {
        return error(res, 'Error al eliminar producto.', err);
    }
}