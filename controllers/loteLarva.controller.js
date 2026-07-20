/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarva.controller.js
Autor: Joan
Fecha: 04/07/2026
Modulo: loteLarva
Descripcion:
Maneja las peticiones HTTP y la logica de loteLarva.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { LoteLarvaDTO } from "../dtos/loteLarva.dto.js";
import {
    isEmpty,
    isFechaValida,
    isEnteroPositivo,
} from "../services/loteLarva.service.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import { exito, error } from "../common/respuestaJson.js";
 
/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/
 
function validarCuerpo(body, res) {
    const errores = [];
    const proveedorIdValor = body.proveedor_id ?? body.proveedorId;
 
    if (isEmpty(body.codigo_lote)) {
        errores.push("El campo codigo_lote es requerido.");
    }
    if (!isEnteroPositivo(body.cantidad_inicial)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_ingreso)) {
        errores.push("El campo fecha_ingreso debe ser una fecha valida.");
    }
    if (
        body.pl_inicial !== undefined && body.pl_inicial !== null &&
        !isEnteroPositivo(body.pl_inicial)
    ) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isEmpty(proveedorIdValor) && !isEnteroPositivo(proveedorIdValor)) {
        errores.push("El proveedor_id debe ser un entero positivo.");
    }
 
    if (errores.length > 0) {
        return error(res, "Datos invalidos para el lote.", errores, 422);
    }
    return null;
}
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/
 
export async function listarLotes(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos
        const lotes = await loteLarvaModel.findAll(grupoDatos);
        return exito(res, "Lotes de larva obtenidos correctamente.", lotes);
    } catch (err) {
        return error(res, "Error al obtener los lotes de larva.", err, 500);
    }
}
 
export async function obtenerLote(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos
        const { id } = req.params;
        const lote = await loteLarvaModel.findById(id, grupoDatos);
        if (!lote) return error(res, "Lote de larva no encontrado.", null, 404);
        return exito(res, "Lote de larva obtenido correctamente.", lote);
    } catch (err) {
        return error(res, "Error al obtener el lote de larva.", err, 500);
    }
}
 
export async function crearLote(req, res) {
    const err = validarCuerpo(req.body, res);
    if (err) return err;
 
    try {
        const grupoDatos = req.user.grupoDatos
        const existente = await loteLarvaModel.findByCodigo(req.body.codigo_lote, grupoDatos);
        if (existente) {
            return error(res, "Ya existe un lote con ese codigo.", null, 409);
        }
 
        const proveedorId = req.body.proveedor_id ?? req.body.proveedorId;
        if (!isEmpty(proveedorId)) {
            const existe = await loteLarvaModel.verificarProveedorExiste(proveedorId, grupoDatos);
            if (!existe) {
                return error(res, "El proveedor indicado no existe.", null, 400);
            }
        }
 
        const dto = new LoteLarvaDTO(req.body);
        const nuevo = await loteLarvaModel.createLote(dto, grupoDatos);
        return exito(res, "Lote de larva creado correctamente.", nuevo, 201);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, 'Ya existe un lote con ese codigo.', err, 409);
        }
        return error(res, "Error al crear el lote de larva.", err, 500);
    }
}
 
export async function actualizarLote(req, res) {
    const { id } = req.params;
    const err = validarCuerpo(req.body, res);
    if (err) return err;
 
    try {
        const grupoDatos = req.user.grupoDatos
        const actual = await loteLarvaModel.findById(id, grupoDatos);
        if (!actual) return error(res, "Lote de larva no encontrado.", null, 404);
 
        const existente = await loteLarvaModel.findByCodigoIgnorandoId(
            req.body.codigo_lote, id, grupoDatos
        );
        if (existente) {
            return error(res, "Ya existe otro lote con ese codigo.", null, 409);
        }
 
        const proveedorId = req.body.proveedor_id ?? req.body.proveedorId;
        if (!isEmpty(proveedorId)) {
            const existe = await loteLarvaModel.verificarProveedorExiste(proveedorId, grupoDatos);
            if (!existe) {
                return error(res, "El proveedor indicado no existe.", null, 400);
            }
        }
 
        const dto = new LoteLarvaDTO(req.body);
        const actualizado = await loteLarvaModel.update(id, dto, grupoDatos);
        return exito(res, "Lote de larva actualizado correctamente.", actualizado);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, 'Ya existe otro lote con ese codigo.', err, 409);
        }
        return error(res, "Error al actualizar el lote de larva.", err, 500);
    }
}
 
export async function eliminarLote(req, res) {
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos
        const eliminado = await loteLarvaModel.remove(id, grupoDatos);
        if (!eliminado) return error(res, "Lote de larva no encontrado.", null, 404);
        return exito(res, "Lote de larva eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el lote de larva.", err, 500);
    }
}