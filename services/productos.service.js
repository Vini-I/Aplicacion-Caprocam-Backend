/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.service.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Servicio encargado de la logica de negocio del modulo de productos.
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

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function listarProductos() {
    try {
        const productos = await obtenerTodosLosProductos();
        return listaProductosDTO(productos);
    } catch (error) {
        throw error;
    }
}

export async function obtenerProducto(id) {
    try {
        validarId(id);
        const producto = await obtenerProductoPorId(id);
        if (!producto) return null;
        return productoDTO(producto);
    } catch (error) {
        throw error;
    }
}

export async function registrarProducto(datos) {
    try {
        const nuevoProducto = await crearProducto(datos);
        return productoDTO(nuevoProducto);
    } catch (error) {
        throw error;
    }
}

export async function editarProducto(id, datos) {
    try {
        validarId(id);
        const producto = await actualizarProducto(id, datos);
        if (!producto) return null;
        return productoDTO(producto);
    } catch (error) {
        throw error;
    }
}

export async function desactivarProducto(id) {
    try {
        validarId(id);
        return await eliminarProducto(id);
    } catch (error) {
        throw error;
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarId(id) {
    if (!id || Number(id) <= 0) {
        throw new Error("El identificador del producto no es valido.");
    }
}