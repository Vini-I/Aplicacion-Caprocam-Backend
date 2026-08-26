/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.controller.js
Autor: Gerald Alfaro / Marco Vásquez
Fecha: 18/08/2026
Modulo: Estanques
Descripcion:
Recibe las peticiones HTTP, obtiene el grupo de datos y
la identidad del creador desde el JWT, delega las
operaciones a los modelos y devuelve la respuesta.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { EstanqueDTO, EstadoEstanque } from "../dtos/estanques.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isEstadoEstanque,
    isIdValido,
    isFechaOpcionalValida,
    isBooleanoOpcionalValido,
    agruparEquiposPorTipo
} from "../services/estanques.service.js";

// Modelos y Config
import * as EstanqueModel from "../models/estanques.model.js";
import * as EquipoModel from "../models/equipo.model.js";
import * as SiembraModel from "../models/siembra.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function obtenerGrupoDatosPeticion(req, res) {
    const { grupoDatos } = obtenerContextoPeticion(req);

    if (!isNumeroMayorCero(grupoDatos)) {
        error(res, "La sesion no contiene un grupo de datos valido.", null, 403);
        return null;
    }

    return Number(grupoDatos);
}

function validarCuerpo(body, res) {
    const errores = [];

    if (isEmpty(body.idFinca)) errores.push("El campo idFinca es requerido.");
    if (isEmpty(body.codigo)) errores.push("El campo codigo es requerido.");
    if (isEmpty(body.tipoEstanque)) errores.push("El campo tipoEstanque es requerido.");
    if (isEmpty(body.estado)) errores.push("El campo estado es requerido.");
    if (isEmpty(body.largo)) errores.push("El campo largo es requerido.");
    if (isEmpty(body.ancho)) errores.push("El campo ancho es requerido.");
    if (isEmpty(body.profundidad)) errores.push("El campo profundidad es requerido.");

    if (!isEmpty(body.idFinca) && !isNumeroMayorCero(body.idFinca)) {
        errores.push("El campo idFinca debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.largo) && !isNumeroMayorCero(body.largo)) {
        errores.push("El campo largo debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.ancho) && !isNumeroMayorCero(body.ancho)) {
        errores.push("El campo ancho debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.profundidad) && !isNumeroMayorCero(body.profundidad)) {
        errores.push("El campo profundidad debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.estado) && !isEstadoEstanque(body.estado)) {
        errores.push("Estado invalido. Opciones: " + Object.values(EstadoEstanque).join(", "));
    }

    if (!isFechaOpcionalValida(body.fechaMantenimiento)) {
        errores.push("El campo fechaMantenimiento debe tener formato DD/MM/YYYY o YYYY-MM-DD.");
    }

    if (!isBooleanoOpcionalValido(body.precria)) {
        errores.push("El campo precria debe ser booleano.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el estanque.", errores, 422);
    }

    return null;
}

function validarIdParametro(id, res) {
    if (!isIdValido(id)) {
        return error(res, "El id debe ser numerico y mayor que cero.", null, 400);
    }
    return null;
}

async function validarFincaGrupo(idFinca, grupoDatos, res) {
    const fincaValida = await EstanqueModel.fincaPerteneceGrupo(idFinca, grupoDatos);

    if (!fincaValida) {
        error(res, "La finca no existe o no pertenece al grupo de datos.", null, 404);
        return false;
    }

    return true;
}

function manejarError(res, err, mensaje) {
    console.error("[Estanques]", err);
    let status = 500;
    let detalle = null;

    if (err !== undefined && err !== null) {
        if (err.status !== undefined) status = err.status;
        if (err.message !== undefined) detalle = err.message;
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            status = 409;
            detalle = "No existe el grupo, finca o creador indicado.";
        }
        if (err.code === "ER_BAD_FIELD_ERROR") {
            status = 500;
            detalle = "La estructura de la tabla estanques no coincide con el modelo actualizado.";
        }
        if (err.code === "ER_DUP_ENTRY") {
            status = 409;
            detalle = "Ya existe un registro con uno de los valores unicos indicados.";
        }
        if (err.code === "ER_DATA_TOO_LONG") {
            status = 400;
            detalle = "Uno de los campos excede el tamano permitido.";
        }
        if (err.code === "WARN_DATA_TRUNCATED") {
            status = 400;
            detalle = "Uno de los valores no coincide con el tipo permitido por la base de datos.";
        }
    }

    return error(res, mensaje, detalle, status);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getEstanques(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS idFinca,
                        codigo, tipo_estanque AS tipoEstanque, estado, largo, ancho,
                        profundidad, fuente_agua AS fuenteAgua,
                        fecha_mantenimiento AS fechaMantenimiento, precria, activo
                 FROM estanques WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, "Estanques obtenidos correctamente.", rows);
        }

        const grupoDatos = obtenerGrupoDatosPeticion(req, res);
        if (grupoDatos === null) return;

        if (!isEmpty(req.query.idFinca) && !isNumeroMayorCero(req.query.idFinca)) {
            return error(res, "El filtro idFinca debe ser numerico y mayor que cero.", null, 400);
        }

        const filtros = { idFinca: req.query.idFinca, grupoDatos };
        const data = await EstanqueModel.findAll(filtros);

        return exito(res, "Estanques obtenidos correctamente.", data);
    } catch (err) {
        return manejarError(res, err, "Error al obtener los estanques.");
    }
}

export async function getEstanqueById(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, finca_id AS idFinca,
                        codigo, tipo_estanque AS tipoEstanque, estado, largo, ancho,
                        profundidad, fuente_agua AS fuenteAgua,
                        fecha_mantenimiento AS fechaMantenimiento, precria, activo
                 FROM estanques WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Estanque no encontrado.", null, 404);
            return exito(res, "Estanque obtenido correctamente.", rows[0]);
        }

        const grupoDatos = obtenerGrupoDatosPeticion(req, res);
        if (grupoDatos === null) return;

        const estanque = await EstanqueModel.findById(req.params.id, grupoDatos);

        if (!estanque) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        const equipos = await EquipoModel.findAll({ grupoDatos, estanqueId: req.params.id });
        const equiposAgrupados = agruparEquiposPorTipo(equipos);

        const detalleEstanque = {
            ...estanque,
            cantidadEquipos: equipos.length,
            equipos: equiposAgrupados
        };

        return exito(res, "Estanque obtenido correctamente.", detalleEstanque);
    } catch (err) {
        return manejarError(res, err, "Error al obtener el estanque.");
    }
}

