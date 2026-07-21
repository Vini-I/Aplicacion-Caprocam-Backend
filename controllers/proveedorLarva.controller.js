/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.controller.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Proveedor Larva
Descripcion:
Controlador HTTP para el modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

import * as ProveedorLarvaModel from "../models/proveedorLarva.model.js";
import { exito, error } from "../common/respuestaJson.js";

export async function getProveedoresLarva(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const lista = await ProveedorLarvaModel.findAll(grupoDatos);
        return exito(res, "Proveedores de larva obtenidos correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener proveedores de larva.", err);
    }
}

export async function getProveedorLarvaById(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const item = await ProveedorLarvaModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener proveedor de larva.", err);
    }
}

export async function createProveedorLarva(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const creado = await ProveedorLarvaModel.create(req.body, grupoDatos);
        return exito(res, "Proveedor de larva creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear proveedor de larva.", err);
    }
}

export async function updateProveedorLarva(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const actualizado = await ProveedorLarvaModel.update(req.params.id, req.body, grupoDatos);
        if (!actualizado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar proveedor de larva.", err);
    }
}

export async function deleteProveedorLarva(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado = await ProveedorLarvaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar proveedor de larva.", err);
    }
}