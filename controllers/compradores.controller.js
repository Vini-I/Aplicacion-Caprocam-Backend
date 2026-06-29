/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.controller.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Controlador encargado de recibir solicitudes HTTP, validar 
parámetros iniciales de ruta y delegar al servicio.
//////////////////////////////////////////////////////////
*/

import {
    listarCompradores,
    obtenerComprador,
    registrarComprador,
    editarComprador,
    desactivarComprador
} from "../services/compradores.service.js";

export async function obtenerCompradores(req, res) {
    try {
        const resultado = await listarCompradores();
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al obtener los compradores.");
    }
}

export async function obtenerCompradorPorId(req, res) {
    try {
        validarId(req.params.id);
        const resultado = await obtenerComprador(req.params.id);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al obtener el comprador.");
    }
}

export async function crearComprador(req, res) {
    try {
        const resultado = await registrarComprador(req.body);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al crear el comprador.");
    }
}

export async function actualizarComprador(req, res) {
    try {
        validarId(req.params.id);
        const resultado = await editarComprador(req.params.id, req.body);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al actualizar el comprador.");
    }
}

export async function eliminarComprador(req, res) {
    try {
        validarId(req.params.id);
        const resultado = await desactivarComprador(req.params.id);
        return res.status(resultado.status).json(resultado.body);
    } catch (error) {
        return responderError(res, error, "Error al eliminar el comprador.");
    }
}

function validarId(id) {
    if (!id || Number(id) <= 0) {
        throw new Error("El identificador del comprador no es valido.");
    }
}

function responderError(res, error, mensaje) {
    return res.status(500).json({
        success: false,
        message: mensaje,
        error: error.message
    });
}