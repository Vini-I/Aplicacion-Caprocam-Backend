/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.controller.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Controlador encargado de recibir las solicitudes
HTTP del modulo de productos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Servicios
import {
    listarProductos,
    obtenerProducto,
    registrarProducto,
    editarProducto,
    desactivarProducto
} from "../services/productos.service.js";

// Constantes
import {
    MENSAJES_PRODUCTO
} from "../common/productos.constants.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerProductos(req, res) {

    try {

        const productos =
            await listarProductos();

        return res.status(200).json({
            success: true,
            message: MENSAJES_PRODUCTO.PRODUCTOS_OBTENIDOS,
            data: productos
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al obtener los productos."
        );

    }

}

export async function obtenerProductoPorId(req, res) {

    try {

        const producto =
            await obtenerProducto(req.params.id);

        if (!producto) {

            return res.status(404).json({
                success: false,
                message:
                    MENSAJES_PRODUCTO.PRODUCTO_NO_ENCONTRADO
            });

        }

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_PRODUCTO.PRODUCTO_OBTENIDO,
            data: producto
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al obtener el producto."
        );

    }

}

export async function crearProducto(req, res) {

    try {

        const producto =
            await registrarProducto(req.body);

        return res.status(201).json({
            success: true,
            message:
                MENSAJES_PRODUCTO.PRODUCTO_CREADO,
            data: producto
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al crear el producto."
        );

    }

}

export async function actualizarProducto(req, res) {

    try {

        const producto =
            await editarProducto(
                req.params.id,
                req.body
            );

        if (!producto) {

            return res.status(404).json({
                success: false,
                message:
                    MENSAJES_PRODUCTO.PRODUCTO_NO_ENCONTRADO
            });

        }

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_PRODUCTO.PRODUCTO_ACTUALIZADO,
            data: producto
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al actualizar el producto."
        );

    }

}

export async function eliminarProducto(req, res) {

    try {

        const eliminado =
            await desactivarProducto(
                req.params.id
            );

        if (!eliminado) {

            return res.status(404).json({
                success: false,
                message:
                    MENSAJES_PRODUCTO.PRODUCTO_NO_ENCONTRADO
            });

        }

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_PRODUCTO.PRODUCTO_ELIMINADO
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al eliminar el producto."
        );

    }

}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function responderError(
    res,
    error,
    mensaje
) {

    return res.status(500).json({
        success: false,
        message: mensaje,
        error: error.message
    });

}

/*
//////////////////////////////////////////////////////////
PRUEBAS
//////////////////////////////////////////////////////////

GET /api/v1/productos

200 OK

*/