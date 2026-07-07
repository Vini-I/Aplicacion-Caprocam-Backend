/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.controller.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Compradores
Descripcion:
Controlador de compradores alineado al uso de helpers JSON comunes.
//////////////////////////////////////////////////////////
*/

import { CompradorDTO } from '../dtos/comprador.dto.js';
import * as CompradorService from '../services/comprador.service.js';
import * as CompradorModel from '../models/comprador.model.js';
import { exito, error } from '../common/respuestaJson.js';

function validarCuerpo({ nombre, contacto, telefono }, res) {
    if (CompradorService.isEmpty(nombre) || CompradorService.isEmpty(contacto))
        return error(res, 'Nombre y contacto son requeridos.', null, 400);

    if (telefono && !CompradorService.isPhone(telefono))
        return error(res, 'El teléfono debe tener 8 dígitos.', null, 422);

    return null;
}

export function getCompradores(req, res) {
    const data = CompradorModel.findAll();
    return exito(res, 'Compradores obtenidos correctamente.', data);
}

export function getCompradorById(req, res) {
    const comprador = CompradorModel.findById(req.params.id);
    if (!comprador) return error(res, 'Comprador no encontrado.', null, 404);
    return exito(res, 'Comprador obtenido correctamente.', comprador);
}

export function createComprador(req, res) {
    const err = validarCuerpo(req.body, res);
    if (err) return err;

    const dto = new CompradorDTO(req.body);
    const nuevo = CompradorModel.create(dto);
    return exito(res, 'Comprador creado correctamente.', nuevo, 201);
}

export function updateComprador(req, res) {
    const err = validarCuerpo(req.body, res);
    if (err) return err;

    const dto = new CompradorDTO(req.body);
    const actualizado = CompradorModel.update(req.params.id, dto);
    if (!actualizado) return error(res, 'Comprador no encontrado.', null, 404);

    return exito(res, 'Comprador actualizado correctamente.', actualizado);
}

export function deleteComprador(req, res) {
    const desactivado = CompradorModel.removeLogicamente(req.params.id);
    if (!desactivado) return error(res, 'Comprador no encontrado.', null, 404);
    return exito(res, 'Comprador desactivado correctamente.', desactivado);
}