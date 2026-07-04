/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.controller.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Productos
Descripcion:
Recibe peticiones HTTP de productos, invoca las validaciones del servicio
y responde usando el helper estandarizado de JSON.
//////////////////////////////////////////////////////////
*/

import { ProductoDTO, CategoriasProducto } from '../dtos/producto.dto.js';
import * as ProductoService from '../services/producto.service.js';
import * as ProductoModel from '../models/producto.model.js';
import { exito, error } from '../common/respuestaJson.js';

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

export function getProductos(req, res) {
    const data = ProductoModel.findAll();
    return exito(res, 'Productos obtenidos correctamente.', data);
}

export function getProductoById(req, res) {
    const producto = ProductoModel.findById(req.params.id);
    if (!producto) return error(res, 'Producto no encontrado.', null, 404);
    return exito(res, 'Producto obtenido correctamente.', producto);
}

export function createProducto(req, res) {
    const err = validarCuerpo(req.body, res);
    if (err) return err;

    const dto = new ProductoDTO(req.body);
    const nuevo = ProductoModel.create(dto);
    return exito(res, 'Producto creado correctamente.', nuevo, 201);
}

export function updateProducto(req, res) {
    const err = validarCuerpo(req.body, res);
    if (err) return err;

    const dto = new ProductoDTO(req.body);
    const actualizado = ProductoModel.update(req.params.id, dto);
    if (!actualizado) return error(res, 'Producto no encontrado.', null, 404);

    return exito(res, 'Producto actualizado correctamente.', actualizado);
}

export function deleteProducto(req, res) {
    const desactivado = ProductoModel.removeLogicamente(req.params.id);
    if (!desactivado) return error(res, 'Producto no encontrado.', null, 404);
    return exito(res, 'Producto desactivado correctamente.', desactivado);
}