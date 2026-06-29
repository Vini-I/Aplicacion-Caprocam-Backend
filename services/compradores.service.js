/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.service.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Servicio encargado de la logica de negocio del modulo de compradores.
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

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function listarCompradores() {
    try {
        const compradores = await obtenerTodosLosCompradores();
        return listaCompradoresDTO(compradores);
    } catch (error) {
        throw error;
    }
}

export async function obtenerComprador(id) {
    try {
        validarId(id);
        const comprador = await obtenerCompradorPorId(id);
        if (!comprador) return null;
        return compradorDTO(comprador);
    } catch (error) {
        throw error;
    }
}

export async function registrarComprador(datos) {
    try {
        const nuevoComprador = await crearComprador(datos);
        return compradorDTO(nuevoComprador);
    } catch (error) {
        throw error;
    }
}

export async function editarComprador(id, datos) {
    try {
        validarId(id);
        const comprador = await actualizarComprador(id, datos);
        if (!comprador) return null;
        return compradorDTO(comprador);
    } catch (error) {
        throw error;
    }
}

export async function desactivarComprador(id) {
    try {
        validarId(id);
        return await eliminarComprador(id);
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
        throw new Error("El identificador del comprador no es valido.");
    }
}