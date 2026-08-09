/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.controller.js
Autor: Andres Gutierrez
Fecha: 30/07/2026
Modulo: Parasitologias
Descripcion:
Controlador de parasitologias con autenticacion dual y
auditoria mediante obtenerContextoPeticion.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
    ParasitologiaDTO,
    ParasitoParasitologia,
    GradoInfeccion
} from "../dtos/parasitologias.dto.js";

import {
    isEmpty,
    isIdValido,
    isNumeroMayorCero,
    isFechaValida,
    isFechaFutura,
    isParasitoValido,
    isGradoInfeccionValido,
    obtenerCatalogoParasitos as obtenerCatalogoParasitosService,
    construirResumenParasitologias
} from "../services/parasitologias.service.js";

import * as ParasitologiaModel from "../models/parasitologias.model.js";

import {
    exito,
    error
} from "../common/respuestaJson.js";

import {
    obtenerContextoPeticion
} from "../common/contextoPeticion.js";

/*
Descripcion:
Valida los campos funcionales enviados por el frontend.

null si los datos son validos.
Respuesta HTTP 422 si existen errores.

Parametros:
- Los campos de auditoria no se leen desde el body.
- El grupo y el creador se resuelven desde el JWT.
- El gradoInfeccion es obligatorio y debe ser seleccionado
  por el usuario.

Retorna:
- body: Cuerpo de la peticion.
- res: Respuesta HTTP.
*/

