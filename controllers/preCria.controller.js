/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.controller.js
Autor: Joan Campos-Oscar Mario
Fecha: 4/08/2026
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
import { LoteLarvaDTO } from "../dtos/loteLarva.dto.js";
import {
    isEmpty,
    isFechaValida,
    isEnteroPositivo,
    isEstadoValido,
    normalizarEstado,
    compararFechas,
} from "../services/preCria.service.js";
import { isCodigoLarvaValido } from "../services/loteLarva.service.js";
import * as precriaModel from "../models/preCria.model.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";
 
/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/
 
function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida que el cuerpo de la peticion contenga los campos
    requeridos y con el formato correcto para una pre-cria.
    */
    const errores = [];
 
    if (!isEnteroPositivo(body.lote_larva_id ?? body.loteLarvaId)) {
        errores.push("El campo lote_larva_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.finca_id ?? body.fincaId)) {
        errores.push("El campo finca_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.estanque_id ?? body.estanqueId)) {
        errores.push("El campo estanque_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.cantidad_inicial ?? body.cantidadInicial)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    const plInicialValor = body.pl_inicial ?? body.plInicial;
    if (
        plInicialValor !== undefined && plInicialValor !== null &&
        !isEnteroPositivo(plInicialValor)
    ) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_inicio ?? body.fechaInicio)) {
        errores.push("El campo fecha_inicio debe ser una fecha valida.");
    }
    const duracionDiasValor = body.duracion_dias ?? body.duracionDias;
    if (
        !isEmpty(duracionDiasValor) &&
        !isEnteroPositivo(duracionDiasValor)
    ) {
        errores.push("El campo duracion_dias debe ser un entero positivo.");
    }
    if (!isEmpty(body.estado)) {
        errores.push(
            "El campo estado no se puede establecer aqui. Una pre-cria siempre " +
                "nace 'Activa'; para finalizarla usa POST /precrias/:id/finalizar."
        );
    }
 
    if (errores.length > 0) {
        return error(res, "Datos invalidos para la pre-cria.", errores, 422);
    }
    return null;
}
 
async function validarReferencias(body, res, grupoDatos, opciones = {}) {
    /*
    Descripcion:
    Verifica que el lote de larva, la finca y el estanque
    indicados en el body existan y sean validos en la base
    de datos para el grupo de datos actual.
    Parametros:
    - opciones.precriaIdActual: id de la pre-cria que se esta
      actualizando (para excluirla de la validacion de "estanque
      con pre-cria activa"). null cuando se esta creando.
    */
    const { precriaIdActual = null } = opciones;
    const loteId  = body.lote_larva_id ?? body.loteLarvaId ?? body.id_lote_larva;
    const fincaId = body.finca_id ?? body.fincaId ?? body.id_finca;
    const estanqueId = body.estanque_id ?? body.estanqueId;
 
    const lote = await loteLarvaModel.findById(loteId, grupoDatos);
    if (!lote) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }
 
    const fincaExiste = await precriaModel.verificarFincaExiste(fincaId, grupoDatos);
    if (!fincaExiste) {
        return error(res, "La finca indicada no existe.", null, 400);
    }
 
    const estanqueExiste = await precriaModel.verificarEstanqueExiste(
        estanqueId, fincaId, grupoDatos
    );
    if (!estanqueExiste) {
        return error(
            res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
        );
    }
 
    // Un estanque solo puede tener una pre-cria Activa a la vez.
    const precriaActivaExistente = await precriaModel.findActivaByEstanque(
        estanqueId, grupoDatos, precriaIdActual
    );
    if (precriaActivaExistente) {
        return error(res, "El estanque indicado ya tiene una pre-cria activa.", null, 409);
    }
 
    const cantidadInicialValor = body.cantidad_inicial ?? body.cantidadInicial;
    if (!isEmpty(cantidadInicialValor) && Number(cantidadInicialValor) > lote.cantidad_inicial) {
        return error(
            res,
            "cantidad_inicial de la pre-cria no puede superar la cantidad_inicial del lote.",
            null,
            400
        );
    }
 
    return null;
}
 
