/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.controller.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Controlador encargado de recibir solicitudes HTTP, validar 
parámetros iniciales de ruta y delegar al servicio.
//////////////////////////////////////////////////////////
*/

import {
    listarProductos,
    obtenerProducto,
    registrarProducto,
    editarProducto,
    desactivarProducto
} from "../services/productos.service.js";

export async function obtenerProductos(req, res) {
    try {
        const resultado = await listarProductos();
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al obtener los productos.");
    }
}

export async function obtenerProductoPorId(req, res) {
    try {
        validarId(req.params.id);
        const resultado = await obtenerProducto(req.params.id);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al obtener el producto.");
    }
}

export async function crearProducto(req, res) {
    try {
        const resultado = await registrarProducto(req.body);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al crear el producto.");
    }
}

export async function actualizarProducto(req, res) {
    try {
        validarId(req.params.id);
        const resultado = await editarProducto(req.params.id, req.body);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al actualizar el producto.");
    }
}

export async function eliminarProducto(req, res) {
    try {
        validarId(req.params.id);
        const resultado = await desactivarProducto(req.params.id);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al eliminar el producto.");
    }
}

function validarId(id) {
    if (!id || Number(id) <= 0) {
        throw new Error("El identificador del producto no es valido.");
    }
}

function responderError(res, error, mensaje) {
    return res.status(500).json({
        success: false,
        message: mensaje,
        error: error.message
    });
}