function validarCuerpo(body, res) {
    const errores = [];

    if (isEmpty(body.fincaId)) {
        errores.push("El campo fincaId es requerido.");
    }

    if (isEmpty(body.estanqueId)) {
        errores.push("El campo estanqueId es requerido.");
    }

    if (isEmpty(body.fechaReporte)) {
        errores.push("El campo fechaReporte es requerido.");
    }

    if (isEmpty(body.parasito)) {
        errores.push("El campo parasito es requerido.");
    }

    if (isEmpty(body.gradoInfeccion)) {
        errores.push("El campo gradoInfeccion es requerido.");
    }

    if (!isEmpty(body.fincaId) && !isNumeroMayorCero(body.fincaId)) {
        errores.push("El campo fincaId debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.estanqueId) && !isNumeroMayorCero(body.estanqueId)) {
        errores.push("El campo estanqueId debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.fechaReporte) && !isFechaValida(body.fechaReporte)) {
        errores.push("El campo fechaReporte debe tener formato yyyy-mm-dd o dd/mm/aaaa.");
    }

    if (
        !isEmpty(body.fechaReporte) &&
        isFechaValida(body.fechaReporte) &&
        isFechaFutura(body.fechaReporte)
    ) {
        errores.push("El campo fechaReporte no puede ser una fecha futura.");
    }

    if (!isEmpty(body.parasito) && !isParasitoValido(body.parasito)) {
        errores.push(
            "Parasito invalido. Opciones: " +
            Object.values(ParasitoParasitologia).join(", ")
        );
    }

    if (
        !isEmpty(body.gradoInfeccion) &&
        !isGradoInfeccionValido(body.gradoInfeccion)
    ) {
        errores.push(
            "Grado de infeccion invalido. Opciones: " +
            Object.values(GradoInfeccion).join(", ")
        );
    }

    if (errores.length > 0) {
        return error(
            res,
            "Datos invalidos para la parasitologia.",
            errores,
            422
        );
    }

    return null;
}

/*
Descripcion:
Valida el id recibido en la ruta.

Parametros:
- id: Identificador recibido.
- res: Respuesta HTTP.

Retorna:
- null si es valido o error 400.
*/

function validarIdParametro(id, res) {
    if (!isIdValido(id)) {
        return error(
            res,
            "El id debe ser numerico y mayor que cero.",
            null,
            400
        );
    }

    return null;
}

/*
Descripcion:
Obtiene el nombre completo visible de la identidad
autenticada.

Parametros:
- El valor proviene de la identidad autenticada y nunca
  del body.
- Soporta usuario web y colaborador movil.

Retorna:
- Nombre completo del responsable o null.
*/

function obtenerResponsablePeticion(req) {
    const identidad = req.colaborador ?? req.user;

    if (!identidad) {
        return null;
    }

    const nombre = String(identidad.nombre ?? "").trim();
    const apellidos = String(identidad.apellidos ?? "").trim();
    const responsable = `${nombre} ${apellidos}`.trim();

    return isEmpty(responsable) ? null : responsable;
}

/*
Descripcion:
Construye el DTO con datos funcionales, grado seleccionado
y auditoria dual.

Parametros:
- No utiliza colaboradorId.
- La identidad se guarda solo en creadoPorUsuarioId o
  creadoPorColaboradorId.
- El gradoInfeccion se recibe desde el frontend y se
  guarda normalizado en minuscula.

Retorna:
- Instancia normalizada de ParasitologiaDTO.
*/

function construirDTO(body, datosSistema) {
    const gradoInfeccion = String(body.gradoInfeccion).trim().toLowerCase();

    return new ParasitologiaDTO({
        grupoDatos: datosSistema.grupoDatos,
        fincaId: body.fincaId,
        estanqueId: body.estanqueId,
        creadoPorUsuarioId: datosSistema.creadoPorUsuarioId,
        creadoPorColaboradorId: datosSistema.creadoPorColaboradorId,
        tipoRegistro: "parasitologia",
        fechaReporte: body.fechaReporte,
        responsable: datosSistema.responsable,
        parasito: body.parasito,
        gradoInfeccion,
        observaciones: body.observaciones
    });
}

/*
Descripcion:
Comprueba que finca y estanque pertenezcan al grupo
autenticado y mantengan relacion entre si.

Retorna:
- null si la relacion es valida o respuesta de error.
*/

async function validarFincaEstanqueGrupo(fincaId, estanqueId, grupoDatos, res) {
    const relacionesValidas =
        await ParasitologiaModel.fincaEstanquePertenecenGrupo(
            fincaId,
            estanqueId,
            grupoDatos
        );

    if (!relacionesValidas) {
        return error(
            res,
            "La finca o el estanque no existen, no pertenecen " +
            "al grupo de datos o no se encuentran relacionados.",
            null,
            404
        );
    }

    return null;
}

/*
Descripcion:
Normaliza los filtros permitidos para las consultas.

Parametros:
- query: Parametros de consulta.
- grupoDatos: Grupo obtenido desde el JWT.

Retorna:
- Objeto de filtros para el model.
*/

function construirFiltros(req, grupoDatos) {
    return {
        grupoDatos,
        fincaId: req.query.fincaId,
        estanqueId: req.query.estanqueId,
        parasito: req.query.parasito,
        fechaReporte: req.query.fechaReporte
    };
}

/*
Descripcion:
Convierte errores internos al formato estandar de respuesta
y registra el error en el servidor para facilitar su
diagnostico.

Retorna:
- Respuesta HTTP de error.
*/

function manejarError(res, err, mensaje) {
    console.error("[Parasitologias]", err);

    let status = 500;
    let detalle = null;

    if (err !== undefined && err !== null) {
        if (err.status !== undefined) {
            status = err.status;
        }

        if (err.message !== undefined) {
            detalle = err.message;
        }

        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            status = 409;
            detalle = "No existe el grupo, finca, estanque o creador indicado.";
        }

        if (err.code === "ER_BAD_FIELD_ERROR") {
            status = 500;
            detalle =
                "La estructura de la tabla parasitologias " +
                "no coincide con el modelo actualizado.";
        }

        if (err.code === "ER_DATA_TOO_LONG") {
            status = 400;
            detalle = "Uno de los campos excede el tamano permitido.";
        }

        if (err.code === "WARN_DATA_TRUNCATED") {
            status = 400;
            detalle =
                "Uno de los valores no coincide con el " +
                "tipo permitido por la base de datos.";
        }
    }

    return error(res, mensaje, detalle, status);
}

/*
Descripcion:
Obtiene las parasitologias activas del grupo autenticado.

Retorna:
- Lista de registros.
*/

export async function obtenerParasitologias(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const data = await ParasitologiaModel.findAll(
            construirFiltros(req, grupoDatos)
        );

        return exito(
            res,
            "Parasitologias obtenidas correctamente.",
            data
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al obtener las parasitologias."
        );
    }
}

/*
Descripcion:
Obtiene una parasitologia por id y grupo de datos.

Retorna:
- Registro encontrado o error 404.
*/

