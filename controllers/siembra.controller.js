/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.controller.js
Autor: Oscar Mario-Joan Campos / Marco Vásquez
Fecha: 18/08/2026
Modulo: Siembra
Descripcion:
Maneja las peticiones HTTP y la logica de siembra.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { SiembraDTO, EstadoSiembra } from "../dtos/siembra.dto.js";
import { LoteLarvaDTO } from "../dtos/loteLarva.dto.js";

// Servicios
import {
    isEmpty,
    isFechaValida,
    isEnteroPositivo,
    isDecimalPositivo,
    isEstadoValido,
    normalizarEstado,
} from "../services/siembra.service.js";
import { isCodigoLarvaValido } from "../services/loteLarva.service.js";

// Modelos y Config
import * as siembraModel from "../models/siembra.model.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import * as precriaModel from "../models/preCria.model.js";
import pool from "../config/database.js";

import { EstadoPrecria } from "../dtos/preCria.dto.js";
import { EstadoLote } from "../dtos/loteLarva.dto.js";
import { EstadoEstanque } from "../dtos/estanques.dto.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
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
    if (!isEnteroPositivo(body.cantidad_sembrada ?? body.cantidadSembrada)) {
        errores.push("El campo cantidad_sembrada debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_siembra ?? body.fechaSiembra)) {
        errores.push("El campo fecha_siembra debe ser una fecha valida.");
    }
    const precriaIdValor = body.precria_id ?? body.precriaId;
    if (!isEmpty(precriaIdValor) && !isEnteroPositivo(precriaIdValor)) {
        errores.push("El campo precria_id debe ser un entero positivo.");
    }
    const plSiembraValor = body.pl_siembra ?? body.plSiembra;
    if (
        plSiembraValor !== undefined && plSiembraValor !== null &&
        !isEnteroPositivo(plSiembraValor)
    ) {
        errores.push("El campo pl_siembra debe ser un entero positivo.");
    }
    const densidadPobValor = body.densidad_poblacional ?? body.densidadPoblacional;
    if (
        !isEmpty(densidadPobValor) &&
        !isDecimalPositivo(densidadPobValor)
    ) {
        errores.push("El campo densidad_poblacional debe ser un numero positivo.");
    }
    const duracionCicloValor = body.duracion_ciclo ?? body.duracionCiclo;
    if (!isEmpty(duracionCicloValor) && !isEnteroPositivo(duracionCicloValor)) {
        errores.push("El campo duracion_ciclo debe ser un entero positivo.");
    }
    if (!isEmpty(body.estado)) {
        errores.push(
            "El campo estado no se puede establecer aqui. Una siembra siempre " +
                "nace 'Activa'; para finalizarla usa POST /siembras/:id/finalizar."
        );
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para la siembra.", errores, 422);
    }
    return null;
}

