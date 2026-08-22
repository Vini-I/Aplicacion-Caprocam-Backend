/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.controller.js
Autor: Eduard Salas / Marco Vásquez
Fecha: 18/08/2026
Modulo: Densidad Poblacional
Descripcion:
Recibe las peticiones HTTP, delega al modelo.
Soporta GETs globales ejecutando consulta directa para Caprocam.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { DensidadPoblacionalDTO } from "../dtos/densidadPoblacional.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isFechaValida,
    isIdValido,
    maxLength,
    normalizarTiros,
    validarTiros
} from "../services/densidadPoblacional.service.js";

// Modelos y Config
import * as DensidadPoblacionalModel from "../models/densidadPoblacional.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function obtenerContextoUsuario(req, res) {
    if (!req.user && !req.colaborador) {
        error(res, "No se pudo identificar al usuario autenticado.", null, 401);
        return null;
    }

    const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } = obtenerContextoPeticion(req);

    if (isEmpty(grupoDatos) || !isNumeroMayorCero(grupoDatos)) {
        error(res, "El token no contiene un grupo de datos valido.", null, 401);
        return null;
    }

    return { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId };
}

function obtenerIdFinca(body) {
    if (!isEmpty(body.idFinca)) return body.idFinca;
    if (!isEmpty(body.fincaId)) return body.fincaId;
    return body.finca;
}

function obtenerIdEstanque(body) {
    if (!isEmpty(body.idEstanque)) return body.idEstanque;
    if (!isEmpty(body.estanqueId)) return body.estanqueId;
    return body.estanque;
}

function validarCuerpo(body, res) {
    const errores = [];
    const idFinca = obtenerIdFinca(body);
    const idEstanque = obtenerIdEstanque(body);

    if (isEmpty(idFinca)) {
        errores.push("El campo idFinca es requerido.");
    } else if (!isNumeroMayorCero(idFinca)) {
        errores.push("El campo idFinca debe ser numerico y mayor que cero.");
    }

    if (isEmpty(idEstanque)) {
        errores.push("El campo idEstanque es requerido.");
    } else if (!isNumeroMayorCero(idEstanque)) {
        errores.push("El campo idEstanque debe ser numerico y mayor que cero.");
    }

    if (isEmpty(body.fecha)) {
        errores.push("El campo fecha es requerido.");
    } else if (!isFechaValida(body.fecha)) {
        errores.push("El campo fecha no es una fecha valida.");
    }

    if (isEmpty(body.cantidadSiembra)) {
        errores.push("El campo cantidadSiembra es requerido.");
    } else if (!isNumeroMayorCero(body.cantidadSiembra)) {
        errores.push("El campo cantidadSiembra debe ser numerico y mayor que cero.");
    }

    if (isEmpty(body.areaEstanque)) {
        errores.push("El campo areaEstanque es requerido (en hectareas).");
    } else if (!isNumeroMayorCero(body.areaEstanque)) {
        errores.push("El campo areaEstanque debe ser numerico y mayor que cero.");
    }

    if (isEmpty(body.areaAtarraya)) {
        errores.push("El campo areaAtarraya es requerido (en metros cuadrados).");
    } else if (!isNumeroMayorCero(body.areaAtarraya)) {
        errores.push("El campo areaAtarraya debe ser numerico y mayor que cero.");
    }

    const erroresTiros = validarTiros(normalizarTiros(body));
    for (let i = 0; i < erroresTiros.length; i++) {
        errores.push(erroresTiros[i]);
    }

    if (!maxLength(body.notasConteo, 255)) {
        errores.push("El campo notasConteo no puede superar los 255 caracteres.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el registro de densidad poblacional.", errores, 422);
    }

    return null;
}

