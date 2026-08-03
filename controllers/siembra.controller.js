
/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.controller.js
Autor: oscar mario
Fecha: 02/08/2026
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

// Modelos
import * as siembraModel from "../models/siembra.model.js";
import * as loteLarvaModel from "../models/loteLarvas.model.js";
import * as precriaModel from "../models/preCria.model.js";
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
    if (!isEmpty(body.duracion_ciclo) && !isEnteroPositivo(body.duracion_ciclo)) {
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
    /*
    Descripcion:
    Valida el body combinado del endpoint POST /siembras/con-lote,
    que crea un lote de larva NUEVO junto con la siembra que lo
    consume. Valida tanto los campos del lote como los de la
    siembra (sin lote_larva_id, porque el lote todavia no existe).
    */
    const errores = [];
 
    // --- Campos del lote ---
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
        errores.push("El campo cantidad_inicial (del lote) debe ser un entero positivo.");
    }
    if (!isFechaValida(body.fecha_ingreso)) {
        errores.push("El campo fecha_ingreso (del lote) debe ser una fecha valida.");
    }
    if (
        body.pl_inicial !== undefined && body.pl_inicial !== null &&
        !isEnteroPositivo(body.pl_inicial)
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
 
    // --- Campos de la siembra (sin lote_larva_id: el lote es nuevo) ---
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
    if (!isEmpty(body.duracion_ciclo) && !isEnteroPositivo(body.duracion_ciclo)) {
        errores.push("El campo duracion_ciclo debe ser un entero positivo.");
    }
    if (!isEmpty(body.cantidad_sembrada) && !isEmpty(body.cantidad_inicial) &&
        Number(body.cantidad_sembrada) > Number(body.cantidad_inicial)) {
        errores.push("cantidad_sembrada no puede superar la cantidad_inicial del lote.");
    }
 
    if (errores.length > 0) {
        return error(res, "Datos invalidos para crear el lote y la siembra.", errores, 422);
    }
    return null;
}
 
