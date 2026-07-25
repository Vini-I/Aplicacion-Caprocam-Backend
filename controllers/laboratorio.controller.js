/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: laboratorio.controller.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Laboratorio
Descripcion:
Controlador HTTP para el modulo de laboratorio.
//////////////////////////////////////////////////////////
*/

import * as LaboratorioModel from "../models/laboratorio.model.js";
import { exito, error } from "../common/respuestaJson.js";

export async function getLaboratorios(req, res) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo laboratorio.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const lista = await LaboratorioModel.findAll(grupoDatos);
        return exito(res, "Laboratorios obtenidos correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener laboratorios.", err);
    }
}

export async function getLaboratorioById(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de laboratorio mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const item = await LaboratorioModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener laboratorio.", err);
    }
}

export async function createLaboratorio(req, res) {
    /*
    Descripcion:
    Registra una nueva entidad de laboratorio en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const creado = await LaboratorioModel.create(req.body, grupoDatos);
        return exito(res, "Laboratorio creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear laboratorio.", err);
    }
}

export async function updateLaboratorio(req, res) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de laboratorio, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const actualizado = await LaboratorioModel.update(req.params.id, req.body, grupoDatos);
        if (!actualizado) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar laboratorio.", err);
    }
}

export async function deleteLaboratorio(req, res) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de laboratorio, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const grupoDatos = req.user.grupoDatos;
        const eliminado = await LaboratorioModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Laboratorio no encontrado.", null, 404);
        return exito(res, "Laboratorio eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar laboratorio.", err);
    }
}