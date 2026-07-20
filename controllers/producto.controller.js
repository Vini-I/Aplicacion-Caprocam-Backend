/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.controller.js
Autor: Jose Espinoza 
Fecha: 17/07/2026
Modulo: Productos
Descripcion:
Recibe peticiones HTTP de productos, invoca las validaciones del servicio,
extrae el grupoDatos del JWT y responde consumiendo el modelo asíncrono.
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
        const grupoDatos = req.user.grupoDatos; // Extracción obligatoria del JWT
        const data = await ProductoModel.findAll(grupoDatos);
        return exito(res, 'Productos obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener los productos.', err.message, 500);
    }
}

export async function getProductoById(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos; // Extracción obligatoria del JWT
        const producto = await ProductoModel.findById(req.params.id, grupoDatos);
        if (!producto) return error(res, 'Producto no encontrado.', null, 404);
        return exito(res, 'Producto obtenido correctamente.', producto);
    } catch (err) {
        return error(res, 'Error al obtener el producto.', err.message, 500);
    }
}

export async function createProducto(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos; // Extracción obligatoria del JWT
        const { nombre, categoria, cantidad, stockMinimo, precioUnidad } = req.body;

        const err = validarCuerpo({ nombre, categoria, cantidad, stockMinimo, precioUnidad }, res);
        if (err) return err;

        // Si la base de datos ocupa el encargado que registró el producto, se saca de req.user
        const encargado = req.user.nombreUsuario || req.user.id; 

        const dto = new ProductoDTO({ nombre, categoria, cantidad, stockMinimo, precioUnidad, encargado });
        const nuevo = await ProductoModel.create(dto, grupoDatos);
        return exito(res, 'Producto creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear el producto.', err.message, 500);
    }
}

export async function updateProducto(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos; // Extracción obligatoria del JWT
        const { nombre, categoria, cantidad, stockMinimo, precioUnidad } = req.body;

        const err = validarCuerpo({ nombre, categoria, cantidad, stockMinimo, precioUnidad }, res);
        if (err) return err;

        const dto = new ProductoDTO({ nombre, categoria, cantidad, stockMinimo, precioUnidad });
        const actualizado = await ProductoModel.update(req.params.id, dto, grupoDatos);
        if (!actualizado) return error(res, 'Producto no encontrado.', null, 404);

        return exito(res, 'Producto actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar el producto.', err.message, 500);
    }
}

export async function deleteProducto(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos; // Extracción obligatoria del JWT
        const desactivado = await ProductoModel.removeLogicamente(req.params.id, grupoDatos);
        if (!desactivado) return error(res, 'Producto no encontrado.', null, 404);
        return exito(res, 'Producto desactivado correctamente.', desactivado);
    } catch (err) {
        return error(res, 'Error al desactivar el producto.', err.message, 500);
    }
}