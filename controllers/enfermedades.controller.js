/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.controller.js
Autor: Isaac Chaves / Marco Vásquez
Fecha: 18/08/2026
Modulo: Enfermedades
Descripcion:
Controlador del modulo de enfermedades.
Soporta GETs globales ejecutando consulta directa para Caprocam.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { EnfermedadDTO } from '../dtos/enfermedades.dto.js';
import {
    isEmpty,
    isIdValido,
    normalizarDatosEnfermedad,
    normalizarFiltrosEnfermedad,
    validarDatosEnfermedad,
    validarFiltrosEnfermedad,
    obtenerCatalogoEnfermedades as obtenerCatalogoEnfermedadesService,
    obtenerCatalogoSeveridades as obtenerCatalogoSeveridadesService,
    construirResumenEnfermedades,
} from '../services/enfermedades.service.js';

import * as EnfermedadModel from '../models/enfermedades.model.js';
import pool from '../config/database.js';
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerEnfermedades(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT e.*, e.grupo_datos AS grupoDatos FROM enfermedades e
                 WHERE e.activo = TRUE AND e.deleted_at IS NULL`
            );
            return exito(res, 'Enfermedades obtenidas correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const filtros = normalizarFiltrosEnfermedad(req.query, grupoDatos);
        const errores = validarFiltrosEnfermedad(filtros);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para consultar enfermedades.', errores, 422);
        }

        const data = await EnfermedadModel.findAll(filtros);
        return exito(res, 'Enfermedades obtenidas correctamente.', data);
    } catch (err) {
        return manejarError(res, err, 'No se pudieron obtener las enfermedades.');
    }
}

export async function obtenerEnfermedadPorId(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT e.*, e.grupo_datos AS grupoDatos FROM enfermedades e
                 WHERE e.id = ? AND e.activo = TRUE AND e.deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Enfermedad no encontrada.', null, 404);
            return exito(res, 'Enfermedad obtenida correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const registro = await EnfermedadModel.findById(req.params.id, grupoDatos);

        if (!registro) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        return exito(res, 'Enfermedad obtenida correctamente.', registro);
    } catch (err) {
        return manejarError(res, err, 'No se pudo obtener la enfermedad.');
    }
}

export async function crearEnfermedad(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const datosEntrada = {
            ...req.body,
            responsable: obtenerResponsablePeticion(req),
        };

        const datos = normalizarDatosEnfermedad(datosEntrada, grupoDatos);
        const errores = validarDatosEnfermedad(datos);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para la enfermedad.', errores, 422);
        }

        const errRelacion = await validarRelacionFincaEstanque(
            datos.fincaId,
            datos.estanqueId,
            grupoDatos,
            res
        );

        if (errRelacion) return errRelacion;

        const dto = new EnfermedadDTO({
            ...datos,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });

        const nuevo = await EnfermedadModel.create(dto);
        return exito(res, 'Enfermedad creada correctamente.', nuevo, 201);
    } catch (err) {
        return manejarError(res, err, 'No se pudo crear la enfermedad.');
    }
}

export async function actualizarEnfermedad(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const { grupoDatos } = obtenerContextoPeticion(req);

        const registroActual = await EnfermedadModel.findById(req.params.id, grupoDatos);

        if (!registroActual) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        const datosEntrada = {
            ...req.body,
            responsable: registroActual.responsable,
        };

        const datos = normalizarDatosEnfermedad(datosEntrada, grupoDatos);
        const errores = validarDatosEnfermedad(datos);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para la enfermedad.', errores, 422);
        }

        const errRelacion = await validarRelacionFincaEstanque(
            datos.fincaId,
            datos.estanqueId,
            grupoDatos,
            res
        );

        if (errRelacion) return errRelacion;

        const dto = new EnfermedadDTO({
            ...datos,
            creadoPorUsuarioId: registroActual.creadoPorUsuarioId,
            creadoPorColaboradorId: registroActual.creadoPorColaboradorId,
        });

        const actualizado = await EnfermedadModel.update(req.params.id, grupoDatos, dto);

        if (!actualizado) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        return exito(res, 'Enfermedad actualizada correctamente.', actualizado);
    } catch (err) {
        return manejarError(res, err, 'No se pudo actualizar la enfermedad.');
    }
}

export async function eliminarEnfermedad(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await EnfermedadModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        return exito(res, 'Enfermedad eliminada correctamente.', eliminado);
    } catch (err) {
        return manejarError(res, err, 'No se pudo eliminar la enfermedad.');
    }
}

export async function obtenerResumenEnfermedades(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [registros] = await pool.query(
                `SELECT e.*, e.grupo_datos AS grupoDatos FROM enfermedades e
                 WHERE e.activo = TRUE AND e.deleted_at IS NULL`
            );
            const resumen = construirResumenEnfermedades(registros);
            return exito(res, 'Resumen de enfermedades obtenido correctamente.', resumen);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const filtros = normalizarFiltrosEnfermedad(req.query, grupoDatos);
        const errores = validarFiltrosEnfermedad(filtros);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para consultar el resumen.', errores, 422);
        }

        const registros = await EnfermedadModel.findAll(filtros);
        const resumen = construirResumenEnfermedades(registros);

        return exito(res, 'Resumen de enfermedades obtenido correctamente.', resumen);
    } catch (err) {
        return manejarError(res, err, 'No se pudo obtener el resumen de enfermedades.');
    }
}

export function obtenerCatalogoEnfermedades(req, res) {
    const data = obtenerCatalogoEnfermedadesService();
    return exito(res, 'Catalogo de enfermedades obtenido correctamente.', data);
}

export function obtenerCatalogoSeveridades(req, res) {
    const data = obtenerCatalogoSeveridadesService();
    return exito(res, 'Catalogo de severidades obtenido correctamente.', data);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function obtenerResponsablePeticion(req) {
    const identidad = req.colaborador ?? req.user;
    if (!identidad) return null;

    const nombre = identidad.nombre ?? "";
    const apellidos = identidad.apellidos ?? identidad.apellido ?? "";
    const responsable = `${String(nombre).trim()} ${String(apellidos).trim()}`.trim();

    return isEmpty(responsable) ? null : responsable;
}

async function validarRelacionFincaEstanque(fincaId, estanqueId, grupoDatos, res) {
    const relacionValida = await EnfermedadModel.existeRelacionFincaEstanqueGrupo(
        fincaId,
        estanqueId,
        grupoDatos
    );

    if (!relacionValida) {
        return error(
            res,
            'La finca o el estanque no existe, no pertenece ' +
            'al grupo de datos o no existe relacion entre ambos.',
            null,
            404
        );
    }

    return null;
}

function validarIdParametro(id, res) {
    if (!isIdValido(id)) {
        return error(res, 'El id debe ser numerico y mayor que cero.', null, 400);
    }
    return null;
}

function manejarError(res, err, mensaje) {
    console.error('[Enfermedades]', err);
    let status = 500;
    let detalle = null;

    if (err !== undefined && err !== null) {
        status = err.status ?? status;
        detalle = err.message ?? detalle;

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            status = 409;
            detalle = 'No existe el grupo, finca, estanque o creador indicado.';
        }

        if (err.code === 'ER_BAD_FIELD_ERROR') {
            status = 500;
            detalle = 'La estructura de la tabla enfermedades no coincide con el modelo actualizado.';
        }

        if (err.code === 'ER_DATA_TOO_LONG') {
            status = 400;
            detalle = 'Uno de los campos excede el tamano permitido.';
        }

        if (err.code === 'WARN_DATA_TRUNCATED') {
            status = 400;
            detalle = 'Uno de los valores no coincide con el tipo permitido por la base de datos.';
        }
    }

    return error(res, mensaje, detalle, status);
}