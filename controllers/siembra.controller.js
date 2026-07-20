/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.controller.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Maneja las peticiones HTTP y la logica de siembra.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { SiembraDTO, EstadoSiembra } from "../dtos/siembra.dto.js";

// Servicios
import {
    isEmpty,
    isFechaValida,
    isEnteroPositivo,
    isDecimalPositivo,
    isEstadoValido,
    normalizarEstado,
} from "../services/siembra.service.js";

// Modelos
import * as siembraModel from "../models/siembra.model.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import * as precriaModel from "../models/preCria.model.js";
import { EstadoPrecria } from "../dtos/preCria.dto.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

//const grupoDatos = req.user.grupoDatos;

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
    const errores = [];
 
    if (!isEnteroPositivo(body.lote_larva_id)) {
        errores.push("El campo lote_larva_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.finca_id)) {
        errores.push("El campo finca_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.estanque_id)) {
        errores.push("El campo estanque_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.cantidad_sembrada)) {
        errores.push("El campo cantidad_sembrada debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_siembra)) {
        errores.push("El campo fecha_siembra debe ser una fecha valida.");
    }
    if (!isEmpty(body.precria_id) && !isEnteroPositivo(body.precria_id)) {
        errores.push("El campo precria_id debe ser un entero positivo.");
    }
    if (
        body.pl_siembra !== undefined && body.pl_siembra !== null &&
        !isEnteroPositivo(body.pl_siembra)
    ) {
        errores.push("El campo pl_siembra debe ser un entero positivo.");
    }
    if (
        !isEmpty(body.densidad_poblacional) &&
        !isDecimalPositivo(body.densidad_poblacional)
    ) {
        errores.push("El campo densidad_poblacional debe ser un numero positivo.");
    }
    if (!isEmpty(body.estado) && !isEstadoValido(body.estado)) {
        errores.push("El campo estado debe ser Activa o Finalizada.");
    }
 
    if (errores.length > 0) {
        return error(res, "Datos invalidos para la siembra.", errores, 422);
    }
    return null;
}
 
async function validarReferencias(body, res) {

    const lote = await loteLarvaModel.findById(body.lote_larva_id);
    if (!lote) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }
 
    const fincaExiste = await siembraModel.verificarFincaExiste(body.finca_id);
    if (!fincaExiste) {
        return error(res, "La finca indicada no existe.", null, 400);
    }
 
    const estanqueExiste = await siembraModel.verificarEstanqueExiste(
        body.estanque_id, body.finca_id
    );
    if (!estanqueExiste) {
        return error(
            res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
        );
    }
 
    // Fuente de la que sale la cantidad sembrada: precria (si se indico) o el lote directo.
    let origenCantidad = lote.cantidad_inicial;
 
    if (!isEmpty(body.precria_id)) {
        const precria = await precriaModel.findById(body.precria_id);
        if (!precria) {
            return error(res, "La pre-cria indicada no existe.", null, 400);
        }
        if (precria.lote_larva_id !== Number(loteId)) {
            return error(
                res, "La pre-cria indicada no pertenece al lote de larva indicado.", null, 400
            );
        }
        if (String(precria.estado).toLowerCase() !==  EstadoPrecria.FINALIZADA.toLocaleLowerCase()) {
            return error(
                res,
                "La pre-cria debe estar Finalizada antes de poder sembrarse.",
                null,
                400
            );
        }
        origenCantidad = precria.cantidad_final;
    }
 
    if (!isEmpty(body.cantidad_sembrada) && Number(body.cantidad_sembrada) > origenCantidad) {
        return error(
            res,
            "cantidad_sembrada no puede superar la cantidad disponible del " +
                (isEmpty(body.precria_id) ? "lote." : "pre-cria."),
            null,
            400
        );
    }
 
    return null;
}
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/
 
export async function listarSiembra(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos
        const siembras = await siembraModel.findAll(grupoDatos);
        return exito(res, "Siembras obtenidas correctamente.", siembras);
    } catch (err) {
        return error(res, "Error al obtener las siembras.", err, 500);
    }
}
 
export async function obtenerSiembra(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos
        const { id } = req.params;
        const siembra = await siembraModel.findById(id, grupoDatos);
        if (!siembra) return error(res, "Siembra no encontrada.", null, 404);
        return exito(res, "Siembra obtenida correctamente.", siembra);
    } catch (err) {
        return error(res, "Error al obtener la siembra.", err, 500);
    }
}
 
export async function crearSiembra(req, res) {
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;
 
    try {
        const grupoDatos = req.user.grupoDatos
        const errRef = await validarReferencias(req.body, res);
        if (errRef) return errRef;
 
        const dto = new SiembraDTO(req.body);
        const nueva = await siembraModel.create(dto, grupoDatos);
        return exito(res, "Siembra creada correctamente.", nueva, 201);
    } catch (err) {
        return error(res, "Error al crear la siembra.", err, 500);
    }
}
 
export async function actualizarSiembra(req, res) {
    const { id } = req.params;
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;
 
    try {
        const grupoDatos = req.user.grupoDatos
        const actual = await siembraModel.findById(id, grupoDatos);
        if (!actual) return error(res, "Siembra no encontrada.", null, 404);
 
        const errRef = await validarReferencias(req.body, res);
        if (errRef) return errRef;
 
        const dto = new SiembraDTO(req.body);
        const actualizada = await siembraModel.update(id,grupoDatos, dto);
        return exito(res, "Siembra actualizada correctamente.", actualizada);
    } catch (err) {
        return error(res, "Error al actualizar la siembra.", err, 500);
    }
}
 
export async function finalizarSiembra(req, res) {
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos
        const siembra = await siembraModel.findById(id, grupoDatos);
        if (!siembra) return error(res, "Siembra no encontrada.", null, 404);
 
        if (normalizarEstado(siembra.estado) !== EstadoSiembra.ACTIVA) {
            return error(
                res, "La siembra ya no se encuentra en estado Activa.", null, 400
            );
        }
 
        const actualizada = await siembraModel.update(id, grupoDatos, {
            estado: EstadoSiembra.FINALIZADA,
        });
        return exito(res, "Siembra finalizada correctamente.", actualizada);
    } catch (err) {
        return error(res, "Error al finalizar la siembra.", err, 500);
    }
}
 
export async function eliminarSiembra(req, res) {
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos
        const eliminada = await siembraModel.remove(id, grupoDatos);
        if (!eliminada) return error(res, "Siembra no encontrada.", null, 404);
        return exito(res, "Siembra eliminada correctamente.", eliminada);
    } catch (err) {
        return error(res, "Error al eliminar la siembra.", err, 500);
    }
}