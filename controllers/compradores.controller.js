/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.controller.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Controlador encargado de recibir las solicitudes
HTTP del modulo de compradores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Servicios
import {
    listarCompradores,
    obtenerComprador,
    registrarComprador,
    editarComprador,
    desactivarComprador
} from "../services/compradores.service.js";

// Constantes
import {
    MENSAJES_COMPRADOR
} from "../common/compradores.constants.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerCompradores(req, res) {

    try {

        const compradores =
            await listarCompradores();

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_COMPRADOR.COMPRADORES_OBTENIDOS,
            data: compradores
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al obtener los compradores."
        );

    }

}

export async function obtenerCompradorPorId(
    req,
    res
) {

    try {

        const comprador =
            await obtenerComprador(req.params.id);

        if (!comprador) {

            return res.status(404).json({
                success: false,
                message:
                    MENSAJES_COMPRADOR
                        .COMPRADOR_NO_ENCONTRADO
            });

        }

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_COMPRADOR.COMPRADOR_OBTENIDO,
            data: comprador
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al obtener el comprador."
        );

    }

}

export async function crearComprador(req, res) {

    try {

        const comprador =
            await registrarComprador(req.body);

        return res.status(201).json({
            success: true,
            message:
                MENSAJES_COMPRADOR.COMPRADOR_CREADO,
            data: comprador
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al crear el comprador."
        );

    }

}

export async function actualizarComprador(req, res) {

    try {

        const comprador =
            await editarComprador(
                req.params.id,
                req.body
            );

        if (!comprador) {

            return res.status(404).json({
                success: false,
                message:
                    MENSAJES_COMPRADOR
                        .COMPRADOR_NO_ENCONTRADO
            });

        }

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_COMPRADOR.COMPRADOR_ACTUALIZADO,
            data: comprador
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al actualizar el comprador."
        );

    }

}

export async function eliminarComprador(req, res) {

    try {

        const eliminado =
            await desactivarComprador(
                req.params.id
            );

        if (!eliminado) {

            return res.status(404).json({
                success: false,
                message:
                    MENSAJES_COMPRADOR
                        .COMPRADOR_NO_ENCONTRADO
            });

        }

        return res.status(200).json({
            success: true,
            message:
                MENSAJES_COMPRADOR.COMPRADOR_ELIMINADO
        });

    } catch (error) {

        return responderError(
            res,
            error,
            "Error al eliminar el comprador."
        );

    }

}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

// Todos los handlers de arriba dependen de esta funcion
function responderError(res, error, mensaje) {

    /*
    Descripcion:
    Centraliza el manejo de errores del controlador.

    Parametros:
    - res: Objeto de respuesta de Express.
    - error: Error capturado en el catch.
    - mensaje: Mensaje descriptivo del error.

    Retorna:
    Respuesta HTTP 500 con formato estandar.
    */

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

GET    /api/v1/compradores
GET    /api/v1/compradores/:id
POST   /api/v1/compradores
PUT    /api/v1/compradores/:id
DELETE /api/v1/compradores/:id

*/