async function validarReferencias(body, res, grupoDatos, opciones = {}) {
    /*
    Descripcion:
    Verifica que el lote de larva, la finca y el estanque
    indicados existan en la base de datos. Si se indica una
    pre-cria, verifica que pertenezca al lote y este Finalizada.
    Tambien valida que la cantidad sembrada no supere la disponible.

    Ademas aplica las reglas de negocio del documento de preguntas
    de siembra:
    - El estanque solo permite crear una siembra si esta en estado 'Activo'.
    - Un estanque solo puede tener una siembra Activa a la vez.
    - Un mismo lote de larva solo puede originar una unica siembra.
    - Una misma pre-cria solo puede originar una unica siembra.
    - pl_siembra debe heredarse del pl_final de la pre-cria (si se indica).

    Parametros:
    - opciones.esCreacion: true si se esta creando (no actualizando) una siembra.
    - opciones.siembraIdActual: id de la siembra que se esta actualizando (para excluirla
      de las validaciones de unicidad).
    */
    const { esCreacion = false, siembraIdActual = null } = opciones;

    const lote = await loteLarvaModel.findById(body.lote_larva_id, grupoDatos);
    if (!lote) {
        return error(res, "El lote de larva indicado no existe.", null, 400);
    }

    // Un lote solo puede generar una unica siembra.
    if (esCreacion) {
        const loteYaUsado = await siembraModel.existeSiembraPorLote(
            body.lote_larva_id, grupoDatos, siembraIdActual
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

    const fincaExiste = await siembraModel.verificarFincaExiste(body.finca_id, grupoDatos);
    if (!fincaExiste) {
        return error(res, "La finca indicada no existe.", null, 400);
    }

    const estanque = await siembraModel.obtenerEstanquePorId(
        body.estanque_id, body.finca_id, grupoDatos
    );
    if (!estanque) {
        return error(
            res, "El estanque indicado no existe o no pertenece a la finca.", null, 400
        );
    }

    // Solo se puede crear (no actualizar) una siembra si el estanque esta Activo.
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
            body.estanque_id, grupoDatos
        );
        if (siembraActivaExistente) {
            return error(
                res, "El estanque indicado ya tiene una siembra activa.", null, 409
            );
        }
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

        // Una misma pre-cria solo puede originar una unica siembra.
        if (esCreacion) {
            const precriaYaUsada = await siembraModel.existeSiembraPorPrecria(
                body.precria_id, grupoDatos, siembraIdActual
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

        // El PL inicial de la siembra debe ser el PL final de la pre-cria.
        body.pl_siembra = precria.pl_final;
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
    try {
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
    /*
    Descripcion:
    Busca y retorna un registro especifico de siembra mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
    try {
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
    /*
    Descripcion:
    Registra una nueva entidad de siembra en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;

    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
        const errRef = await validarReferencias(req.body, res, grupoDatos, { esCreacion: true });
        if (errRef) return errRef;

        const dto = new SiembraDTO({
            ...req.body,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
        const nueva = await siembraModel.create(dto, grupoDatos);
        return exito(res, "Siembra creada correctamente.", nueva, 201);
    } catch (err) {
        // Errores de negocio lanzados dentro de la transaccion del modelo
        // (condiciones de carrera sobre el estanque).
        if (err.codigoNegocio) {
            return error(res, err.message, null, 409);
        }
        return error(res, "Error al crear la siembra.", err, 500);
    }
}

export async function crearSiembraConLote(req, res) {
    /*
    Descripcion:
    Crea, en una unica operacion atomica, un lote de larva NUEVO
    junto con la siembra que lo consume. Reemplaza el flujo del
    frontend que hacia 2 peticiones separadas (POST /lotes-larva
    y luego POST /siembras), flujo que dejaba un "lote huerfano"
    en la base de datos cuando la segunda peticion fallaba.
 
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
 
    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers
      exito() o error(), con { lote, siembra } en la data si todo
      salio bien (201), o un error sin dejar ningun rastro en la
      base de datos si algo fallo.
    */
    const errBody = validarCuerpoLoteYSiembra(req.body, res);
    if (errBody) return errBody;
 
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
 
        // --- Validaciones previas (fuera de la transaccion, para dar
        // mensajes de error claros). La validacion definitiva y a
        // prueba de condiciones de carrera ocurre dentro de
        // siembraModel.createConLote(), que vuelve a chequear todo
        // con locks (FOR UPDATE) antes de escribir nada. ---
 
        const existente = await loteLarvaModel.findByCodigo(req.body.codigo_lote, grupoDatos);
        if (existente) {
            return error(res, "Ya existe un lote con ese codigo.", null, 409);
        }
 
        const proveedorId = req.body.proveedor_id ?? req.body.proveedorId;
        if (!isEmpty(proveedorId)) {
            const existe = await loteLarvaModel.verificarProveedorExiste(proveedorId, grupoDatos);
            if (!existe) return error(res, "El proveedor indicado no existe.", null, 400);
        }
 
        const laboratorioId = req.body.laboratorio_id ?? req.body.laboratorioId;
        if (!isEmpty(laboratorioId)) {
            const existe = await loteLarvaModel.verificarLaboratorioExiste(laboratorioId, grupoDatos);
            if (!existe) return error(res, "El laboratorio indicado no existe.", null, 400);
        }
 
        const procedenciaId = req.body.procedencia_id ?? req.body.procedenciaId;
        if (!isEmpty(procedenciaId)) {
            const existe = await loteLarvaModel.verificarProcedenciaExiste(procedenciaId, grupoDatos);
            if (!existe) return error(res, "La procedencia indicada no existe.", null, 400);
        }
 
        const fincaExiste = await siembraModel.verificarFincaExiste(req.body.finca_id, grupoDatos);
        if (!fincaExiste) return error(res, "La finca indicada no existe.", null, 400);
 
        const estanque = await siembraModel.obtenerEstanquePorId(
            req.body.estanque_id, req.body.finca_id, grupoDatos
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
            req.body.estanque_id, grupoDatos
        );
        if (siembraActivaExistente) {
            return error(res, "El estanque indicado ya tiene una siembra activa.", null, 409);
        }
 
        // --- DTOs ---
        const dtoLote = new LoteLarvaDTO({
            ...req.body,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
        const dtoSiembra = new SiembraDTO({
            ...req.body,
            lote_larva_id: 0, // placeholder: el modelo lo sobreescribe con el id del lote recien creado
            precria_id: null,
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
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de siembra, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
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

        // Finaliza la siembra Y transiciona el estanque asociado a 'Cosechado'
        // (el biologo puede finalizar antes o despues de duracion_ciclo,
        // segun el criterio operativo, tal como pide el documento de siembra).
        const actualizada = await siembraModel.finalizarConEstanque(id, grupoDatos, {
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
    /*
    Descripcion:
    Busca y retorna un registro especifico de siembra mediante su identificador unico.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.

    Retorna:
    - Resuelve la peticion HTTP enviando un JSON usando los helpers exito() o error() con el status code correspondiente (200, 201, 400, 404, 500).
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
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
            duracion_ciclo: siembra.duracion_ciclo,
            dias,
            estado: siembra.estado
        });
    } catch (err) {
        return error(res, "Error al obtener la siembra activa.", err, 500);
    }
}