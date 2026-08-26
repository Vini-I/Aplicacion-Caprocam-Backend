/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: Finca.controller.js
Autor: Greivin Arguedas / Marco Vásquez
Fecha: 18/08/2026
Modulo: Finca
Descripcion:
Recibe las peticiones HTTP, delega y devuelve respuesta.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { FincaDTO } from "../dtos/finca.dto.js";
import * as FincaModel from "../models/finca.model.js";
import pool from "../config/database.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getFincas(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos,
                        codigo_cbo AS codigoCBO, nombre_finca AS nombreFinca,
                        provincia, canton, distrito, otras_senas AS otrasSenas,
                        propietario_responsable AS propietarioResponsable,
                        telefono, area_total AS areaTotal, espejos_agua AS espejosAgua,
                        activo
                 FROM fincas WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, "Fincas obtenidas correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await FincaModel.findAll(grupoDatos);
        return exito(res, "Fincas obtenidas correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener las fincas.", err, 500);
    }
}

export async function getFincaById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos,
                        codigo_cbo AS codigoCBO, nombre_finca AS nombreFinca,
                        provincia, canton, distrito, otras_senas AS otrasSenas,
                        propietario_responsable AS propietarioResponsable,
                        telefono, area_total AS areaTotal, espejos_agua AS espejosAgua,
                        activo
                 FROM fincas
                 WHERE (id = ? OR codigo_cbo = ?) AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id, req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Finca no encontrada.", null, 404);
            return exito(res, "Finca obtenida correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const registro = await FincaModel.findByIdCBO(req.params.id, grupoDatos);

        if (!registro) {
            return error(res, "Finca no encontrada.", null, 404);
        }

        return exito(res, "Finca obtenida correctamente.", registro);
    } catch (err) {
        return error(res, "Error al obtener la finca.", err, 500);
    }
}

export async function createFinca(req, res) {
    try {
        const { grupoDatos, creadoPorUsuarioId } = obtenerContextoPeticion(req);
        const {
            codigoCBO,
            nombreFinca,
            provincia,
            canton,
            distrito,
            otrasSenas,
            propietarioResponsable,
            telefono,
            areaTotal,
            espejosAgua,
            propietarioUsuarioId
        } = req.body;

        const dto = new FincaDTO(
            grupoDatos,
            codigoCBO,
            nombreFinca,
            provincia,
            canton,
            distrito,
            otrasSenas,
            propietarioResponsable,
            telefono ?? null,
            areaTotal,
            espejosAgua,
            creadoPorUsuarioId,
            propietarioUsuarioId ?? creadoPorUsuarioId
        );

        const nuevaFinca = await FincaModel.create(dto);
        return exito(res, "Finca creada correctamente.", nuevaFinca, 201);
    } catch (err) {
        return error(res, "Error al crear la finca.", err, 500);
    }
}

export async function updateFinca(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const {
            codigoCBO,
            nombreFinca,
            provincia,
            canton,
            distrito,
            otrasSenas,
            propietarioResponsable,
            telefono,
            areaTotal,
            espejosAgua,
        } = req.body;

        const dto = new FincaDTO(
            grupoDatos,
            codigoCBO,
            nombreFinca,
            provincia,
            canton,
            distrito,
            otrasSenas,
            propietarioResponsable,
            telefono ?? null,
            areaTotal,
            espejosAgua
        );

        const actualizado = await FincaModel.update(req.params.id, grupoDatos, dto);
        if (!actualizado) {
            return error(res, "Finca no encontrada.", null, 404);
        }
        return exito(res, "Finca actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar la finca.", err, 500);
    }
}

export async function deleteFinca(req, res) {
try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const fincaParam = req.params.id;

        const finca = await FincaModel.findByIdCBO(fincaParam, grupoDatos);
        if (!finca) {
            return error(res, "Finca no encontrada.", null, 404);
        }

        const estaOcupada = await FincaModel.tieneEstanquesOcupados(finca.id, grupoDatos);
        if (estaOcupada) {
            return error(
                res,
                "No se puede eliminar: contiene estanques activos.",
                null,
                409
            );
        }

        const eliminado = await FincaModel.remove(finca.id, grupoDatos);
        if (!eliminado) {
            return error(res, "No se pudo eliminar la finca.", null, 400);
        }

        return exito(res, "Finca y sus estanques asociados han sido eliminados correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar la finca.", err?.message ?? err, 500);
    }
}