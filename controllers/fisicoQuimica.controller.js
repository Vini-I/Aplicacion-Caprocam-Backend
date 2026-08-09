/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.controller.js
Autor: Samuel Cerdas
Fecha: 31/07/2026
Modulo: Fisico Quimica
Descripcion:
Recibe las peticiones HTTP, delega al model y
devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTO
*/

import { FisicoQuimicaDTO } from '../dtos/fisicoQuimica.dto.js';

// Modelos
import * as FisicoQuimicaModel from '../models/fisicoQuimica.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';
import {
    obtenerContextoPeticion
} from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function esIdValido(valor) {
    /*
    Descripcion:
    Valida que un identificador sea entero y mayor a cero.

    Parametros:
    - valor: Identificador recibido.

    Retorna:
    - true si el identificador es valido.
    - false si no es valido.
    */
    const id = Number(valor);

    return Number.isInteger(id) && id > 0;
}

function esFechaConsultaValida(fecha) {
    /*
    Descripcion:
    Valida una fecha con formato YYYY-MM-DD.

    Parametros:
    - fecha: Fecha recibida desde el query string.

    Retorna:
    - true si la fecha es valida.
    - false si no es valida.
    */
    if (
        typeof fecha !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return false;
    }

    const fechaConvertida = new Date(
        `${fecha}T00:00:00`
    );

    if (
        Number.isNaN(
            fechaConvertida.getTime()
        )
    ) {
        return false;
    }

    return fechaConvertida
        .toISOString()
        .slice(0, 10) === fecha;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de fisico quimica.
*/

export async function obtenerTodasLasLecturas(req, res) {
    /*
    Descripcion:
    Obtiene todas las lecturas fisico quimicas del grupo
    de datos autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lista de lecturas.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } =
            obtenerContextoPeticion(req);

        const data = await FisicoQuimicaModel.findAll(
            grupoDatos
        );

        return exito(
            res,
            'Lecturas obtenidas correctamente.',
            data
        );
    } catch (err) {
        return error(
            res,
            'Error al obtener las lecturas.',
            err
        );
    }
}

export async function obtenerLecturaPorEstanqueYFecha(
    req,
    res
) {
    /*
    Descripcion:
    Busca una lectura por estanque y fecha dentro del grupo
    de datos autenticado.

    Parametros:
    - req: Objeto request con estanqueId, fecha y usuario.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura encontrada o null.
    - 400 si los parametros no son validos.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } =
            obtenerContextoPeticion(req);
        const { estanqueId } = req.params;
        const { fecha } = req.query;

        if (!esIdValido(estanqueId)) {
            return error(
                res,
                'El estanqueId no es valido.',
                null,
                400
            );
        }

        if (!esFechaConsultaValida(fecha)) {
            return error(
                res,
                'Debe indicar una fecha valida ' +
                    '(YYYY-MM-DD) en el query string.',
                null,
                400
            );
        }

        const data =
            await FisicoQuimicaModel
                .findByEstanqueAndFecha(
                    estanqueId,
                    fecha,
                    grupoDatos
                );

        return exito(
            res,
            'Consulta realizada correctamente.',
            data
        );
    } catch (err) {
        return error(
            res,
            'Error al consultar la lectura.',
            err
        );
    }
}

export async function obtenerLecturaPorId(req, res) {
    /*
    Descripcion:
    Obtiene una lectura fisico quimica por su ID y grupo
    de datos.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura encontrada.
    - 404 si no existe.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } =
            obtenerContextoPeticion(req);

        const data = await FisicoQuimicaModel.findById(
            req.params.id,
            grupoDatos
        );

        if (!data) {
            return error(
                res,
                'Lectura no encontrada.',
                null,
                404
            );
        }

        return exito(
            res,
            'Lectura obtenida correctamente.',
            data
        );
    } catch (err) {
        return error(
            res,
            'Error al obtener la lectura.',
            err
        );
    }
}

export async function registrarLectura(req, res) {
    /*
    Descripcion:
    Registra una nueva lectura fisico quimica para el grupo
    de datos autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con la lectura creada.
    - 500 si ocurre un error inesperado.
    */
    try {
        const {
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        } = obtenerContextoPeticion(req);

        const dto = new FisicoQuimicaDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const data = await FisicoQuimicaModel.create(
            dto,
            grupoDatos
        );

        return exito(
            res,
            'Lectura registrada correctamente.',
            data,
            201
        );
    } catch (err) {
        return error(
            res,
            'Error al registrar la lectura.',
            err
        );
    }
}

export async function actualizarLectura(req, res) {
    /*
    Descripcion:
    Actualiza una lectura fisico quimica perteneciente al
    grupo de datos autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura actualizada.
    - 404 si no existe.
    - 500 si ocurre un error inesperado.
    */
    try {
        const {
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        } = obtenerContextoPeticion(req);

        const dto = new FisicoQuimicaDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const data = await FisicoQuimicaModel.update(
            req.params.id,
            dto,
            grupoDatos
        );

        if (!data) {
            return error(
                res,
                'Lectura no encontrada.',
                null,
                404
            );
        }

        return exito(
            res,
            'Lectura actualizada correctamente.',
            data
        );
    } catch (err) {
        return error(
            res,
            'Error al actualizar la lectura.',
            err
        );
    }
}

export async function desactivarLectura(req, res) {
    /*
    Descripcion:
    Realiza el borrado logico de una lectura fisico quimica
    perteneciente al grupo de datos autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la lectura desactivada.
    - 404 si no existe.
    - 500 si ocurre un error inesperado.
    */
    try {
        const { grupoDatos } =
            obtenerContextoPeticion(req);

        const data = await FisicoQuimicaModel.remove(
            req.params.id,
            grupoDatos
        );

        if (!data) {
            return error(
                res,
                'Lectura no encontrada.',
                null,
                404
            );
        }

        return exito(
            res,
            'Estado actualizado correctamente.',
            data
        );
    } catch (err) {
        return error(
            res,
            'Error al actualizar el estado.',
            err
        );
    }
}
