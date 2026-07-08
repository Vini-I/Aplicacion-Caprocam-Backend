/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.controller.js
Autor: Jose Espinoza
Fecha: 05/07/2026
Modulo: Compradores
Descripcion:
Controlador de compradores asíncrono alineado al uso de la base de datos MySQL.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { CompradorDTO } from '../dtos/comprador.dto.js';
import * as CompradorService from '../services/comprador.service.js';
import * as CompradorModel from '../models/comprador.model.js';
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({ nombre, contacto, telefono }, res) {
    if (CompradorService.isEmpty(nombre) || CompradorService.isEmpty(contacto))
        return error(res, 'Nombre y contacto son requeridos.', null, 400);

    if (telefono && !CompradorService.isPhone(telefono))
        return error(res, 'El teléfono debe tener 8 dígitos.', null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getCompradores(req, res) {
    try {
        const data = await CompradorModel.findAll();
        return exito(res, 'Compradores obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener los compradores.', err.message, 500);
    }
}

export async function getCompradorById(req, res) {
    try {
        const comprador = await CompradorModel.findById(req.params.id);
        if (!comprador) return error(res, 'Comprador no encontrado.', null, 404);
        return exito(res, 'Comprador obtenido correctamente.', comprador);
    } catch (err) {
        return error(res, 'Error al obtener el comprador.', err.message, 500);
    }
}

export async function createComprador(req, res) {
    try {
        const { nombre, contacto, telefono } = req.body;

        const err = validarCuerpo({ nombre, contacto, telefono }, res);
        if (err) return err;

        const dto = new CompradorDTO({ nombre, contacto, telefono });
        const nuevo = await CompradorModel.create(dto);
        return exito(res, 'Comprador creado correctamente.', nuevo, 201);
    } catch (err) {
        return error(res, 'Error al crear el comprador.', err.message, 500);
    }
}

export async function updateComprador(req, res) {
    try {
        const { nombre, contacto, telefono } = req.body;

        const err = validarCuerpo({ nombre, contacto, telefono }, res);
        if (err) return err;

        const dto = new CompradorDTO({ nombre, contacto, telefono });
        const actualizado = await CompradorModel.update(req.params.id, dto);
        if (!actualizado) return error(res, 'Comprador no encontrado.', null, 404);

        return exito(res, 'Comprador actualizado correctamente.', actualizado);
    } catch (err) {
        return error(res, 'Error al actualizar el comprador.', err.message, 500);
    }
}

export async function deleteComprador(req, res) {
    try {
        const desactivado = await CompradorModel.removeLogicamente(req.params.id);
        if (!desactivado) return error(res, 'Comprador no encontrado.', null, 404);
        return exito(res, 'Comprador desactivado correctamente.', desactivado);
    } catch (err) {
        return error(res, 'Error al desactivar el comprador.', err.message, 500);
    }
}