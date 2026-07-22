/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.controller.js
Autor: Brandon
Fecha: 03/07/2026
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

Librerias externas
*/
import { FisicoQuimicaDTO } from '../dtos/fisicoQuimica.dto.js';

// Servicios
import {
    isEmpty,
    isFechaValida,
    isIdValido,
    isPhValido,
    isSalinidadValida,
    isTemperaturaValida,
    isOxigeno,
} from '../services/fisicoQuimica.service.js';

// Modelos
import * as FisicoQuimicaModel from '../models/fisicoQuimica.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

//const grupoDatos = req.user.grupoDatos;

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Las funciones createLectura() dependen de
esta funcion para trabajar.
*/

function validarCuerpo({ fincaId, estanqueId, fecha, ph, salinidad, temperatura, oxigeno }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - fincaId, estanqueId, fecha, ph, salinidad, temperatura, oxigeno: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (!isIdValido(fincaId))
        return error(res, 'El fincaId no es valido.', null, 400);

    if (isEmpty(estanqueId))
        return error(res, 'El estanqueId es obligatorio.', null, 400);

    if (!isFechaValida(fecha))
        return error(res, 'La fecha es obligatoria.', null, 400);

    if (!isPhValido(ph))
        return error(res, 'El ph debe ser un arreglo con al menos un elemento.', null, 400);

    if (!isSalinidadValida(salinidad))
        return error(res, 'La salinidad debe ser un arreglo con al menos un elemento.', null, 400);

    if (!isTemperaturaValida(temperatura))
        return error(res, 'La temperatura debe ser un arreglo con al menos un elemento.', null, 400);

    if (!isOxigeno(oxigeno))
        return error(res, 'El oxigeno debe ser un arreglo con al menos un elemento.', null, 400);

    return null;
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
    Obtiene todas las lecturas fisico quimicas.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de lecturas
    - 500 si ocurre un error inesperado
    */
    try {
        const data = await FisicoQuimicaModel.findAll();
        return exito(res, 'Lecturas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener las lecturas.', err);
    }
}

export async function obtenerLecturaPorId(req, res) {
    /*
    Descripcion:
    Obtiene una lectura fisico quimica por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con la lectura encontrada
    - 404 si no existe
    - 500 si ocurre un error inesperado
    */
    try {
        const data = await FisicoQuimicaModel.findById(req.params.id);

        if (!data)
            return error(res, 'Lectura no encontrada.', null, 404);

        return exito(res, 'Lectura obtenida correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener la lectura.', err);
    }
}

export async function registrarLectura(req, res) {
    /*
    Descripcion:
    Registra una nueva lectura fisico quimica.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con la lectura creada
    - 400 si hay errores de validacion
    - 500 si ocurre un error inesperado
    */
    const { fincaId, estanqueId, fecha, ph, salinidad, temperatura, oxigeno } = req.body;

    const err = validarCuerpo({ fincaId, estanqueId, fecha, ph, salinidad, temperatura, oxigeno }, res);
    if (err) return err;

    try {
        const dto  = new fisicoQuimicaDto({ fincaId, estanqueId, fecha, ph, salinidad, temperatura, oxigeno });
        const data = await FisicoQuimicaModel.create(dto);
        return exito(res, 'Lectura registrada correctamente.', data, 201);
    } catch (err) {
        return error(res, 'Error al registrar la lectura.', err);
    }
}

export async function desactivarLectura(req, res) {
    /*
    Descripcion:
    Realiza el borrado logico de una lectura
    fisico quimica por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con la lectura desactivada
    - 404 si no existe
    - 500 si ocurre un error inesperado
    */
    try {
        const data = await FisicoQuimicaModel.remove(req.params.id);

        if (!data)
            return error(res, 'Lectura no encontrada.', null, 404);

        return exito(res, 'Estado actualizado correctamente.', data);
    } catch (err) {
        return error(res, 'Error al actualizar el estado.', err);
    }
}