/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.controller.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 18/08/2026
Modulo: Equipo
Descripcion:
Recibe las peticiones HTTP, obtiene el grupo de datos
desde el JWT, delega las operaciones al modelo y devuelve
la respuesta al cliente.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import {
    EquipoDTO,
    TipoEquipo,
    EstadoOperativoEquipo,
    EstadoEquipo
} from "../dtos/equipo.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroOpcionalMayorIgualCero,
    isTipoEquipo,
    isEstadoOperativoEquipo,
    isEstadoEquipo,
    isIdValido,
    isFechaValida
} from "../services/equipo.service.js";

// Modelos y Config
import * as EquipoModel from "../models/equipo.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function obtenerGrupoDatosUsuario(req, res) {
    const { grupoDatos } = obtenerContextoPeticion(req);
    if (!isNumeroMayorCero(grupoDatos)) {
        error(res, "La sesion no contiene un grupo de datos valido.", null, 403);
        return null;
    }
    return Number(grupoDatos);
}

function validarCuerpo(body, res) {
    const errores = [];

    if (isEmpty(body.identificador)) {
        errores.push("El campo identificador es requerido.");
    }

    if (isEmpty(body.nombreEquipo)) {
        errores.push("El campo nombreEquipo es requerido.");
    }

    if (isEmpty(body.descripcion)) {
        errores.push("El campo descripcion es requerido.");
    }

    if (isEmpty(body.funcionEquipo)) {
        errores.push("El campo funcionEquipo es requerido.");
    }

    if (!isFechaValida(body.fechaInstalacion)) {
        errores.push("El campo fechaInstalacion debe tener formato dd/mm/aaaa.");
    }

    if (!isTipoEquipo(body.tipoEquipo)) {
        errores.push("Tipo invalido. Opciones: " + Object.values(TipoEquipo).join(", "));
    }

    if (!isEstadoOperativoEquipo(body.estadoOperativo)) {
        errores.push(
            "Estado operativo invalido. Opciones: " +
            Object.values(EstadoOperativoEquipo).join(", ")
        );
    }

    if (!isEmpty(body.estado)) {
        if (!isEstadoEquipo(body.estado)) {
            errores.push("Estado invalido. Opciones: " + Object.values(EstadoEquipo).join(", "));
        }
    }

    if (!isEmpty(body.estanqueId)) {
        if (!isNumeroMayorCero(body.estanqueId)) {
            errores.push("El campo estanqueId debe ser numerico y mayor que cero.");
        }
    }

    if (!isNumeroOpcionalMayorIgualCero(body.horasMantenimiento)) {
        errores.push("El campo horasMantenimiento debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.horasActuales)) {
        errores.push("El campo horasActuales debe ser numerico y mayor o igual que cero.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el equipo.", errores, 422);
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

export async function getEquipos(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, identificador,
                        nombre_equipo AS nombreEquipo, descripcion,
                        tipo_equipo AS tipoEquipo, fecha_instalacion AS fechaInstalacion,
                        funcion_equipo AS funcionEquipo, estanque_id AS estanqueId,
                        horas_mantenimiento AS horasMantenimiento,
                        horas_actuales AS horasActuales,
                        estado_operativo AS estadoOperativo, estado, activo
                 FROM equipos WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, "Equipos obtenidos correctamente.", rows);
        }

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const data = await EquipoModel.findAll({
            grupoDatos,
            estanqueId: req.query.estanqueId
        });

        return exito(res, "Equipos obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener equipos.", null, 500);
    }
}

export async function getEquipoById(req, res) {
    try {
        const idError = validarIdParametro(req.params.id, res);
        if (idError) return idError;

        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, identificador,
                        nombre_equipo AS nombreEquipo, descripcion,
                        tipo_equipo AS tipoEquipo, fecha_instalacion AS fechaInstalacion,
                        funcion_equipo AS funcionEquipo, estanque_id AS estanqueId,
                        horas_mantenimiento AS horasMantenimiento,
                        horas_actuales AS horasActuales,
                        estado_operativo AS estadoOperativo, estado, activo
                 FROM equipos WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Equipo no encontrado.", null, 404);
            return exito(res, "Equipo obtenido correctamente.", rows[0]);
        }

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const equipo = await EquipoModel.findById(req.params.id, grupoDatos);

        if (!equipo) {
            return error(res, "Equipo no encontrado.", null, 404);
        }

        return exito(res, "Equipo obtenido correctamente.", equipo);
    } catch (err) {
        return error(res, "Error al obtener el equipo.", null, 500);
    }
}

export async function createEquipo(req, res) {
    try {
        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const cuerpoError = validarCuerpo(req.body, res);
        if (cuerpoError) return cuerpoError;

        const existente = await EquipoModel.findByIdentificador(
            req.body.identificador,
            null,
            grupoDatos
        );

        if (existente) {
            return error(res, "Ya existe un equipo con ese identificador.", null, 409);
        }

        const dto = new EquipoDTO({ ...req.body, grupoDatos });
        const nuevo = await EquipoModel.create(dto);

        return exito(res, "Equipo registrado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al registrar el equipo.", null, 500);
    }
}

export async function updateEquipo(req, res) {
    try {
        const idError = validarIdParametro(req.params.id, res);
        if (idError) return idError;

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const cuerpoError = validarCuerpo(req.body, res);
        if (cuerpoError) return cuerpoError;

        const existente = await EquipoModel.findByIdentificador(
            req.body.identificador,
            req.params.id,
            grupoDatos
        );

        if (existente) {
            return error(res, "Ya existe un equipo con ese identificador.", null, 409);
        }

        const dto = new EquipoDTO({ ...req.body, grupoDatos });
        const actualizado = await EquipoModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado) {
            return error(res, "Equipo no encontrado.", null, 404);
        }

        return exito(res, "Equipo actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el equipo.", null, 500);
    }
}

export async function deleteEquipo(req, res) {
    try {
        const idError = validarIdParametro(req.params.id, res);
        if (idError) return idError;

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const eliminado = await EquipoModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, "Equipo no encontrado.", null, 404);
        }

        return exito(res, "Equipo eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el equipo.", null, 500);
    }
}