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
import { LoteLarvaDTO, EstadoLote } from "../dtos/loteLarva.dto.js";
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
    const laboratorioIdValor  = body.laboratorio_id ?? body.laboratorioId;
    const procedenciaIdValor  = body.procedencia_id ?? body.procedenciaId;
 
    const codigoLoteFinal = body.codigo_lote ?? body.codigoLote;
    const certLarvaFinal = body.certificado_larva ?? body.certificadoLarva;
    const cantInicialFinal = body.cantidad_inicial ?? body.cantidadInicial;
    const fechaIngresoFinal = body.fecha_ingreso ?? body.fechaIngreso;
    const plInicialFinal = body.pl_inicial ?? body.plInicial;

    if (isEmpty(codigoLoteFinal)) {
        errores.push("El campo codigo_lote es requerido.");
    } else if (!isCodigoLarvaValido(codigoLoteFinal)) {
        errores.push(
            "El campo codigo_lote solo puede contener letras y numeros, con un maximo de 14 caracteres."
        );
    }
    if (!isEmpty(certLarvaFinal) && !isCodigoLarvaValido(certLarvaFinal)) {
        errores.push(
            "El campo certificado_larva solo puede contener letras y numeros, con un maximo de 14 caracteres."
        );
    }
    if (!isEnteroPositivo(cantInicialFinal)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(fechaIngresoFinal)) {
        errores.push("El campo fecha_ingreso debe ser una fecha valida.");
    }
    if (
        plInicialFinal !== undefined && plInicialFinal !== null &&
        !isEnteroPositivo(plInicialFinal)
    ) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isEmpty(proveedorIdValor) && !isEnteroPositivo(proveedorIdValor)) {
        errores.push("El proveedor_id debe ser un entero positivo.");
    }
    if (!isEmpty(laboratorioIdValor) && !isEnteroPositivo(laboratorioIdValor)) {
        errores.push("El laboratorio_id debe ser un entero positivo.");
    }
    if (!isEmpty(procedenciaIdValor) && !isEnteroPositivo(procedenciaIdValor)) {
        errores.push("El procedencia_id debe ser un entero positivo.");
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
        
        const codigoLoteFinal = req.body.codigo_lote ?? req.body.codigoLote;
        const proveedorIdFinal = req.body.proveedor_id ?? req.body.proveedorId;
        const laboratorioIdFinal = req.body.laboratorio_id ?? req.body.laboratorioId;
        const procedenciaIdFinal = req.body.procedencia_id ?? req.body.procedenciaId;

        const existente = await loteLarvaModel.findByCodigo(codigoLoteFinal, grupoDatos);
        if (existente) {
            return error(res, "Ya existe un lote con ese codigo.", null, 409);
        }
 
        if (!isEmpty(proveedorIdFinal)) {
            const existe = await loteLarvaModel.verificarProveedorExiste(proveedorIdFinal, grupoDatos);
            if (!existe) {
                return error(res, "El proveedor indicado no existe.", null, 400);
            }
        }
 
        if (!isEmpty(laboratorioIdFinal)) {
            const existe = await loteLarvaModel.verificarLaboratorioExiste(laboratorioIdFinal, grupoDatos);
            if (!existe) {
                return error(res, "El laboratorio indicado no existe.", null, 400);
            }
        }
 
        if (!isEmpty(procedenciaIdFinal)) {
            const existe = await loteLarvaModel.verificarProcedenciaExiste(procedenciaIdFinal, grupoDatos);
            if (!existe) {
                return error(res, "La procedencia indicada no existe.", null, 400);
            }
        }
 
        const dto = new LoteLarvaDTO({
            codigoLote: codigoLoteFinal,
            proveedorId: proveedorIdFinal,
            laboratorioId: laboratorioIdFinal,
            procedenciaId: procedenciaIdFinal,
            certificadoLarva: req.body.certificado_larva ?? req.body.certificadoLarva,
            plInicial: req.body.pl_inicial ?? req.body.plInicial,
            cantidadInicial: req.body.cantidad_inicial ?? req.body.cantidadInicial,
            fechaIngreso: req.body.fecha_ingreso ?? req.body.fechaIngreso,
            estadoLote: req.body.estado_lote ?? req.body.estadoLote,
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
 
        if (actual.estado_lote !== EstadoLote.DISPONIBLE) {
            return error(
                res,
                "No se puede actualizar un lote que ya no esta Disponible " +
                    `(estado actual: ${actual.estado_lote}). Una vez que un lote ` +
                    "entra a pre-cria o se siembra, sus datos de origen quedan fijos.",
                null,
                409
            );
        }

        const codigoLoteFinal = req.body.codigo_lote ?? req.body.codigoLote;
        const proveedorIdFinal = req.body.proveedor_id ?? req.body.proveedorId;
        const laboratorioIdFinal = req.body.laboratorio_id ?? req.body.laboratorioId;
        const procedenciaIdFinal = req.body.procedencia_id ?? req.body.procedenciaId;

        const existente = await loteLarvaModel.findByCodigoIgnorandoId(
            codigoLoteFinal, id, grupoDatos
        );
        if (existente) {
            return error(res, "Ya existe otro lote con ese codigo.", null, 409);
        }
 
        if (!isEmpty(proveedorIdFinal)) {
            const existe = await loteLarvaModel.verificarProveedorExiste(proveedorIdFinal, grupoDatos);
            if (!existe) {
                return error(res, "El proveedor indicado no existe.", null, 400);
            }
        }
        
        if (!isEmpty(laboratorioIdFinal)) {
            const existe = await loteLarvaModel.verificarLaboratorioExiste(laboratorioIdFinal, grupoDatos);
            if (!existe) {
                return error(res, "El laboratorio indicado no existe.", null, 400);
            }
        }
 
        if (!isEmpty(procedenciaIdFinal)) {
            const existe = await loteLarvaModel.verificarProcedenciaExiste(procedenciaIdFinal, grupoDatos);
            if (!existe) {
                return error(res, "La procedencia indicada no existe.", null, 400);
            }
        }
 
        const dto = new LoteLarvaDTO({
            codigoLote: codigoLoteFinal,
            proveedorId: proveedorIdFinal,
            laboratorioId: laboratorioIdFinal,
            procedenciaId: procedenciaIdFinal,
            certificadoLarva: req.body.certificado_larva ?? req.body.certificadoLarva,
            plInicial: req.body.pl_inicial ?? req.body.plInicial,
            cantidadInicial: req.body.cantidad_inicial ?? req.body.cantidadInicial,
            fechaIngreso: req.body.fecha_ingreso ?? req.body.fechaIngreso,
            estadoLote: req.body.estado_lote ?? req.body.estadoLote,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null,
        });
        
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