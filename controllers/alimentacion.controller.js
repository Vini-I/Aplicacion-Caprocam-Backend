/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.controller.js
Autor: Wendy Martinez / Marco Vásquez
Fecha: 18/08/2026
Modulo: Alimentacion
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

import { AlimentacionDTO, MetodoAlimentacion, HoraAlimentacion } from "../dtos/alimentacion.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroOpcionalMayorIgualCero,
    isFechaValida,
    isMetodoAlimentacion,
    isHoraAlimentacion,
    isIdValido,
    maxLength
} from "../services/alimentacion.service.js";

// Modelos y Config
import * as AlimentacionModel from "../models/alimentacion.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

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

    if (isEmpty(body.cantidadKg)) {
        errores.push("El campo cantidadKg es requerido.");
    } else if (!isNumeroMayorCero(body.cantidadKg)) {
        errores.push("El campo cantidadKg debe ser numerico y mayor que cero.");
    }

    if (isEmpty(body.hora)) {
        errores.push("El campo hora es requerido.");
    } else if (!isHoraAlimentacion(body.hora)) {
        errores.push("Hora invalida. Opciones: " + Object.values(HoraAlimentacion).join(", "));
    }

    if (isEmpty(body.metodo)) {
        errores.push("El campo metodo es requerido.");
    } else if (!isMetodoAlimentacion(body.metodo)) {
        errores.push("Metodo invalido. Opciones: " + Object.values(MetodoAlimentacion).join(", "));
    }

    if (!isNumeroOpcionalMayorIgualCero(body.idColaborador)) {
        errores.push("El campo idColaborador debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.idProveedor)) {
        errores.push("El campo idProveedor debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.idProducto)) {
        errores.push("El campo idProducto debe ser numerico y mayor o igual que cero.");
    }

    if (!maxLength(body.observaciones, 1000)) {
        errores.push("El campo observaciones no puede superar los 1000 caracteres.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el registro de alimentacion.", errores, 422);
    }

    return null;
}

function manejarError(res, mensaje, err) {
    const codigo = err?.status ?? 500;
    const mensajeFinal = codigo !== 500 && err?.message ? err.message : mensaje;
    return error(res, mensajeFinal, err, codigo);
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

export async function getAlimentaciones(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        // Consulta global directa si es Caprocam y no envio grupoDatos
        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT a.id, a.uuid, a.grupo_datos AS grupoDatos,
                        a.finca_id AS idFinca, f.nombre_finca AS nombreFinca,
                        a.estanque_id AS idEstanque, e.codigo AS codigoEstanque,
                        a.fecha, a.hora, a.metodo, a.cantidad_kg AS cantidadKg,
                        a.observaciones, a.activo
                 FROM alimentaciones a
                 LEFT JOIN fincas f ON a.finca_id = f.id
                 LEFT JOIN estanques e ON a.estanque_id = e.id
                 WHERE a.activo = TRUE AND a.deleted_at IS NULL`
            );
            return exito(res, "Registros de alimentacion obtenidos correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const filtros = {
            idFinca: req.query.idFinca,
            idEstanque: req.query.idEstanque,
            grupoDatos
        };

        const data = await AlimentacionModel.findAll(filtros);
        return exito(res, "Registros de alimentacion obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los registros de alimentacion.", err, 500);
    }
}

export async function getAlimentacionById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT a.*, a.grupo_datos AS grupoDatos FROM alimentaciones a
                 WHERE a.id = ? AND a.activo = TRUE AND a.deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Registro de alimentacion no encontrado.", null, 404);
            return exito(res, "Registro de alimentacion obtenido correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const registro = await AlimentacionModel.findById(req.params.id, grupoDatos);

        if (!registro) {
            return error(res, "Registro de alimentacion no encontrado.", null, 404);
        }

        return exito(res, "Registro de alimentacion obtenido correctamente.", registro);
    } catch (err) {
        return error(res, "Error al obtener el registro de alimentacion.", err, 500);
    }
}

export async function createAlimentacion(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const err = validarCuerpo(req.body, res);
        if (err) return err;

        const idEstanque = obtenerIdEstanque(req.body);

        const existente = await AlimentacionModel.findByFechaHoraEstanque(
            req.body.fecha,
            req.body.hora,
            idEstanque,
            null,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un registro de alimentacion para ese estanque en esa fecha y hora.",
                null,
                409
            );
        }

        const dto = new AlimentacionDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });

        const nuevo = await AlimentacionModel.create(dto);
        return exito(res, "Registro de alimentacion creado correctamente.", nuevo, 201);
    } catch (err) {
        return manejarError(res, "Error al crear el registro de alimentacion.", err);
    }
}

export async function updateAlimentacion(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const err = validarCuerpo(req.body, res);
        if (err) return err;

        const registroActual = await AlimentacionModel.findById(req.params.id, grupoDatos);

        if (!registroActual) {
            return error(res, "Registro de alimentacion no encontrado.", null, 404);
        }

        const idEstanque = obtenerIdEstanque(req.body);

        const existente = await AlimentacionModel.findByFechaHoraEstanque(
            req.body.fecha,
            req.body.hora,
            idEstanque,
            req.params.id,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro registro de alimentacion para ese estanque en esa fecha y hora.",
                null,
                409
            );
        }

        const dto = new AlimentacionDTO({ ...req.body, grupoDatos });

        const actualizado = await AlimentacionModel.update(
            req.params.id,
            dto,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        );

        return exito(res, "Registro de alimentacion actualizado correctamente.", actualizado);
    } catch (err) {
        return manejarError(res, "Error al actualizar el registro de alimentacion.", err);
    }
}

export async function deleteAlimentacion(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const eliminado = await AlimentacionModel.remove(
            req.params.id,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        );

        if (!eliminado) {
            return error(res, "Registro de alimentacion no encontrado.", null, 404);
        }

        return exito(res, "Registro de alimentacion eliminado correctamente.", eliminado);
    } catch (err) {
        return manejarError(res, "Error al eliminar el registro de alimentacion.", err);
    }
}