export async function createEstanque(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        if (!isNumeroMayorCero(grupoDatos)) {
            return error(res, "La sesion no contiene un grupo de datos valido.", null, 403);
        }

        const errValidacion = validarCuerpo(req.body, res);
        if (errValidacion) return errValidacion;

        const fincaValida = await validarFincaGrupo(req.body.idFinca, grupoDatos, res);
        if (!fincaValida) return;

        const existente = await EstanqueModel.findByCodigoAndFinca(
            req.body.codigo,
            req.body.idFinca,
            null,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un estanque con ese codigo en la finca.",
                null,
                409
            );
        }

        const datosEstanque = {
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        };

        const dto = new EstanqueDTO(datosEstanque);
        const nuevo = await EstanqueModel.create(dto);

        return exito(res, "Estanque creado correctamente.", nuevo, 201);
    } catch (err) {
        return manejarError(res, err, "Error al crear el estanque.");
    }
}

export async function updateEstanque(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const grupoDatos = obtenerGrupoDatosPeticion(req, res);
        if (grupoDatos === null) return;

        const errValidacion = validarCuerpo(req.body, res);
        if (errValidacion) return errValidacion;

        const estanqueActual = await EstanqueModel.findById(req.params.id, grupoDatos);

        if (!estanqueActual) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        const fincaValida = await validarFincaGrupo(req.body.idFinca, grupoDatos, res);
        if (!fincaValida) return;

        const existente = await EstanqueModel.findByCodigoAndFinca(
            req.body.codigo,
            req.body.idFinca,
            req.params.id,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro estanque con ese codigo en la finca.",
                null,
                409
            );
        }

        const datosEstanque = {
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId: estanqueActual.creadoPorUsuarioId,
            creadoPorColaboradorId: estanqueActual.creadoPorColaboradorId
        };

        const dto = new EstanqueDTO(datosEstanque);
        const actualizado = await EstanqueModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Estanque actualizado correctamente.", actualizado);
    } catch (err) {
        return manejarError(res, err, "Error al actualizar el estanque.");
    }
}

export async function deleteEstanque(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);
        if (errId) return errId;

        const grupoDatos = obtenerGrupoDatosPeticion(req, res);
        if (grupoDatos === null) return;

        const siembraActiva = await SiembraModel.findActivaByEstanque(
            req.params.id,
            grupoDatos
        );

        if (siembraActiva) {
            return error(
                res,
                "No se puede eliminar el estanque porque tiene una siembra activa.",
                null,
                409
            );
        }

        const eliminado = await EstanqueModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Estanque eliminado correctamente.", eliminado);
    } catch (err) {
        return manejarError(res, err, "Error al eliminar el estanque.");
    }
}