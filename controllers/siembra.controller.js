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

import { LoteLarvaDTO, PrecriaDTO, EstadoPrecria } from "../dtos/siembra.dto.js";

// Servicios
import {
    isEmpty,
    isFechaValida,
    isEnteroPositivo,
    compararFechas
} from "../services/siembra.service.js";

// Modelos
import * as siembraModel from "../models/siembra.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpoLote(body, res) {
    const errores = [];

    if (isEmpty(body.codigo_lote)) errores.push("El campo codigo_lote es requerido.");
    if (isEmpty(body.proveedor)) errores.push("El campo proveedor es requerido.");
    if (isEmpty(body.laboratorio)) errores.push("El campo laboratorio es requerido.");
    if (isEmpty(body.procedencia)) errores.push("El campo procedencia es requerido.");
    if (isEmpty(body.certificado_larva)) errores.push("El campo certificado_larva es requerido.");

    if (!isEnteroPositivo(body.pl_inicial)) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.cantidad_inicial)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_ingreso)) {
        errores.push("El campo fecha_ingreso debe ser una fecha valida.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el lote.", errores, 422);
    }
    return null;
}

function validarCuerpoPrecria(body, res) {
    const errores = [];

    if (isEmpty(body.unidad_precria)) errores.push("El campo unidad_precria es requerido.");

    if (!isEnteroPositivo(body.id_lote_larva)) {
        errores.push("El campo id_lote_larva debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.id_finca)) {
        errores.push("El campo id_finca debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.pl_inicial)) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.cantidad_inicial)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_inicio)) {
        errores.push("El campo fecha_inicio debe ser una fecha valida.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para la pre-cria.", errores, 422);
    }
    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES - LOTES
//////////////////////////////////////////////////////////
*/

export function listarLotes(req, res) {
    /*
    Descripcion:
    Obtiene todos los lotes de larva activos.
    */
    const lotes = siembraModel.findLotesAll();
    return exito(res, "Lotes de larva obtenidos correctamente.", lotes);
}

export function obtenerLote(req, res) {
    /*
    Descripcion:
    Obtiene un lote de larva activo por su ID.
    */
    const { id } = req.params;
    const lote = siembraModel.findLoteById(id);
    if (!lote) {
        return error(res, "Lote de larva no encontrado.", null, 404);
    }
    return exito(res, "Lote de larva obtenido correctamente.", lote);
}

export function crearLote(req, res) {
    /*
    Descripcion:
    Crea un nuevo lote de larva.
    */
    const err = validarCuerpoLote(req.body, res);
    if (err) return err;

    const existente = siembraModel.findLoteByCodigo(req.body.codigo_lote);
    if (existente) {
        return error(res, "Ya existe un lote con ese codigo.", null, 409);
    }

    const provExiste = siembraModel.verificarProveedorExiste(req.body.proveedor);
    if (!provExiste) {
        return error(res, "El proveedor indicado no existe.", null, 400);
    }

    const dto = new LoteLarvaDTO(req.body);
    const nuevo = siembraModel.createLote(dto);
    return exito(res, "Lote de larva creado correctamente.", nuevo, 201);
}

export function actualizarLote(req, res) {
    /*
    Descripcion:
    Actualiza un lote de larva existente.
    */
    const { id } = req.params;
    const loteActual = siembraModel.findLoteById(id);
    if (!loteActual) {
        return error(res, "Lote de larva no encontrado.", null, 404);
    }

    const err = validarCuerpoLote(req.body, res);
    if (err) return err;

    const existente = siembraModel.findLoteByCodigoIgnorandoId(req.body.codigo_lote, id);
    if (existente) {
        return error(res, "Ya existe otro lote con ese codigo.", null, 409);
    }

    const provExiste = siembraModel.verificarProveedorExiste(req.body.proveedor);
    if (!provExiste) {
        return error(res, "El proveedor indicado no existe.", null, 400);
    }

    const dto = new LoteLarvaDTO(req.body);
    const actualizado = siembraModel.updateLote(id, dto);
    return exito(res, "Lote de larva actualizado correctamente.", actualizado);
}

export function eliminarLote(req, res) {
    /*
    Descripcion:
    Elimina un lote de larva (borrado logico).
    */
    const { id } = req.params;
    const eliminado = siembraModel.removeLote(id);
    if (!eliminado) {
        return error(res, "Lote de larva no encontrado.", null, 404);
    }
    return exito(res, "Lote de larva eliminado correctamente.", eliminado);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES - PRE-CRIAS
//////////////////////////////////////////////////////////
*/

export function listarPrecrias(req, res) {
    /*
    Descripcion:
    Obtiene todas las pre-crias activas.
    */
    const precrias = siembraModel.findPrecriasAll();
    return exito(res, "Pre-crias obtenidas correctamente.", precrias);
}

export function obtenerPrecria(req, res) {
    /*
    Descripcion:
    Obtiene una pre-cria activa por su ID.
    */
    const { id } = req.params;
    const pc = siembraModel.findPrecriaById(id);
    if (!pc) {
        return error(res, "Pre-cria no encontrada.", null, 404);
    }
    return exito(res, "Pre-cria obtenida correctamente.", pc);
}

export function crearPrecria(req, res) {
    /*
    Descripcion:
    Crea una nueva pre-cria.
    */
    const err = validarCuerpoPrecria(req.body, res);
    if (err) return err;

    const loteExiste = siembraModel.findLoteById(req.body.id_lote_larva);
    if (!loteExiste) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }

    const dto = new PrecriaDTO(req.body);
    const nuevo = siembraModel.createPrecria(dto);
    return exito(res, "Pre-cria creada correctamente.", nuevo, 201);
}

export function actualizarPrecria(req, res) {
    /*
    Descripcion:
    Actualiza una pre-cria existente.
    */
    const { id } = req.params;
    const pcActual = siembraModel.findPrecriaById(id);
    if (!pcActual) {
        return error(res, "Pre-cria no encontrada.", null, 404);
    }

    const err = validarCuerpoPrecria(req.body, res);
    if (err) return err;

    const loteExiste = siembraModel.findLoteById(req.body.id_lote_larva);
    if (!loteExiste) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }

    const dto = new PrecriaDTO(req.body);
    const actualizado = siembraModel.updatePrecria(id, dto);
    return exito(res, "Pre-cria actualizada correctamente.", actualizado);
}

export function finalizarPrecria(req, res) {
    /*
    Descripcion:
    Finaliza una pre-cria en estado ACTIVA aplicando las reglas de negocio.
    */
    const { id } = req.params;
    const pc = siembraModel.findPrecriaById(id);
    if (!pc) {
        return error(res, "Pre-cria no encontrada.", null, 404);
    }

    if (pc.estado !== EstadoPrecria.ACTIVA) {
        return error(res, "La pre-cria ya no se encuentra en estado ACTIVA.", null, 400);
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
        return error(res, "cantidad_final no puede ser mayor que cantidad_inicial.", null, 400);
    }

    const datosFinales = {
        estado: EstadoPrecria.FINALIZADA,
        fecha_fin,
        cantidad_final: Number(cantidad_final),
        pl_final: Number(pl_final)
    };

    const actualizado = siembraModel.updatePrecria(id, datosFinales);
    return exito(res, "Pre-cria finalizada correctamente.", actualizado);
}

export function eliminarPrecria(req, res) {
    /*
    Descripcion:
    Elimina una pre-cria (borrado logico).
    */
    const { id } = req.params;
    const eliminado = siembraModel.removePrecria(id);
    if (!eliminado) {
        return error(res, "Pre-cria no encontrada.", null, 404);
    }
    return exito(res, "Pre-cria eliminada correctamente.", eliminado);
}