function validarCuerpoLoteYSiembra(body, res) {
    const errores = [];

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
    if (!isEnteroPositivo(body.cantidad_inicial ?? body.cantidadInicial)) {
        errores.push("El campo cantidad_inicial (del lote) debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_ingreso ?? body.fechaIngreso)) {
        errores.push("El campo fecha_ingreso (del lote) debe ser una fecha valida.");
    }
    const plInicialValor = body.pl_inicial ?? body.plInicial;
    if (
        plInicialValor !== undefined && plInicialValor !== null &&
        !isEnteroPositivo(plInicialValor)
    ) {
        errores.push("El campo pl_inicial debe ser un entero positivo.");
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

    if (!isEnteroPositivo(body.finca_id ?? body.fincaId)) {
        errores.push("El campo finca_id debe ser un entero positivo.");
    }
    if (!isEnteroPositivo(body.estanque_id ?? body.estanqueId)) {
        errores.push("El campo estanque_id debe ser un entero positivo.");
    }
    const cantidadSembradaValor = body.cantidad_sembrada ?? body.cantidadSembrada;
    if (!isEnteroPositivo(cantidadSembradaValor)) {
        errores.push("El campo cantidad_sembrada debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_siembra ?? body.fechaSiembra)) {
        errores.push("El campo fecha_siembra debe ser una fecha valida.");
    }
    const plSiembraValor = body.pl_siembra ?? body.plSiembra;
    if (
        plSiembraValor !== undefined && plSiembraValor !== null &&
        !isEnteroPositivo(plSiembraValor)
    ) {
        errores.push("El campo pl_siembra debe ser un entero positivo.");
    }
    const densidadPoblacionalValor = body.densidad_poblacional ?? body.densidadPoblacional;
    if (
        !isEmpty(densidadPoblacionalValor) &&
        !isDecimalPositivo(densidadPoblacionalValor)
    ) {
        errores.push("El campo densidad_poblacional debe ser un numero positivo.");
    }
    const duracionCicloValor = body.duracion_ciclo ?? body.duracionCiclo;
    if (!isEmpty(duracionCicloValor) && !isEnteroPositivo(duracionCicloValor)) {
        errores.push("El campo duracion_ciclo debe ser un entero positivo.");
    }
    const cantidadInicialValor = body.cantidad_inicial ?? body.cantidadInicial;
    if (!isEmpty(cantidadSembradaValor) && !isEmpty(cantidadInicialValor) &&
        Number(cantidadSembradaValor) > Number(cantidadInicialValor)) {
        errores.push("cantidad_sembrada no puede superar la cantidad_inicial del lote.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para crear el lote y la siembra.", errores, 422);
    }
    return null;
}

async function validarReferencias(body, res, grupoDatos, opciones = {}) {
    const { esCreacion = false, siembraIdActual = null } = opciones;

    const loteLarvaIdValor = body.lote_larva_id ?? body.loteLarvaId;
    const fincaIdValor = body.finca_id ?? body.fincaId;
    const estanqueIdValor = body.estanque_id ?? body.estanqueId;
    const precriaIdValor = body.precria_id ?? body.precriaId;
    const cantidadSembradaValor = body.cantidad_sembrada ?? body.cantidadSembrada;

    const lote = await loteLarvaModel.findById(loteLarvaIdValor, grupoDatos);
    if (!lote) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }

    if (esCreacion) {
        const loteYaUsado = await siembraModel.existeSiembraPorLote(
            loteLarvaIdValor, grupoDatos, siembraIdActual
        );
        if (loteYaUsado) {
            return error(
                res,
                "El lote de larva indicado ya fue utilizado en otra siembra. " +
                    "Un lote solo puede originar una unica siembra.",
                null,
                409
            );
        }
    }

    const fincaExiste = await siembraModel.verificarFincaExiste(fincaIdValor, grupoDatos);
    if (!fincaExiste) {
        return error(res, "La finca indicada no existe.", null, 400);
    }

    const estanque = await siembraModel.obtenerEstanquePorId(
        estanqueIdValor, fincaIdValor, grupoDatos
    );
    if (!estanque) {
        return error(
            res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
        );
    }

    if (esCreacion) {
        if (String(estanque.estado).toLowerCase() !== EstadoEstanque.ACTIVO.toLowerCase()) {
            return error(
                res,
                "Solo se puede crear una siembra en un estanque en estado 'Activo'. " +
                    `Estado actual: ${estanque.estado}.`,
                null,
                409
            );
        }

        const siembraActivaExistente = await siembraModel.findActivaByEstanque(
            estanqueIdValor, grupoDatos
        );
        if (siembraActivaExistente) {
            return error(
                res, "El estanque indicado ya tiene una siembra activa.", null, 409
            );
        }
    }

    let origenCantidad = lote.cantidad_inicial;

    if (!isEmpty(precriaIdValor)) {
        const precria = await precriaModel.findById(precriaIdValor, grupoDatos);
        if (!precria) {
            return error(res, "La pre-cria indicada no existe.", null, 400);
        }
        if (precria.lote_larva_id !== Number(loteLarvaIdValor)) {
            return error(
                res, "La pre-cria indicada no pertenece al lote de larva indicado.", null, 400
            );
        }
        if (String(precria.estado).toLowerCase() !== EstadoPrecria.FINALIZADA.toLocaleLowerCase()) {
            return error(
                res,
                "La pre-cria debe estar Finalizada antes de poder sembrarse.",
                null,
                400
            );
        }

        if (esCreacion) {
            const precriaYaUsada = await siembraModel.existeSiembraPorPrecria(
                precriaIdValor, grupoDatos, siembraIdActual
            );
            if (precriaYaUsada) {
                return error(
                    res,
                    "La pre-cria indicada ya fue utilizada en otra siembra. " +
                        "Una pre-cria solo puede originar una unica siembra.",
                    null,
                    409
                );
            }
        }

        origenCantidad = precria.cantidad_final;
        body.pl_siembra = precria.pl_final;
        body.plSiembra = precria.pl_final;
    }

    if (!isEmpty(cantidadSembradaValor) && Number(cantidadSembradaValor) > origenCantidad) {
        return error(
            res,
            "cantidad_sembrada no puede superar la cantidad disponible del " +
                (isEmpty(precriaIdValor) ? "lote." : "pre-cria."),
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
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT s.*, s.grupo_datos AS grupoDatos FROM siembras s
                 WHERE s.activo = TRUE AND s.deleted_at IS NULL`
            );
            return exito(res, "Siembras obtenidas correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const estadoFiltro = req.query.estado || null;
        if (estadoFiltro && !isEstadoValido(estadoFiltro)) {
            return error(res, "El parametro estado debe ser Activa o Finalizada.", null, 422);
        }
        const siembras = await siembraModel.findAll(grupoDatos, estadoFiltro);
        return exito(res, "Siembras obtenidas correctamente.", siembras);
    } catch (err) {
        return error(res, "Error al obtener las siembras.", err, 500);
    }
}

export async function obtenerSiembra(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT s.*, s.grupo_datos AS grupoDatos FROM siembras s
                 WHERE s.id = ? AND s.activo = TRUE AND s.deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Siembra no encontrada.", null, 404);
            return exito(res, "Siembra obtenida correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
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
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
        const errRef = await validarReferencias(req.body, res, grupoDatos, { esCreacion: true });
        if (errRef) return errRef;

        const dto = new SiembraDTO({
            loteLarvaId: req.body.lote_larva_id ?? req.body.loteLarvaId,
            precriaId: req.body.precria_id ?? req.body.precriaId,
            fincaId: req.body.finca_id ?? req.body.fincaId,
            estanqueId: req.body.estanque_id ?? req.body.estanqueId,
            fechaSiembra: req.body.fecha_siembra ?? req.body.fechaSiembra,
            tecnicaCultivo: req.body.tecnica_cultivo ?? req.body.tecnicaCultivo,
            densidadPoblacional: req.body.densidad_poblacional ?? req.body.densidadPoblacional,
            cantidadSembrada: req.body.cantidad_sembrada ?? req.body.cantidadSembrada,
            plSiembra: req.body.pl_siembra ?? req.body.plSiembra,
            duracionCiclo: req.body.duracion_ciclo ?? req.body.duracionCiclo,
            estado: req.body.estado,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
        const nueva = await siembraModel.create(dto, grupoDatos);
        return exito(res, "Siembra creada correctamente.", nueva, 201);
    } catch (err) {
        if (err.codigoNegocio) {
            return error(res, err.message, null, 409);
        }
        return error(res, "Error al crear la siembra.", err, 500);
    }
}

export async function crearSiembraConLote(req, res) {
    const errBody = validarCuerpoLoteYSiembra(req.body, res);
    if (errBody) return errBody;

    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

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

        const fincaExiste = await siembraModel.verificarFincaExiste(fincaIdFinal, grupoDatos);
        if (!fincaExiste) return error(res, "La finca indicada no existe.", null, 400);

        const estanque = await siembraModel.obtenerEstanquePorId(
            estanqueIdFinal, fincaIdFinal, grupoDatos
        );
        if (!estanque) {
            return error(
                res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
            );
        }
        if (String(estanque.estado).toLowerCase() !== EstadoEstanque.ACTIVO.toLowerCase()) {
            return error(
                res,
                "Solo se puede crear una siembra en un estanque en estado 'Activo'. " +
                    `Estado actual: ${estanque.estado}.`,
                null,
                409
            );
        }
        const siembraActivaExistente = await siembraModel.findActivaByEstanque(
            estanqueIdFinal, grupoDatos
        );
        if (siembraActivaExistente) {
            return error(res, "El estanque indicado ya tiene una siembra activa.", null, 409);
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

        const dtoSiembra = new SiembraDTO({
            loteLarvaId: 0,
            precriaId: null,
            fincaId: fincaIdFinal,
            estanqueId: estanqueIdFinal,
            fechaSiembra: req.body.fecha_siembra ?? req.body.fechaSiembra,
            tecnicaCultivo: req.body.tecnica_cultivo ?? req.body.tecnicaCultivo,
            densidadPoblacional: req.body.densidad_poblacional ?? req.body.densidadPoblacional,
            cantidadSembrada: req.body.cantidad_sembrada ?? req.body.cantidadSembrada,
            plSiembra: req.body.pl_siembra ?? req.body.plSiembra,
            duracionCiclo: req.body.duracion_ciclo ?? req.body.duracionCiclo,
            estado: req.body.estado,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });

        const { lote, siembra } = await siembraModel.createConLote(dtoLote, dtoSiembra, grupoDatos);
        return exito(res, "Lote y siembra creados correctamente.", { lote, siembra }, 201);
    } catch (err) {
        if (err.codigoNegocio) {
            return error(res, err.message, null, 409);
        }
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, 'Ya existe un lote con ese codigo.', err, 409);
        }
        return error(res, "Error al crear el lote y la siembra.", err, 500);
    }
}

export async function actualizarSiembra(req, res) {
    const { id } = req.params;
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const actual = await siembraModel.findById(id, grupoDatos);
        if (!actual) return error(res, "Siembra no encontrada.", null, 404);

        if (normalizarEstado(actual.estado) === EstadoSiembra.FINALIZADA) {
            return error(
                res,
                "No se puede actualizar una siembra que ya fue finalizada.",
                null,
                409
            );
        }

        const errRef = await validarReferencias(req.body, res, grupoDatos, {
            esCreacion: false,
            siembraIdActual: id,
        });
        if (errRef) return errRef;

        const dto = new SiembraDTO({
            loteLarvaId: req.body.lote_larva_id ?? req.body.loteLarvaId,
            precriaId: req.body.precria_id ?? req.body.precriaId,
            fincaId: req.body.finca_id ?? req.body.fincaId,
            estanqueId: req.body.estanque_id ?? req.body.estanqueId,
            fechaSiembra: req.body.fecha_siembra ?? req.body.fechaSiembra,
            tecnicaCultivo: req.body.tecnica_cultivo ?? req.body.tecnicaCultivo,
            densidadPoblacional: req.body.densidad_poblacional ?? req.body.densidadPoblacional,
            cantidadSembrada: req.body.cantidad_sembrada ?? req.body.cantidadSembrada,
            plSiembra: req.body.pl_siembra ?? req.body.plSiembra,
            duracionCiclo: req.body.duracion_ciclo ?? req.body.duracionCiclo,
            estado: req.body.estado,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null,
        });
        const actualizada = await siembraModel.update(id, grupoDatos, dto);
        return exito(res, "Siembra actualizada correctamente.", actualizada);
    } catch (err) {
        return error(res, "Error al actualizar la siembra.", err, 500);
    }
}

export async function finalizarSiembra(req, res) {
    const { id } = req.params;
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const siembra = await siembraModel.findById(id, grupoDatos);
        if (!siembra) return error(res, "Siembra no encontrada.", null, 404);

        if (normalizarEstado(siembra.estado) !== EstadoSiembra.ACTIVA) {
            return error(
                res, "La siembra ya no se encuentra en estado Activa.", null, 400
            );
        }

        const actualizada = await siembraModel.finalizarConEstanque(id, grupoDatos, {
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
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminada = await siembraModel.remove(id, grupoDatos);
        if (!eliminada) return error(res, "Siembra no encontrada.", null, 404);
        return exito(res, "Siembra eliminada correctamente.", eliminada);
    } catch (err) {
        return error(res, "Error al eliminar la siembra.", err, 500);
    }
}

export async function obtenerSiembraActiva(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);
        const estanqueId = req.query.estanqueId;

        if (!estanqueId) {
            return error(res, "El parametro estanqueId es requerido.", null, 400);
        }

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT s.*, s.grupo_datos AS grupoDatos FROM siembras s
                 WHERE s.estanque_id = ? AND s.estado = 'Activa'
                   AND s.activo = TRUE AND s.deleted_at IS NULL`,
                [estanqueId]
            );
            if (rows.length === 0) {
                return error(res, "No existe ninguna siembra activa en el estanque indicado.", null, 404);
            }
            const siembra = rows[0];
            const hoy = new Date();
            const fechaInicio = new Date(siembra.fecha_siembra);
            const dias = Math.max(0, Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24)));

            return exito(res, "Siembra activa obtenida correctamente.", {
                id: siembra.id,
                estanque_id: siembra.estanque_id,
                finca_id: siembra.finca_id,
                lote_larva_id: siembra.lote_larva_id,
                fecha_siembra: siembra.fecha_siembra,
                pl_siembra: siembra.pl_siembra,
                cantidad_sembrada: siembra.cantidad_sembrada,
                duracion_ciclo: siembra.duracion_ciclo,
                dias,
                estado: siembra.estado
            });
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const siembra = await siembraModel.findActivaByEstanque(estanqueId, grupoDatos);
        if (!siembra) {
            return error(res, "No existe ninguna siembra activa en el estanque indicado.", null, 404);
        }

        const hoy = new Date();
        const fechaInicio = new Date(siembra.fecha_siembra);
        const dias = Math.max(0, Math.floor((hoy - fechaInicio) / (1000 * 60 * 60 * 24)));

        return exito(res, "Siembra activa obtenida correctamente.", {
            id: siembra.id,
            estanque_id: siembra.estanque_id,
            finca_id: siembra.finca_id,
            lote_larva_id: siembra.lote_larva_id,
            fecha_siembra: siembra.fecha_siembra,
            pl_siembra: siembra.pl_siembra,
            cantidad_sembrada: siembra.cantidad_sembrada,
            duracion_ciclo: siembra.duracion_ciclo,
            dias,
            estado: siembra.estado
        });
    } catch (err) {
        return error(res, "Error al obtener la siembra activa.", err, 500);
    }
}