export async function obtenerParasitologiaPorId(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const { grupoDatos } = obtenerContextoPeticion(req);

        const parasitologia = await ParasitologiaModel.findById(
            req.params.id,
            grupoDatos
        );

        if (!parasitologia) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        return exito(
            res,
            "Parasitologia obtenida correctamente.",
            parasitologia
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al obtener la parasitologia."
        );
    }
}

/*
Descripcion:
Crea una parasitologia con auditoria obtenida desde el JWT.

Parametros:
- Usuario web: creadoPorUsuarioId contiene el id.
- Colaborador movil: creadoPorColaboradorId contiene el id.
- No se utiliza colaboradorId.
- El grado de infeccion se recibe desde el frontend.

Retorna:
- Registro creado con codigo HTTP 201.
*/

export async function crearParasitologia(req, res) {
    try {
        const errValidacion = validarCuerpo(req.body, res);

        if (errValidacion) {
            return errValidacion;
        }

        const {
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        } = obtenerContextoPeticion(req);

        const errRelacion = await validarFincaEstanqueGrupo(
            req.body.fincaId,
            req.body.estanqueId,
            grupoDatos,
            res
        );

        if (errRelacion) {
            return errRelacion;
        }

        const dto = construirDTO(req.body, {
            grupoDatos,
            responsable: obtenerResponsablePeticion(req),
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const nuevo = await ParasitologiaModel.create(dto);

        return exito(
            res,
            "Parasitologia creada correctamente.",
            nuevo,
            201
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al crear la parasitologia."
        );
    }
}

/*
Descripcion:
Actualiza los datos funcionales de una parasitologia.

Parametros:
- La identidad del creador original permanece inmutable.
- El grado de infeccion puede ser actualizado mediante
  el valor seleccionado en el frontend.

Retorna:
- Registro actualizado o error 404.
*/

export async function actualizarParasitologia(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const errValidacion = validarCuerpo(req.body, res);

        if (errValidacion) {
            return errValidacion;
        }

        const { grupoDatos } = obtenerContextoPeticion(req);

        const actual = await ParasitologiaModel.findById(
            req.params.id,
            grupoDatos
        );

        if (!actual) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        const errRelacion = await validarFincaEstanqueGrupo(
            req.body.fincaId,
            req.body.estanqueId,
            grupoDatos,
            res
        );

        if (errRelacion) {
            return errRelacion;
        }

        const dto = construirDTO(req.body, {
            grupoDatos,
            responsable: actual.responsable,
            creadoPorUsuarioId: actual.creadoPorUsuarioId,
            creadoPorColaboradorId: actual.creadoPorColaboradorId
        });

        const actualizado = await ParasitologiaModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

        if (!actualizado) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        return exito(
            res,
            "Parasitologia actualizada correctamente.",
            actualizado
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al actualizar la parasitologia."
        );
    }
}

/*
Descripcion:
Realiza la eliminacion logica del registro.

Parametros:
- La operacion se protege por id y grupo de datos.

Retorna:
- Registro eliminado logicamente o error 404.
*/

export async function eliminarParasitologia(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const { grupoDatos } = obtenerContextoPeticion(req);

        const eliminado = await ParasitologiaModel.remove(
            req.params.id,
            grupoDatos
        );

        if (!eliminado) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        return exito(
            res,
            "Parasitologia eliminada correctamente.",
            eliminado
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al eliminar la parasitologia."
        );
    }
}

/*
Descripcion:
Construye el resumen de parasitologias del grupo autenticado.

Retorna:
- Objeto con totales y frecuencias.
*/

export async function obtenerResumenParasitologias(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const registros = await ParasitologiaModel.findAll(
            construirFiltros(req, grupoDatos)
        );

        const resumen = construirResumenParasitologias(registros);

        return exito(
            res,
            "Resumen de parasitologias obtenido correctamente.",
            resumen
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al obtener el resumen de parasitologias."
        );
    }
}

/*
Descripcion:
Devuelve el catalogo permitido de parasitos.

Retorna:
- Lista de opciones para el frontend.
*/

export function obtenerCatalogoParasitos(req, res) {
    const data = obtenerCatalogoParasitosService();

    return exito(
        res,
        "Catalogo de parasitos obtenido correctamente.",
        data
    );
}