function validarCuerpoLoteYPrecria(body, res) {
    /*
    Descripcion:
    Valida el body combinado del endpoint POST /precrias/con-lote,
    que crea un lote de larva NUEVO junto con la pre-cria que lo
    consume. Valida tanto los campos del lote como los de la
    pre-cria (sin lote_larva_id, porque el lote todavia no existe).
    */
    const errores = [];
 
    // --- Campos del lote ---
    if (isEmpty(body.codigo_lote ?? body.codigoLote)) {
        errores.push("El campo codigo_lote es requerido.");
    } else if (!isCodigoLarvaValido(body.codigo_lote ?? body.codigoLote)) {
        errores.push(
            "El campo codigo_lote solo puede contener letras y numeros, con un maximo de 14 caracteres."
        );
    }
    const certLarvaValor = body.certificado_larva ?? body.certificadoLarva;
    if (!isEmpty(certLarvaValor) && !isCodigoLarvaValido(certLarvaValor)) {
        errores.push(
            "El campo certificado_larva solo puede contener letras y numeros, con un maximo de 14 caracteres."
        );
    }
    if (!isFechaValida(body.fecha_ingreso ?? body.fechaIngreso)) {
        errores.push("El campo fecha_ingreso (del lote) debe ser una fecha valida.");
    }
    const proveedorIdValor = body.proveedor_id ?? body.proveedorId;
    if (!isEmpty(proveedorIdValor) && !isEnteroPositivo(proveedorIdValor)) {
        errores.push("El proveedor_id debe ser un entero positivo.");
    }
    const laboratorioIdValor = body.laboratorio_id ?? body.laboratorioId;
    if (!isEmpty(laboratorioIdValor) && !isEnteroPositivo(laboratorioIdValor)) {
        errores.push("El laboratorio_id debe ser un entero positivo.");
    }
    const procedenciaIdValor = body.procedencia_id ?? body.procedenciaId;
    if (!isEmpty(procedenciaIdValor) && !isEnteroPositivo(procedenciaIdValor)) {
        errores.push("El procedencia_id debe ser un entero positivo.");
    }
 
    // --- Campos de la pre-cria (sin lote_larva_id: el lote es nuevo) ---
    if (!isEnteroPositivo(body.finca_id ?? body.fincaId)) {
        errores.push("El campo finca_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.estanque_id ?? body.estanqueId)) {
        errores.push("El campo estanque_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.cantidad_inicial ?? body.cantidadInicial)) {
        errores.push("El campo cantidad_inicial debe ser un entero positivo.");
    }
    const plInicialValor = body.pl_inicial ?? body.plInicial;
    if (
        plInicialValor !== undefined && plInicialValor !== null &&
        !isEnteroPositivo(plInicialValor)
    ) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_inicio ?? body.fechaInicio)) {
        errores.push("El campo fecha_inicio debe ser una fecha valida.");
    }
    const duracionDiasValor = body.duracion_dias ?? body.duracionDias;
    if (
        !isEmpty(duracionDiasValor) &&
        !isEnteroPositivo(duracionDiasValor)
    ) {
        errores.push("El campo duracion_dias debe ser un entero positivo.");
    }
 
    if (errores.length > 0) {
        return error(res, "Datos invalidos para crear el lote y la pre-cria.", errores, 422);
    }
    return null;
}
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/
 
export async function listarPrecrias(req, res) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo preCria.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
 
