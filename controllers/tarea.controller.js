/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.controller.js
Autor: Marco Vásquez
Fecha: 18/08/2026
Modulo: Tareas
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { TareaDTO, CategoriasTarea } from '../dtos/tarea.dto.js';

// Servicios y Modelos
import { isCategoriaValida, isDuracionValida, isEmpty } from '../services/tarea.service.js';
import * as TareaModel from '../models/tarea.model.js';
import pool from '../config/database.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import { obtenerContextoPeticion } from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({ nombre, descripcion, categoria, horas }, res) {
    if (isEmpty(nombre) || isEmpty(descripcion))
        return error(res, 'Nombre y descripcion son requeridos.', null, 400);

    if (!isCategoriaValida(categoria))
        return error(res, `Categoria invalida. Opciones: ${Object.values(CategoriasTarea).join(', ')}`, null, 422);

    if (!isDuracionValida(horas))
        return error(res, 'Las horas estimadas deben ser un numero mayor a cero.', null, 422);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getTareas(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, codigo_tarea AS codigoTarea,
                        nombre, descripcion, categoria, horas, activo
                 FROM tareas WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Tareas obtenidas correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await TareaModel.findAll(grupoDatos);
        return exito(res, 'Tareas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener tareas.', err);
    }
}

export async function getTareaById(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, codigo_tarea AS codigoTarea,
                        nombre, descripcion, categoria, horas, activo
                 FROM tareas WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, 'Tarea no encontrada.', null, 404);
            return exito(res, 'Tarea obtenida correctamente.', rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const tarea = await TareaModel.findById(req.params.id, grupoDatos);

        if (!tarea)
            return error(res, 'Tarea no encontrada.', null, 404);

        return exito(res, 'Tarea obtenida correctamente.', tarea);
    } catch (err) {
        return error(res, 'Error al obtener tarea.', err);
    }
}

export async function getCatalogoTareas(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, codigo_tarea AS codigoTarea, nombre FROM tareas
                 WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, 'Catalogo de tareas obtenido correctamente.', rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const tareas = await TareaModel.findAll(grupoDatos);
        const catalogo = tareas.map(t => ({ id: t.id, codigoTarea: t.codigoTarea, nombre: t.nombre }));
        return exito(res, 'Catalogo de tareas obtenido correctamente.', catalogo);
    } catch (err) {
        return error(res, 'Error al obtener catalogo de tareas.', err);
    }
}

export async function createTarea(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { codigoTarea, nombre, descripcion, categoria, horas } = req.body;

        const err = validarCuerpo({ nombre, descripcion, categoria, horas }, res);
        if (err) return err;

        const dto = new TareaDTO({ codigoTarea, nombre, descripcion, categoria, horas });
        const nueva = await TareaModel.create(dto, grupoDatos);

        return exito(res, 'Tarea creada correctamente.', nueva, 201);
    } catch (err) {
        return error(res, 'Error al crear tarea.', err);
    }
}

export async function updateTarea(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const { nombre, descripcion, categoria, horas} = req.body;

        const err = validarCuerpo({ nombre, descripcion, categoria, horas }, res);
        if (err) return err;

        const dto = new TareaDTO({ nombre, descripcion, categoria, horas });
        const actualizada = await TareaModel.update(req.params.id, dto, grupoDatos);

        if (!actualizada)
            return error(res, 'Tarea no encontrada.', null, 404);

        return exito(res, 'Tarea actualizada correctamente.', actualizada);
    } catch (err) {
        return error(res, 'Error al actualizar tarea.', err);
    }
}

export async function deleteTarea(req, res) {
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminada = await TareaModel.remove(req.params.id, grupoDatos);

        if (!eliminada)
            return error(res, 'Tarea no encontrada.', null, 404);

        return exito(res, 'Tarea eliminada correctamente.', eliminada);
    } catch (err) {
        return error(res, 'Error al eliminar tarea.', err);
    }
}