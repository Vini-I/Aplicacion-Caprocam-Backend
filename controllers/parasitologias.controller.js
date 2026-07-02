/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.controller.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Recibe las peticiones HTTP del modulo de parasitologias,
delega la logica al servicio y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import {
    actualizarParasitologiaEntradaDTO,
    crearParasitologiaEntradaDTO
} from "../dtos/parasitologias.dto.js";

// Servicios
import parasitologiasService from "../services/parasitologias.service.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Las funciones principales dependen de esta funcion para
manejar errores enviados por el servicio.
*/

function manejarError(res, err, mensaje) {
    /*
    Descripcion:
    Maneja los errores generados en el controlador o servicio.

    Parametros:
    - res: Objeto response de Express
    - err: Error capturado
    - mensaje: Mensaje personalizado para la respuesta

    Retorna:
    - Una respuesta JSON de error con su respectivo status
    */
    let status = 500;

    if (err !== null && err !== undefined && err.status !== undefined) {
        status = err.status;
    }

    return error(res, mensaje, err, status);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de parasitologias.
*/

export async function obtenerParasitologias(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de parasitologias.
    Permite filtrar por finca, estanque, parasito y fechaReporte.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de registros de parasitologias
    */
    try {
        const filtros = {
            finca: req.query.finca,
            estanque: req.query.estanque,
            parasito: req.query.parasito,
            fechaReporte: req.query.fechaReporte
        };

        const data = await parasitologiasService.obtenerParasitologias(filtros);

        return exito(
            res,
            "Parasitologias obtenidas correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudieron obtener las parasitologias."
        );
    }
}

export async function obtenerParasitologiaPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de parasitologia por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro encontrado
    - 400 si el ID no es valido
    - 404 si el registro no existe
    */
    try {
        const id = req.params.id;
        const data = await parasitologiasService.obtenerParasitologiaPorId(id);

        return exito(
            res,
            "Parasitologia obtenida correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudo obtener la parasitologia."
        );
    }
}

export async function crearParasitologia(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de parasitologia.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 201 con el registro creado
    - 400 si hay errores de validacion
    */
    try {
        const validacion = parasitologiasService.validarDatosParasitologia(
            req.body
        );

        if (validacion.valido === false) {
            return error(
                res,
                "Datos invalidos para crear la parasitologia.",
                validacion.errores,
                400
            );
        }

        const datos = crearParasitologiaEntradaDTO(req.body);
        const data = await parasitologiasService.crearParasitologia(datos);

        return exito(
            res,
            "Parasitologia creada correctamente.",
            data,
            201
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudo crear la parasitologia."
        );
    }
}

export async function actualizarParasitologia(req, res) {
    /*
    Descripcion:
    Actualiza un registro de parasitologia existente por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro actualizado
    - 400 si el ID no es valido o hay errores de validacion
    - 404 si el registro no existe
    */
    try {
        const validacion = parasitologiasService.validarDatosParasitologia(
            req.body
        );

        if (validacion.valido === false) {
            return error(
                res,
                "Datos invalidos para actualizar la parasitologia.",
                validacion.errores,
                400
            );
        }

        const id = req.params.id;
        const datos = actualizarParasitologiaEntradaDTO(req.body);

        const data = await parasitologiasService.actualizarParasitologia(
            id,
            datos
        );

        return exito(
            res,
            "Parasitologia actualizada correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudo actualizar la parasitologia."
        );
    }
}

export async function eliminarParasitologia(req, res) {
    /*
    Descripcion:
    Elimina un registro de parasitologia por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro eliminado
    - 400 si el ID no es valido
    - 404 si el registro no existe
    */
    try {
        const id = req.params.id;
        const data = await parasitologiasService.eliminarParasitologia(id);

        return exito(
            res,
            "Parasitologia eliminada correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudo eliminar la parasitologia."
        );
    }
}

export async function obtenerResumenParasitologias(req, res) {
    /*
    Descripcion:
    Obtiene un resumen general de los registros de parasitologias.
    Permite filtrar por finca, estanque, parasito y fechaReporte.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el resumen de parasitologias
    */
    try {
        const filtros = {
            finca: req.query.finca,
            estanque: req.query.estanque,
            parasito: req.query.parasito,
            fechaReporte: req.query.fechaReporte
        };

        const data = await parasitologiasService.obtenerResumenParasitologias(
            filtros
        );

        return exito(
            res,
            "Resumen de parasitologias obtenido correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudo obtener el resumen de parasitologias."
        );
    }
}

export async function obtenerCatalogoParasitos(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de parasitos disponibles para registrar
    una parasitologia.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el catalogo de parasitos
    */
    try {
        const data = parasitologiasService.obtenerCatalogoParasitos();

        return exito(
            res,
            "Catalogo de parasitos obtenido correctamente.",
            data,
            200
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "No se pudo obtener el catalogo de parasitos."
        );
    }
}