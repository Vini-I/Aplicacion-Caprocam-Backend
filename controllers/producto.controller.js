/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.controller.js
Autor: Jose Espinoza
Fecha: 20/07/2026
Modulo: Productos
Descripcion:
Controlador que gestiona las peticiones HTTP y orquesta las respuestas para Productos.
//////////////////////////////////////////////////////////
*/

import * as productoModel from '../models/producto.model.js';

/**
 * Obtiene todos los productos.
 */
export async function getProductos(req, res) {
    try {
        const productos = await productoModel.findAll();
        return res.status(200).json({ data: productos });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

/**
 * Obtiene un producto por ID.
 */
export async function getProductoPorId(req, res) {
    try {
        const { id } = req.params;
        const producto = await productoModel.findById(id);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        return res.status(200).json({ data: producto });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

/**
 * Crea un producto.
 */
export async function crearProducto(req, res) {
    try {
        const dto = {
            ...req.body,
            grupoDatos: req.grupoDatos ?? 1
        };

        const nuevoProducto = await productoModel.create(dto);
        return res.status(201).json({ data: nuevoProducto });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    }
}

/**
 * Actualiza un producto.
 */
export async function actualizarProducto(req, res) {
    try {
        const { id } = req.params;
        const productoActualizado = await productoModel.update(id, req.body);

        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
        }

        return res.status(200).json({ data: productoActualizado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    }
}

/**
 * Desactiva un producto (borrado lógico).
 */
export async function desactivarProducto(req, res) {
    try {
        const { id } = req.params;
        const productoEliminado = await productoModel.removeLogicamente(id);

        if (!productoEliminado) {
            return res.status(404).json({ message: 'Producto no encontrado o inactivo' });
        }

        return res.status(200).json({ data: productoEliminado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al desactivar el producto', error: error.message });
    }
}