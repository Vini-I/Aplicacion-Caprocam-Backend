/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.controller.js
Autor: Jose Espinoza
Fecha: 20/07/2026
Modulo: Compradores
Descripcion:
Maneja las peticiones HTTP para la entidad de Compradores, validando datos de entrada y encapsulando respuestas.
//////////////////////////////////////////////////////////
*/

import * as compradorModel from '../models/comprador.model.js';

/**
 * Obtiene todos los compradores activos.
 */
export async function getCompradores(req, res) {
    try {
        const compradores = await compradorModel.findAll();
        return res.status(200).json({ data: compradores });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener los compradores",
            error: error.message
        });
    }
}

/**
 * Obtiene un comprador activo por ID.
 */
export async function getCompradorPorId(req, res) {
    try {
        const { id } = req.params;
        const comprador = await compradorModel.findById(id);

        if (!comprador) {
            return res.status(404).json({ message: "Comprador no encontrado" });
        }

        return res.status(200).json({ data: comprador });
    } catch (error) {
        return res.status(500).json({
            message: "Error al obtener el comprador",
            error: error.message
        });
    }
}

/**
 * Crea un nuevo comprador aceptando 'cedula' o 'contacto'.
 */
export async function crearComprador(req, res) {
    try {
        const { nombre, cedula, contacto, telefono, correo, notas } = req.body;
        const valorCedula = cedula || contacto;

        // Validacion flexible: requiere nombre y al menos uno de los dos campos de identificacion
        if (!nombre || !valorCedula) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos requeridos: nombre y cedula (o contacto)."
            });
        }

        const dto = {
            nombre,
            cedula: valorCedula,
            telefono: telefono || null,
            correo: correo || null,
            notas: notas || null,
            grupoDatos: req.user?.grupoDatos ?? 1
        };

        const nuevoComprador = await compradorModel.create(dto);
        return res.status(201).json({ data: nuevoComprador });
    } catch (error) {
        return res.status(500).json({
            message: "Error al crear el comprador",
            error: error.message
        });
    }
}

/**
 * Actualiza la información de un comprador existente.
 */
export async function actualizarComprador(req, res) {
    try {
        const { id } = req.params;
        const { nombre, cedula, contacto, telefono, correo, notas } = req.body;
        const valorCedula = cedula || contacto;

        if (!nombre || !valorCedula) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos requeridos: nombre y cedula (o contacto)."
            });
        }

        const dto = {
            nombre,
            cedula: valorCedula,
            telefono: telefono || null,
            correo: correo || null,
            notas: notas || null
        };

        const compradorActualizado = await compradorModel.update(id, dto);

        if (!compradorActualizado) {
            return res.status(404).json({ message: "Comprador no encontrado o inactivo" });
        }

        return res.status(200).json({ data: compradorActualizado });
    } catch (error) {
        return res.status(500).json({
            message: "Error al actualizar el comprador",
            error: error.message
        });
    }
}

/**
 * Realiza la desactivacion (borrado logico) del comprador.
 */
export async function desactivarComprador(req, res) {
    try {
        const { id } = req.params;
        const compradorEliminado = await compradorModel.removeLogicamente(id);

        if (!compradorEliminado) {
            return res.status(404).json({ message: "Comprador no encontrado o ya inactivo" });
        }

        return res.status(200).json({
            message: "Comprador desactivado correctamente",
            data: compradorEliminado
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error al desactivar el comprador",
            error: error.message
        });
    }
}