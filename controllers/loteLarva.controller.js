/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarva.controller.js
Autor: oscar mario
Fecha: 1/08/2026
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
    isCodigoLarvaValido,
} from "../services/loteLarva.service.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";
 
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
    } else if (!isCodigoLarvaValido(body.codigo_lote)) {
        errores.push(
            "El campo codigo_lote solo puede contener letras y numeros, con un maximo de 14 caracteres."
        );
    }
    if (!isEmpty(body.certificado_larva) && !isCodigoLarvaValido(body.certificado_larva)) {
        errores.push(
            "El campo certificado_larva solo puede contener letras y numeros, con un maximo de 14 caracteres."
        );
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
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo loteLarva.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const lotes = await loteLarvaModel.findAll(grupoDatos);
        return exito(res, "Lotes de larva obtenidos correctamente.", lotes);
    } catch (err) {
        return error(res, "Error al obtener los lotes de larva.", err, 500);
    }
}
 
export async function obtenerLote(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de loteLarva mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { id } = req.params;
        const lote = await loteLarvaModel.findById(id, grupoDatos);
        if (!lote) return error(res, "Lote de larva no encontrado.", null, 404);
        return exito(res, "Lote de larva obtenido correctamente.", lote);
    } catch (err) {
        return error(res, "Error al obtener el lote de larva.", err, 500);
    }
}
 
export async function crearLote(req, res) {
    /*
    Descripcion:
    Registra una nueva entidad de loteLarva en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
const err = validarCuerpo(req.body, res);
    if (err) return err;
 
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
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
 
        const dto = new LoteLarvaDTO({
            ...req.body,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
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
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de loteLarva, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
const { id } = req.params;
    const err = validarCuerpo(req.body, res);
    if (err) return err;
 
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
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
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de loteLarva, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
const { id } = req.params;
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await loteLarvaModel.remove(id, grupoDatos);
        if (!eliminado) return error(res, "Lote de larva no encontrado.", null, 404);
        return exito(res, "Lote de larva eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el lote de larva.", err, 500);
    }
}