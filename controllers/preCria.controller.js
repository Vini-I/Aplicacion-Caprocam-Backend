/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.controller.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Pre-cria
Descripcion:
Maneja las peticiones HTTP y la logica de pre-cria.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { PrecriaDTO, EstadoPrecria } from "../dtos/preCria.dto.js";
import {
    isEmpty,
    isFechaValida,
    isEnteroPositivo,
    isEstadoValido,
    normalizarEstado,
    compararFechas,
} from "../services/preCria.service.js";
import * as precriaModel from "../models/preCria.model.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import { exito, error } from "../common/respuestaJson.js";
 
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
    if (!isEnteroPositivo(body.cantidad_inicial)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    if (
        body.pl_inicial !== undefined && body.pl_inicial !== null &&
        !isEnteroPositivo(body.pl_inicial)
    ) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_inicio)) {
        errores.push("El campo fecha_inicio debe ser una fecha valida.");
    }
    if (!isEmpty(body.estado) && !isEstadoValido(body.estado)) {
        errores.push("El campo estado debe ser Activa o Finalizada.");
    }
 
    if (errores.length > 0) {
        return error(res, "Datos invalidos para la pre-cria.", errores, 422);
    }
    return null;
}
 
async function validarReferencias(body, res) {
    const loteId  = body.lote_larva_id ?? body.id_lote_larva;
    const fincaId = body.finca_id ?? body.id_finca;
 
    const lote = await loteLarvaModel.findById(loteId);
    if (!lote) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }
 
    const fincaExiste = await precriaModel.verificarFincaExiste(fincaId);
    if (!fincaExiste) {
        return error(res, "La finca indicada no existe.", null, 400);
    }
 
    const estanqueExiste = await precriaModel.verificarEstanqueExiste(
        body.estanque_id, fincaId
    );
    if (!estanqueExiste) {
        return error(
            res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
        );
    }
 
    if (!isEmpty(body.cantidad_inicial) && Number(body.cantidad_inicial) > lote.cantidad_inicial) {
        return error(
            res,
            "cantidad_inicial de la pre-cria no puede superar la cantidad_inicial del lote.",
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
 
export async function listarPrecrias(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos
        const precrias = await precriaModel.findAll(grupoDatos);
        return exito(res, "Pre-crias obtenidas correctamente.", precrias);
    } catch (err) {
        return error(res, "Error al obtener las pre-crias.", err, 500);
    }
}
 
export async function obtenerPrecria(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos
        const { id } = req.params;
        const pc = await precriaModel.findById(id, grupoDatos);
        if (!pc) return error(res, "Pre-cria no encontrada.", null, 404);
        return exito(res, "Pre-cria obtenida correctamente.", pc);
    } catch (err) {
        return error(res, "Error al obtener la pre-cria.", err, 500);
    }
}
 
export async function crearPrecria(req, res) {
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;
 
    try {
        const grupoDatos = req.user.grupoDatos
        const errRef = await validarReferencias(req.body, res);
        if (errRef) return errRef;
 
        const dto = new PrecriaDTO(req.body);
        const nuevo = await precriaModel.create(dto, grupoDatos);
        return exito(res, "Pre-cria creada correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear la pre-cria.", err, 500);
    }
}
 
export async function actualizarPrecria(req, res) {
    const { id } = req.params;
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;
 
    try {
        const grupoDatos = req.user.grupoDatos
        const actual = await precriaModel.findById(id, grupoDatos);
        if (!actual) return error(res, "Pre-cria no encontrada.", null, 404);
 
        const errRef = await validarReferencias(req.body, res);
        if (errRef) return errRef;
 
        const dto = new PrecriaDTO(req.body);
        const actualizado = await precriaModel.update(id, dto, grupoDatos);
        return exito(res, "Pre-cria actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar la pre-cria.", err, 500);
    }
}
 
export async function finalizarPrecria(req, res) {
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos
        const pc = await precriaModel.findById(id, grupoDatos);
        if (!pc) return error(res, "Pre-cria no encontrada.", null, 404);
 
        if (normalizarEstado(pc.estado) !== EstadoPrecria.ACTIVA) {
            return error(
                res, "La pre-cria ya no se encuentra en estado Activa.", null, 400
            );
        }
 
        const { fecha_fin, cantidad_final, pl_final } = req.body;
        const errores = [];
        if (!isFechaValida(fecha_fin)) errores.push("fecha_fin debe ser una fecha valida.");
        if (!isEnteroPositivo(cantidad_final)) errores.push("cantidad_final debe ser entero positivo.");
        if (!isEnteroPositivo(pl_final)) errores.push("pl_final debe ser entero positivo.");
        if (errores.length > 0) {
            return error(res, "Datos invalidos para finalizar pre-cria.", errores, 422);
        }
 
        if (!compararFechas(pc.fecha_inicio, fecha_fin)) {
            return error(res, "fecha_fin no puede ser menor que fecha_inicio.", null, 400);
        }
        if (Number(cantidad_final) > pc.cantidad_inicial) {
            return error(
                res, "cantidad_final no puede ser mayor que cantidad_inicial.", null, 400
            );
        }
 
        const d1 = new Date(pc.fecha_inicio);
        const d2 = new Date(fecha_fin);
        const duracion_dias = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
 
        const actualizado = await precriaModel.update(id, {
            estado: EstadoPrecria.FINALIZADA,
            fecha_fin,
            cantidad_final: Number(cantidad_final),
            pl_final: Number(pl_final),
            duracion_dias,
        }, grupoDatos);
        return exito(res, "Pre-cria finalizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al finalizar la pre-cria.", err, 500);
    }
}
 
export async function eliminarPrecria(req, res) {
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos
        const eliminado = await precriaModel.remove(id);
        if (!eliminado) return error(res, "Pre-cria no encontrada.", null, 404);
        return exito(res, "Pre-cria eliminada correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar la pre-cria.", err, 500);
    }
}