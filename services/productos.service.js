/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.service.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Servicio encargado de la lógica de negocio, armado de respuestas
JSON y comunicación con el modelo de datos.
//////////////////////////////////////////////////////////
*/

import {
    obtenerTodosLosProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from "../models/productos.model.js";

import { productoDTO, listaProductosDTO } from "../dtos/productos.dto.js";
import { MENSAJES_PRODUCTO } from "../common/productos.constants.js";

export async function listarProductos() {
    const productos = await obtenerTodosLosProductos();
    return {
        status: 200,
        body: {
            success: true,
            message: MENSAJES_PRODUCTO.PRODUCTOS_OBTENIDOS,
            data: listaProductosDTO(productos)
        }
    };
}

export async function obtenerProducto(id) {
    const producto = await obtenerProductoPorId(id);
    if (!producto) {
        return {
            status: 404,
            body: { success: false, message: MENSAJES_PRODUCTO.PRODUCTO_NO_ENCONTRADO }
        };
    }
    return {
        status: 200,
        body: {
            success: true,
            message: MENSAJES_PRODUCTO.PRODUCTO_OBTENIDO,
            data: productoDTO(producto)
        }
    };
}

export async function registrarProducto(datos) {
    const nuevoProducto = await crearProducto(datos);
    return {
        status: 201,
        body: {
            success: true,
            message: MENSAJES_PRODUCTO.PRODUCTO_CREADO,
            data: productoDTO(nuevoProducto)
        }
    };
}

export async function editarProducto(id, datos) {
    const producto = await actualizarProducto(id, datos);
    if (!producto) {
        return {
            status: 404,
            body: { success: false, message: MENSAJES_PRODUCTO.PRODUCTO_NO_ENCONTRADO }
        };
    }
    return {
        status: 200,
        body: {
            success: true,
            message: MENSAJES_PRODUCTO.PRODUCTO_ACTUALIZADO,
            data: productoDTO(producto)
        }
    };
}

export async function desactivarProducto(id) {
    const eliminado = await eliminarProducto(id);
    if (!eliminado) {
        return {
            status: 404,
            body: { success: false, message: MENSAJES_PRODUCTO.PRODUCTO_NO_ENCONTRADO }
        };
    }
    return {
        status: 200,
        body: { success: true, message: MENSAJES_PRODUCTO.PRODUCTO_ELIMINADO }
    };
}