/*
    Descripcion:
    Obtiene todas las pre-crias activas del grupo de datos.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const estadoFiltro = req.query.estado || null;
        if (estadoFiltro && !isEstadoValido(estadoFiltro)) {
            return error(res, "El parametro estado debe ser Activa o Finalizada.", null, 422);
        }
        const precrias = await precriaModel.findAll(grupoDatos, estadoFiltro);
        return exito(res, "Pre-crias obtenidas correctamente.", precrias);
    } catch (err) {
        return error(res, "Error al obtener las pre-crias.", err, 500);
    }
}
 
export async function obtenerPrecria(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de preCria mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
 
/*
    Descripcion:
    Obtiene una pre-cria activa por su ID.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { id } = req.params;
        const pc = await precriaModel.findById(id, grupoDatos);
        if (!pc) return error(res, "Pre-cria no encontrada.", null, 404);
        return exito(res, "Pre-cria obtenida correctamente.", pc);
    } catch (err) {
        return error(res, "Error al obtener la pre-cria.", err, 500);
    }
}
 
export async function crearPrecria(req, res) {
    /*
    Descripcion:
    Registra una nueva entidad de preCria en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
 
/*
    Descripcion:
    Crea una nueva pre-cria validando que el lote, finca
    y estanque existan. Transiciona el lote a estado 'En PreCria'.
    */
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;
 
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
        const errRef = await validarReferencias(req.body, res, grupoDatos);
        if (errRef) return errRef;
 
        const dto = new PrecriaDTO({
            loteLarvaId: req.body.lote_larva_id ?? req.body.loteLarvaId,
            fincaId: req.body.finca_id ?? req.body.fincaId,
            estanqueId: req.body.estanque_id ?? req.body.estanqueId,
            cantidadInicial: req.body.cantidad_inicial ?? req.body.cantidadInicial,
            plInicial: req.body.pl_inicial ?? req.body.plInicial,
            fechaInicio: req.body.fecha_inicio ?? req.body.fechaInicio,
            duracionDias: req.body.duracion_dias ?? req.body.duracionDias,
            estado: req.body.estado,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
        const nuevo = await precriaModel.create(dto, grupoDatos);
        return exito(res, "Pre-cria creada correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear la pre-cria.", err, 500);
    }
}
 
