/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.controller.js
Autor: oscar mario
Fecha: 01/08/2026
Modulo: Procedencia
Descripcion:
Controlador HTTP para el modulo de procedencia.
//////////////////////////////////////////////////////////
*/

import * as ProcedenciaModel from "../models/procedencia.model.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

export async function getProcedencias(req, res) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo procedencia.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const lista = await ProcedenciaModel.findAll(grupoDatos);
        return exito(res, "Procedencias obtenidas correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener procedencias.", err);
    }
}

export async function getProcedenciaById(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de procedencia mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const item = await ProcedenciaModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia obtenida correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener procedencia.", err);
    }
}

export async function createProcedencia(req, res) {
    /*
    Descripcion:
    Registra una nueva entidad de procedencia en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
        obtenerContextoPeticion(req);
        const dto = new ProcedenciaDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });
        const creado = await ProcedenciaModel.create(dto, grupoDatos);
        return exito(res, "Procedencia creada correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear procedencia.", err);
    }
}

export async function updateProcedencia(req, res) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de procedencia, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const actualizado = await ProcedenciaModel.update(req.params.id, req.body, grupoDatos);
        if (!actualizado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar procedencia.", err);
    }
}

export async function deleteProcedencia(req, res) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de procedencia, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await ProcedenciaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Procedencia no encontrada.", null, 404);
        return exito(res, "Procedencia eliminada correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar procedencia.", err);
    }
}