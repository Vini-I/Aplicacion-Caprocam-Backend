/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.controller.js
Autor: Jose Espinoza
Fecha: 20/07/2026
Modulo: Compradores
Descripcion:
Controlador que gestiona las peticiones HTTP y orquesta las respuestas para Compradores.
//////////////////////////////////////////////////////////
*/

import * as compradorModel from '../models/comprador.model.js';

/**
 * Obtiene todos los compradores.
 */
export async function getCompradores(req, res) {
    try {
        const compradores = await compradorModel.findAll();
        return res.status(200).json({ data: compradores });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

/**
 * Obtiene un comprador por ID.
 */
export async function getCompradorPorId(req, res) {
    try {
        const { id } = req.params;
        const comprador = await compradorModel.findById(id);

        if (!comprador) {
            return res.status(404).json({ message: 'Comprador no encontrado' });
        }

        return res.status(200).json({ data: comprador });
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}

/**
 * Crea un comprador.
 */
export async function crearComprador(req, res) {
    try {
        const dto = {
            ...req.body,
            grupoDatos: req.grupoDatos ?? 1
        };

        const nuevoComprador = await compradorModel.create(dto);
        return res.status(201).json({ data: nuevoComprador });
    } catch (error) {
        return res.status(500).json({ message: 'Error al crear el comprador', error: error.message });
    }
}

/**
 * Actualiza un comprador.
 */
export async function actualizarComprador(req, res) {
    try {
        const { id } = req.params;
        const compradorActualizado = await compradorModel.update(id, req.body);

        if (!compradorActualizado) {
            return res.status(404).json({ message: 'Comprador no encontrado o inactivo' });
        }

        return res.status(200).json({ data: compradorActualizado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar el comprador', error: error.message });
    }
}

/**
 * Desactiva un comprador (borrado lógico).
 */
export async function desactivarComprador(req, res) {
    try {
        const { id } = req.params;
        const compradorEliminado = await compradorModel.removeLogicamente(id);

        if (!compradorEliminado) {
            return res.status(404).json({ message: 'Comprador no encontrado o inactivo' });
        }

        return res.status(200).json({ data: compradorEliminado });
    } catch (error) {
        return res.status(500).json({ message: 'Error al desactivar el comprador', error: error.message });
    }
}