function validarIdParametro(id, res) {
    if (!isIdValido(id)) {
        return error(res, "El id debe ser numerico y mayor que cero.", null, 400);
    }
    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getDensidades(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT d.*, d.grupo_datos AS grupoDatos FROM densidad_poblacional d
                 WHERE d.activo = TRUE AND d.deleted_at IS NULL`
            );
            return exito(res, "Registros de densidad poblacional obtenidos correctamente.", rows);
        }

        const contexto = obtenerContextoUsuario(req, res);
        if (!contexto) return;

        const filtros = {
            idFinca: req.query.idFinca,
            idEstanque: req.query.idEstanque,
            idUsuario: req.query.idUsuario,
            grupoDatos: contexto.grupoDatos
        };

        const data = await DensidadPoblacionalModel.findAll(filtros);
        return exito(res, "Registros de densidad poblacional obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los registros de densidad poblacional.", err, 500);
    }
}

export async function getDensidadById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT d.*, d.grupo_datos AS grupoDatos FROM densidad_poblacional d
                 WHERE d.id = ? AND d.activo = TRUE AND d.deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
            return exito(res, "Registro de densidad poblacional obtenido correctamente.", rows[0]);
        }

        const contexto = obtenerContextoUsuario(req, res);
        if (!contexto) return;

        const registro = await DensidadPoblacionalModel.findById(req.params.id, contexto.grupoDatos);

        if (!registro) {
            return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
        }

        return exito(res, "Registro de densidad poblacional obtenido correctamente.", registro);
    } catch (err) {
        return error(res, "Error al obtener el registro de densidad poblacional.", err, 500);
    }
}

export async function getDatosBaseEstanque(req, res) {
    try {
        const contexto = obtenerContextoUsuario(req, res);
        if (!contexto) return;

        const idEstanque = req.params.idEstanque;

        if (!isIdValido(idEstanque)) {
            return error(res, "El id del estanque debe ser numerico y mayor que cero.", null, 400);
        }

        const datosBase = await DensidadPoblacionalModel.findDatosBaseEstanque(
            idEstanque,
            contexto.grupoDatos
        );

        if (!datosBase) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Datos base del estanque obtenidos correctamente.", datosBase);
    } catch (err) {
        return error(res, "Error al obtener los datos base del estanque.", err, 500);
    }
}

async function validarSiembraRealEstanque(idEstanque, grupoDatos, res) {
    const datosBase = await DensidadPoblacionalModel.findDatosBaseEstanque(
        idEstanque,
        grupoDatos
    );

    if (!datosBase) {
        error(res, "Estanque no encontrado.", null, 404);
        return null;
    }

    const cantidadSiembra = Number(datosBase.cantidadSiembra);

    if (
        datosBase.origenCantidadSiembra === "sin_siembra" ||
        !Number.isFinite(cantidadSiembra) ||
        cantidadSiembra <= 0
    ) {
        error(
            res,
            "El estanque seleccionado no tiene una siembra real registrada. " +
            "Debe registrar una siembra antes de guardar la densidad poblacional.",
            null,
            422
        );
        return null;
    }

    return datosBase;
}

export async function createDensidad(req, res) {
    try {
        const contexto = obtenerContextoUsuario(req, res);
        if (!contexto) return;

        const err = validarCuerpo(req.body, res);
        if (err) return err;

        const idEstanque = obtenerIdEstanque(req.body);

        const datosBase = await validarSiembraRealEstanque(
            idEstanque,
            contexto.grupoDatos,
            res
        );
        if (!datosBase) return;

        const existente = await DensidadPoblacionalModel.findByFechaAndEstanque(
            req.body.fecha,
            idEstanque,
            null,
            contexto.grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un registro de densidad poblacional para ese estanque en esa fecha.",
                null,
                409
            );
        }

        const bodySeguro = {
            ...req.body,
            cantidadSiembra: datosBase.cantidadSiembra,
            areaEstanque: datosBase.areaEstanque
        };

        const dto = new DensidadPoblacionalDTO(bodySeguro, contexto);
        const nuevo = await DensidadPoblacionalModel.create(dto);

        return exito(res, "Registro de densidad poblacional creado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear el registro de densidad poblacional.", err, 500);
    }
}

export async function updateDensidad(req, res) {
    try {
        const contexto = obtenerContextoUsuario(req, res);
        if (!contexto) return;

        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const err = validarCuerpo(req.body, res);
        if (err) return err;

        const registroActual = await DensidadPoblacionalModel.findById(req.params.id, contexto.grupoDatos);

        if (!registroActual) {
            return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
        }

        const idEstanque = obtenerIdEstanque(req.body);

        const datosBase = await validarSiembraRealEstanque(
            idEstanque,
            contexto.grupoDatos,
            res
        );
        if (!datosBase) return;

        const existente = await DensidadPoblacionalModel.findByFechaAndEstanque(
            req.body.fecha,
            idEstanque,
            req.params.id,
            contexto.grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro registro de densidad poblacional para ese estanque en esa fecha.",
                null,
                409
            );
        }

        const bodySeguro = {
            ...req.body,
            cantidadSiembra: datosBase.cantidadSiembra,
            areaEstanque: datosBase.areaEstanque
        };

        const dto = new DensidadPoblacionalDTO(bodySeguro, contexto);

        const actualizado = await DensidadPoblacionalModel.update(
            req.params.id,
            dto,
            contexto.grupoDatos
        );

        return exito(res, "Registro de densidad poblacional actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el registro de densidad poblacional.", err, 500);
    }
}

export async function deleteDensidad(req, res) {
    try {
        const contexto = obtenerContextoUsuario(req, res);
        if (!contexto) return;

        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const eliminado = await DensidadPoblacionalModel.remove(req.params.id, contexto.grupoDatos);

        if (!eliminado) {
            return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
        }

        return exito(res, "Registro de densidad poblacional eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el registro de densidad poblacional.", err, 500);
    }
}
