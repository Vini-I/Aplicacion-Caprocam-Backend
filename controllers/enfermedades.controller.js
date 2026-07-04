/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.controller.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Controlador encargado de manejar peticiones HTTP del modulo
de enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Common
import { error, exito } from "../common/respuestaJson.js";

// Services
import enfermedadesService from "../services/enfermedades.service.js";

// DTOs
import {
    actualizarEnfermedadDTO,
    crearEnfermedadDTO
} from "../dtos/enfermedades.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene registros de enfermedades con filtros opcionales.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const filtros = {
            finca: req.query.finca,
            estanque: req.query.estanque,
            severidad: req.query.severidad,
            fechaReporte: req.query.fechaReporte
        };

        const data = await enfermedadesService.obtenerEnfermedades(filtros);

        return exito(res, "Enfermedades obtenidas correctamente.", data, 200);
    } catch (err) {
        return manejarError(res, err, "No se pudieron obtener enfermedades.");
    }
}

export async function obtenerEnfermedadPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de enfermedad por id.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const data = await enfermedadesService.obtenerEnfermedadPorId(
            req.params.id
        );

        return exito(res, "Enfermedad obtenida correctamente.", data, 200);
    } catch (err) {
        return manejarError(res, err, "No se pudo obtener la enfermedad.");
    }
}

export async function crearEnfermedad(req, res) {
    /*
    Descripcion:
    Crea un registro de enfermedad.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const datos = crearEnfermedadDTO(req.body);
        const data = await enfermedadesService.crearEnfermedad(datos);

        return exito(res, "Enfermedad creada correctamente.", data, 201);
    } catch (err) {
        return manejarError(res, err, "No se pudo crear la enfermedad.");
    }
}

export async function actualizarEnfermedad(req, res) {
    /*
    Descripcion:
    Actualiza un registro completo de enfermedad.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const datos = actualizarEnfermedadDTO(req.body);

        const data = await enfermedadesService.actualizarEnfermedad(
            req.params.id,
            datos
        );

        return exito(res, "Enfermedad actualizada correctamente.", data, 200);
    } catch (err) {
        return manejarError(res, err, "No se pudo actualizar la enfermedad.");
    }
}

export async function eliminarEnfermedad(req, res) {
    /*
    Descripcion:
    Ejecuta borrado logico de un registro.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const data = await enfermedadesService.eliminarEnfermedad(
            req.params.id
        );

        return exito(res, "Enfermedad eliminada correctamente.", data, 200);
    } catch (err) {
        return manejarError(res, err, "No se pudo eliminar la enfermedad.");
    }
}

export async function limpiarEnfermedades(req, res) {
    /*
    Descripcion:
    Limpia todos los registros mock locales.
    Solo se usa para pruebas locales.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const data = await enfermedadesService.limpiarEnfermedades();

        return exito(res, "Datos mock limpiados correctamente.", data, 200);
    } catch (err) {
        return manejarError(res, err, "No se pudieron limpiar los datos.");
    }
}

export async function obtenerResumenEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene resumen sanitario del modulo.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const filtros = {
            finca: req.query.finca,
            estanque: req.query.estanque,
            severidad: req.query.severidad,
            fechaReporte: req.query.fechaReporte
        };

        const data = await enfermedadesService.obtenerResumenEnfermedades(
            filtros
        );

        return exito(
            res,
            "Resumen de enfermedades obtenido correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(res, err, "No se pudo obtener el resumen.");
    }
}

export function obtenerCatalogoEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene catalogo local de enfermedades.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const data = enfermedadesService.obtenerCatalogoEnfermedades();

        return exito(
            res,
            "Catalogo de enfermedades obtenido correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(res, err, "No se pudo obtener el catalogo.");
    }
}

export function obtenerCatalogoSeveridades(req, res) {
    /*
    Descripcion:
    Obtiene catalogo local de severidades.

    Parametros:
    - req: Objeto request
    - res: Objeto response

    Retorna:
    - JSON estandar
    */

    try {
        const data = enfermedadesService.obtenerCatalogoSeveridades();

        return exito(
            res,
            "Catalogo de severidades obtenido correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(res, err, "No se pudo obtener el catalogo.");
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

// Todas las funciones principales dependen de esta funcion
function manejarError(res, err, mensaje) {
    /*
    Descripcion:
    Maneja errores del controller.

    Parametros:
    - res: Objeto response
    - err: Error capturado
    - mensaje: Mensaje de respuesta

    Retorna:
    - JSON estandar de error
    */

    let status = 500;

    if (err.status !== undefined) {
        status = err.status;
    }

    return error(res, mensaje, err, status);
}