export async function crearPrecriaConLote(req, res) {
    /*
    Descripcion:
    Crea, en una unica operacion atomica, un lote de larva NUEVO
    junto con la pre-cria que lo consume. Reemplaza el flujo del
    frontend que hacia 2 peticiones separadas (POST /lotes-larva
    y luego POST /precrias), flujo que dejaba un "lote huerfano"
    en la base de datos cuando la segunda peticion fallaba.
 
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers
      exito() o error(), con { lote, precria } en la data si todo
      salio bien (201), o un error sin dejar ningun rastro en la
      base de datos si algo fallo.
    */
    const errBody = validarCuerpoLoteYPrecria(req.body, res);
    if (errBody) return errBody;
 
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
 
        // --- Validaciones previas (fuera de la transaccion, para dar
        // mensajes de error claros). La validacion definitiva ocurre
        // dentro de precriaModel.createConLote(). ---
 
        const codigoLoteFinal = req.body.codigo_lote ?? req.body.codigoLote;
        const proveedorIdFinal = req.body.proveedor_id ?? req.body.proveedorId;
        const laboratorioIdFinal = req.body.laboratorio_id ?? req.body.laboratorioId;
        const procedenciaIdFinal = req.body.procedencia_id ?? req.body.procedenciaId;
        const fincaIdFinal = req.body.finca_id ?? req.body.fincaId;
        const estanqueIdFinal = req.body.estanque_id ?? req.body.estanqueId;

        const existente = await loteLarvaModel.findByCodigo(codigoLoteFinal, grupoDatos);
        if (existente) {
            return error(res, "Ya existe un lote con ese codigo.", null, 409);
        }
 
        if (!isEmpty(proveedorIdFinal)) {
            const existe = await loteLarvaModel.verificarProveedorExiste(proveedorIdFinal, grupoDatos);
            if (!existe) return error(res, "El proveedor indicado no existe.", null, 400);
        }
 
        if (!isEmpty(laboratorioIdFinal)) {
            const existe = await loteLarvaModel.verificarLaboratorioExiste(laboratorioIdFinal, grupoDatos);
            if (!existe) return error(res, "El laboratorio indicado no existe.", null, 400);
        }
 
        if (!isEmpty(procedenciaIdFinal)) {
            const existe = await loteLarvaModel.verificarProcedenciaExiste(procedenciaIdFinal, grupoDatos);
            if (!existe) return error(res, "La procedencia indicada no existe.", null, 400);
        }
 
        const fincaExiste = await precriaModel.verificarFincaExiste(fincaIdFinal, grupoDatos);
        if (!fincaExiste) return error(res, "La finca indicada no existe.", null, 400);
 
        const estanqueExiste = await precriaModel.verificarEstanqueExiste(
            estanqueIdFinal, fincaIdFinal, grupoDatos
        );
        if (!estanqueExiste) {
            return error(
                res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
            );
        }
 
        // Un estanque solo puede tener una pre-cria Activa a la vez.
        const precriaActivaExistente = await precriaModel.findActivaByEstanque(
            estanqueIdFinal, grupoDatos
        );
        if (precriaActivaExistente) {
            return error(res, "El estanque indicado ya tiene una pre-cria activa.", null, 409);
        }

         const dtoLote = new LoteLarvaDTO({
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

        const dtoPrecria = new PrecriaDTO({
            loteLarvaId: 0, // placeholder: el modelo lo sobreescribe con el id del lote recien creado
            fincaId: fincaIdFinal,
            estanqueId: estanqueIdFinal,
            cantidadInicial: req.body.cantidad_inicial ?? req.body.cantidadInicial,
            plInicial: req.body.pl_inicial ?? req.body.plInicial,
            fechaInicio: req.body.fecha_inicio ?? req.body.fechaInicio,
            duracionDias: req.body.duracion_dias ?? req.body.duracionDias,
            estado: req.body.estado,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
 
        const { lote, precria } = await precriaModel.createConLote(dtoLote, dtoPrecria, grupoDatos);
        return exito(res, "Lote y pre-cria creados correctamente.", { lote, precria }, 201);
    } catch (err) {
        if (err.codigoNegocio) {
            return error(res, err.message, null, 409);
        }
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, 'Ya existe un lote con ese codigo.', err, 409);
        }
        return error(res, "Error al crear el lote y la pre-cria.", err, 500);
    }
}
 
export async function actualizarPrecria(req, res) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de preCria, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
 
/*
    Descripcion:
    Actualiza una pre-cria existente validando referencias.
    */
    const { id } = req.params;
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;
 
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const actual = await precriaModel.findById(id, grupoDatos);
        if (!actual) return error(res, "Pre-cria no encontrada.", null, 404);
 
        if (normalizarEstado(actual.estado) === EstadoPrecria.FINALIZADA) {
            return error(
                res,
                "No se puede actualizar una pre-cria que ya fue finalizada.",
                null,
                409
            );
        }
 
        const errRef = await validarReferencias(req.body, res, grupoDatos, { precriaIdActual: id });
        if (errRef) return errRef;
 
            const dto = new PrecriaDTO({
            loteLarvaId: req.body.lote_larva_id ?? req.body.loteLarvaId,
            fincaId: req.body.finca_id ?? req.body.fincaId,
            estanqueId: req.body.estanque_id ?? req.body.estanqueId,
            cantidadInicial: req.body.cantidad_inicial ?? req.body.cantidadInicial,
            plInicial: req.body.pl_inicial ?? req.body.plInicial,
            fechaInicio: req.body.fecha_inicio ?? req.body.fechaInicio,
            duracionDias: req.body.duracion_dias ?? req.body.duracionDias,
            fechaFin: req.body.fecha_fin ?? req.body.fechaFin,
            cantidadFinal: req.body.cantidad_final ?? req.body.cantidadFinal,
            plFinal: req.body.pl_final ?? req.body.plFinal,
            estado: req.body.estado,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null,
        });

        const actualizado = await precriaModel.update(id, grupoDatos, dto);
        return exito(res, "Pre-cria actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar la pre-cria.", err, 500);
    }
}
 
export async function finalizarPrecria(req, res) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'finalizarPrecria' en el modulo preCria.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
 
/*
    Descripcion:
    Finaliza una pre-cria en estado Activa. Valida que la fecha
    de fin sea mayor o igual a la de inicio, y que la cantidad
    final no supere la inicial. Calcula los dias de duracion.
    */
    const { id } = req.params;
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
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
 
        const actualizado = await precriaModel.update(id, grupoDatos, {
            estado: EstadoPrecria.FINALIZADA,
            fecha_fin,
            cantidad_final: Number(cantidad_final),
            pl_final: Number(pl_final),
            duracion_dias,
        });
        return exito(res, "Pre-cria finalizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al finalizar la pre-cria.", err, 500);
    }
}
 
export async function eliminarPrecria(req, res) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de preCria, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
 
/*
    Descripcion:
    Realiza el borrado logico de una pre-cria.
    */
    const { id } = req.params;
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await precriaModel.remove(id, grupoDatos);
        if (!eliminado) return error(res, "Pre-cria no encontrada.", null, 404);
        return exito(res, "Pre-cria eliminada correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar la pre-cria.", err, 500);
    }
}