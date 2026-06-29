/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.service.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Servicio encargado de la lógica de negocio, armado de respuestas
JSON y comunicación con el modelo de datos.
//////////////////////////////////////////////////////////
*/

import {
    obtenerTodosLosCompradores,
    obtenerCompradorPorId,
    crearComprador,
    actualizarComprador,
    eliminarComprador
} from "../models/compradores.model.js";

import { compradorDTO, listaCompradoresDTO } from "../dtos/compradores.dto.js";
import { MENSAJES_COMPRADOR } from "../common/compradores.constants.js";

export async function listarCompradores() {
    const compradores = await obtenerTodosLosCompradores();
    return {
        status: 200,
        body: {
            success: true,
            message: MENSAJES_COMPRADOR.COMPRADORES_OBTENIDOS,
            data: listaCompradoresDTO(compradores)
        }
    };
}

export async function obtenerComprador(id) {
    const comprador = await obtenerCompradorPorId(id);
    if (!comprador) {
        return {
            status: 404,
            body: { success: false, message: MENSAJES_COMPRADOR.COMPRADOR_NO_ENCONTRADO }
        };
    }
    return {
        status: 200,
        body: {
            success: true,
            message: MENSAJES_COMPRADOR.COMPRADOR_OBTENIDO,
            data: compradorDTO(comprador)
        }
    };
}

export async function registrarComprador(datos) {
    const nuevoComprador = await crearComprador(datos);
    return {
        status: 201,
        body: {
            success: true,
            message: MENSAJES_COMPRADOR.COMPRADOR_CREADO,
            data: compradorDTO(nuevoComprador)
        }
    };
}

export async function editarComprador(id, datos) {
    const comprador = await actualizarComprador(id, datos);
    if (!comprador) {
        return {
            status: 404,
            body: { success: false, message: MENSAJES_COMPRADOR.COMPRADOR_NO_ENCONTRADO }
        };
    }
    return {
        status: 200,
        body: {
            success: true,
            message: MENSAJES_COMPRADOR.COMPRADOR_ACTUALIZADO,
            data: compradorDTO(comprador)
        }
    };
}

export async function desactivarComprador(id) {
    const eliminado = await eliminarComprador(id);
    if (!eliminado) {
        return {
            status: 404,
            body: { success: false, message: MENSAJES_COMPRADOR.COMPRADOR_NO_ENCONTRADO }
        };
    }
    return {
        status: 200,
        body: { success: true, message: MENSAJES_COMPRADOR.COMPRADOR_ELIMINADO }
    };
}