/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.controller.js
Autor: Jose Espinoza
Fecha: 05/07/2026
Modulo: Productos
Descripcion:
Recibe peticiones HTTP de productos, invoca las validaciones del servicio
y responde consumiendo el modelo asíncrono de la base de datos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { ProductoDTO, CategoriasProducto } from '../dtos/producto.dto.js';
import * as ProductoService from '../services/producto.service.js';
import * as ProductoModel from '../models/producto.model.js';
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({ nombre, categoria, cantidad, stockMinimo, precioUnidad }, res) {
    if (ProductoService.isEmpty(nombre) || ProductoService.isEmpty(categoria))
        return error(res, 'Nombre y categoria son requeridos.', null, 400);

    if (!Object.values(CategoriasProducto).includes(categoria))
        return error(res, `Categoria invalida. Opciones: ${Object.values(CategoriasProducto).join(', ')}`, null, 422);

    if (ProductoService.isNumericNegative(cantidad))
        return error(res, 'La cantidad no puede ser negativa.', null, 422);

    if (ProductoService.isNumericNegative(stockMinimo))
        return error(res, 'El stock minimo no puede ser negativo.', null, 422);

    if (ProductoService.isPrecioInvalido(precioUnidad))
        return error(res, 'El precio por unidad debe ser mayor que cero.', null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getProductos(req, res) {
    try {
        const data = await ProductoModel.findAll();
        return exito(res, 'Productos obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener los productos.', err.message, 500);
    }
}

export async function getProductoById(req, res) {
    try {
        const producto = await ProductoModel.findById(req.params.id);
        if (!producto) return error(res, 'Producto no encontrado.', null, 404);
        return exito(res, 'Producto obtenido correctamente.', producto);
    } catch (err) {
        return error(res, 'Error al obtener el producto.', err.message, 500);
    }
}

export async function createProducto(req, res) {
    try {
        const { nombre, categoria, cantidad, stockMinimo, precioUnidad } = req.body;

        const err = validarCuerpo({ nombre, categoria, cantidad, stockMinimo, precioUnidad }, res);
        if (err) return err;

        const dto = new ProductoDTO({ nombre, categoria, cantidad, stockMinimo, precioUnidad });
        const nuevo = await ProductoModel.create(dto);
        return exito(res, 'Producto creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear el producto.', err.message, 500);
    }
}

export async function updateProducto(req, res) {
    try {
        const { nombre, categoria, cantidad, stockMinimo, precioUnidad } = req.body;

        const err = validarCuerpo({ nombre, categoria, cantidad, stockMinimo, precioUnidad }, res);
        if (err) return err;

        const dto = new ProductoDTO({ nombre, categoria, cantidad, stockMinimo, precioUnidad });
        const actualizado = await ProductoModel.update(req.params.id, dto);
        if (!actualizado) return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar el producto.', err.message, 500);
    }
}

export async function deleteProducto(req, res) {
    try {
        const desactivado = await ProductoModel.removeLogicamente(req.params.id);
        if (!desactivado) return error(res, 'Producto no encontrado.', null, 404);
        return exito(res, 'Producto desactivado correctamente.', desactivado);
    } catch (err) {
        return error(res, 'Error al desactivar el producto.', err.message, 500);
    }
}