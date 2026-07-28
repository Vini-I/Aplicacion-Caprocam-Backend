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
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo proveedorLarva.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
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
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
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
    /*
    Descripcion:
    Registra una nueva entidad de proveedorLarva en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const creado = await ProveedorLarvaModel.create(req.body, grupoDatos);
        return exito(res, "Proveedor de larva creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear proveedor de larva.", err);
    }
}

export async function updateProveedorLarva(req, res) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de proveedorLarva, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
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
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de proveedorLarva, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado = await ProveedorLarvaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar proveedor de larva.", err);
    }
}