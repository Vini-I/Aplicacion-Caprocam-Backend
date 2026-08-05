/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.controller.js
Autor: Joan Campos-Oscar Mario
Fecha: 4/08/2026
Modulo: Proveedor Larva
Descripcion:
Controlador HTTP para el modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

import { ProveedorLarvaDTO } from "../dtos/proveedorLarva.dto.js";
import * as ProveedorLarvaModel from "../models/proveedorLarva.model.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

export async function getProveedoresLarva(req, res) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo proveedorLarva.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const lista = await ProveedorLarvaModel.findAll(grupoDatos);
        return exito(res, "Proveedores de larva obtenidos correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener proveedores de larva.", err);
    }
}

export async function getProveedorLarvaById(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de proveedorLarva mediante su identificador unico.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const item = await ProveedorLarvaModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener proveedor de larva.", err);
    }
}

export async function createProveedorLarva(req, res) {
    /*
    Descripcion:
    Registra una nueva entidad de proveedorLarva en la base de datos, estructurando la informacion proveniente del cliente.
    */
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
        obtenerContextoPeticion(req);
        
        const dto = new ProveedorLarvaDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });
        
        const creado = await ProveedorLarvaModel.create(dto, grupoDatos);
        return exito(res, "Proveedor de larva creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear proveedor de larva.", err);
    }
}

export async function updateProveedorLarva(req, res) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de proveedorLarva.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        
        const dto = new ProveedorLarvaDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null
        });

        const actualizado = await ProveedorLarvaModel.update(req.params.id, dto, grupoDatos);
        if (!actualizado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar proveedor de larva.", err);
    }
}

export async function deleteProveedorLarva(req, res) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de proveedorLarva.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await ProveedorLarvaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar proveedor de larva.", err);
    }
}