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
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida que el cuerpo de la peticion contenga los campos
    requeridos y con el formato correcto para una siembra.
    */
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

async function validarReferencias(body, res, grupoDatos) {
    /*
    Descripcion:
    Verifica que el lote de larva, la finca y el estanque
    indicados existan en la base de datos. Si se indica una
    pre-cria, verifica que pertenezca al lote y este Finalizada.
    Tambien valida que la cantidad sembrada no supere la disponible.
    */
    const lote = await loteLarvaModel.findById(body.lote_larva_id, grupoDatos);
    if (!lote) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }

    const fincaExiste = await siembraModel.verificarFincaExiste(body.finca_id, grupoDatos);
    if (!fincaExiste) {
        return error(res, "La finca indicada no existe.", null, 400);
    }

    const estanqueExiste = await siembraModel.verificarEstanqueExiste(
        body.estanque_id, body.finca_id, grupoDatos
    );
    if (!estanqueExiste) {
        return error(
            res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
        );
    }

    let origenCantidad = lote.cantidad_inicial;

    if (!isEmpty(body.precria_id)) {
        const precria = await precriaModel.findById(body.precria_id, grupoDatos);
        if (!precria) {
            return error(res, "La pre-cria indicada no existe.", null, 400);
        }
        if (precria.lote_larva_id !== Number(body.lote_larva_id)) {
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
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo siembra.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Obtiene todas las siembras activas del grupo de datos.
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const siembras = await siembraModel.findAll(grupoDatos);
        return exito(res, "Siembras obtenidas correctamente.", siembras);
    } catch (err) {
        return error(res, "Error al obtener las siembras.", err, 500);
    }
}

export async function obtenerSiembra(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de siembra mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Obtiene una siembra activa por su ID.
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const { id } = req.params;
        const siembra = await siembraModel.findById(id, grupoDatos);
        if (!siembra) return error(res, "Siembra no encontrada.", null, 404);
        return exito(res, "Siembra obtenida correctamente.", siembra);
    } catch (err) {
        return error(res, "Error al obtener la siembra.", err, 500);
    }
}

export async function crearSiembra(req, res) {
    /*
    Descripcion:
    Registra una nueva entidad de siembra en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Crea una nueva siembra validando que el lote, finca, estanque
    y pre-cria (si aplica) existan. Transiciona el lote a 'Sembrado'.
    */
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;

    try {
        const grupoDatos = req.user.grupoDatos;
        const errRef = await validarReferencias(req.body, res, grupoDatos);
        if (errRef) return errRef;

        const dto = new SiembraDTO(req.body);
        const nueva = await siembraModel.create(dto, grupoDatos);
        return exito(res, "Siembra creada correctamente.", nueva, 201);
    } catch (err) {
        return error(res, "Error al crear la siembra.", err, 500);
    }
}

export async function actualizarSiembra(req, res) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de siembra, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Actualiza una siembra existente validando referencias.
    */
    const { id } = req.params;
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;

    try {
        const grupoDatos = req.user.grupoDatos;
        const actual = await siembraModel.findById(id, grupoDatos);
        if (!actual) return error(res, "Siembra no encontrada.", null, 404);

        const errRef = await validarReferencias(req.body, res, grupoDatos);
        if (errRef) return errRef;

        const dto = new SiembraDTO(req.body);
        const actualizada = await siembraModel.update(id, grupoDatos, dto);
        return exito(res, "Siembra actualizada correctamente.", actualizada);
    } catch (err) {
        return error(res, "Error al actualizar la siembra.", err, 500);
    }
}

export async function finalizarSiembra(req, res) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'finalizarSiembra' en el modulo siembra.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Finaliza una siembra en estado Activa cambiando su estado
    a Finalizada.
    */
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos;
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
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de siembra, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Realiza el borrado logico de una siembra.
    */
    const { id } = req.params;
    try {
        const grupoDatos = req.user.grupoDatos;
        const eliminada = await siembraModel.remove(id, grupoDatos);
        if (!eliminada) return error(res, "Siembra no encontrada.", null, 404);
        return exito(res, "Siembra eliminada correctamente.", eliminada);
    } catch (err) {
        return error(res, "Error al eliminar la siembra.", err, 500);
    }
}

export async function obtenerSiembraActiva(req, res) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de siembra mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */

/*
    Descripcion:
    Obtiene la siembra activa mas reciente de un estanque especifico
    y calcula la duracion en dias actual.
    */
    try {
        const grupoDatos = req.user.grupoDatos;
        const estanqueId = req.query.estanqueId;

        if (!estanqueId) {
            return error(res, "El parametro estanqueId es requerido.", null, 400);
        }

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
            dias,
            estado: siembra.estado
        });
    } catch (err) {
        return error(res, "Error al obtener la siembra activa.", err, 500);
    }
}