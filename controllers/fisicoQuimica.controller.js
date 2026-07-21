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

import { FisicoQuimicaDTO } from '../dtos/fisicoQuimica.dto.js';

// Servicios
import {
    isFechaValida,
    isIdValido,
    isPhValido,
    isSalinidadValida,
    isTemperaturaValida,
    isOxigeno,
    isListaMedicionesValida,
} from '../services/fisicoQuimica.service.js';

// Modelos
import * as FisicoQuimicaModel from '../models/fisicoQuimica.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo({
    fincaId,
    estanqueId,
    fecha,
    ph,
    salinidad,
    temperatura,
    oxigenoDisuelto,
}, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.
    Alineado con el modelo: ph, salinidad, temperatura y
    oxigenoDisuelto son ahora arreglos de mediciones
    ({ valor, etiqueta }), porque un mismo estanque/dia
    puede tener mas de una lectura del mismo tipo (ej.
    pH dia/noche, oxigeno hasta 5 veces). fincaId y
    estanqueId son numericos porque asi estan definidos
    en la base de datos (columnas INT).

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (!isIdValido(fincaId))
        return error(res, 'El fincaId no es valido.', null, 400);

    if (!isIdValido(estanqueId))
        return error(res, 'El estanqueId no es valido.', null, 400);

    if (!isFechaValida(fecha))
        return error(res, 'La fecha es obligatoria.', null, 400);

    if (!isPhValido(ph))
        return error(res, 'El ph debe ser un arreglo con al menos una medicion.', null, 400);

    if (!isSalinidadValida(salinidad))
        return error(res, 'La salinidad debe ser un arreglo con al menos una medicion.', null, 400);

    if (!isTemperaturaValida(temperatura))
        return error(res, 'La temperatura debe ser un arreglo con al menos una medicion.', null, 400);

    if (!isOxigeno(oxigenoDisuelto))
        return error(res, 'El oxigenoDisuelto debe ser un arreglo con al menos una medicion.', null, 400);

    if (!isListaMedicionesValida(ph))
        return error(res, 'Cada medicion de ph debe tener un valor numerico mayor a cero y una etiqueta.', null, 400);

    if (!isListaMedicionesValida(salinidad))
        return error(res, 'Cada medicion de salinidad debe tener un valor numerico mayor a cero y una etiqueta.', null, 400);

    if (!isListaMedicionesValida(temperatura))
        return error(res, 'Cada medicion de temperatura debe tener un valor numerico mayor a cero y una etiqueta.', null, 400);

    if (!isListaMedicionesValida(oxigenoDisuelto))
        return error(res, 'Cada medicion de oxigenoDisuelto debe tener un valor numerico mayor a cero y una etiqueta.', null, 400);

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerTodasLasLecturas(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;

        const data = await FisicoQuimicaModel.findAll(grupoDatos);
        return exito(res, 'Lecturas obtenidas correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener las lecturas.', err);
    }
}

export async function obtenerLecturaPorId(req, res) {
    try {
        const grupoDatos = req.user.grupoDatos;

        const data = await FisicoQuimicaModel.findById(req.params.id, grupoDatos);

        if (!data)
            return error(res, 'Lectura no encontrada.', null, 404);

        return exito(res, 'Lectura obtenida correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener la lectura.', err);
    }
}

export async function obtenerLecturaPorEstanqueYFecha(req, res) {
    /*
    Descripcion:
    Busca si ya existe una lectura fisico quimica de un
    estanque especifico en una fecha dada. Permite al
    frontend decidir entre "Guardar" (no existe todavia)
    y "Actualizar" (ya existe, precargar valores).

    Parametros esperados:
    - req.params.estanqueId: Identificador del estanque.
    - req.query.fecha: Fecha a consultar (YYYY-MM-DD).

    Retorna:
    - 200 con data: la lectura encontrada, o null si no existe.
    - 400 si el estanqueId o la fecha no son validos.
    */
    try {
        const { estanqueId } = req.params;
        const { fecha } = req.query;

        if (!isIdValido(estanqueId))
            return error(res, 'El estanqueId no es valido.', null, 400);

        if (!isFechaValida(fecha))
            return error(res, 'Debe indicar una fecha valida (YYYY-MM-DD) en el query string.', null, 400);

        const grupoDatos = req.user.grupoDatos;

        const data = await FisicoQuimicaModel.findByEstanqueYFecha(estanqueId, fecha, grupoDatos);

        return exito(res, 'Consulta realizada correctamente.', data);
    } catch (err) {
        return error(res, 'Error al consultar la lectura del estanque.', err);
    }
}

export async function registrarLectura(req, res) {
    const {
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigenoDisuelto,
    } = req.body;

    const err = validarCuerpo({
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigenoDisuelto,
    }, res);
    if (err) return err;

    try {
        const grupoDatos = req.user.grupoDatos;

        const dto = new FisicoQuimicaDTO({
            grupoDatos,
            fincaId,
            estanqueId,
            fecha,
            ph,
            salinidad,
            temperatura,
            oxigenoDisuelto,
        });
        const data = await FisicoQuimicaModel.create(dto);
        return exito(res, 'Lectura registrada correctamente.', data, 201);
    } catch (err) {
        return error(res, 'Error al registrar la lectura.', err);
    }
}

export async function actualizarLectura(req, res) {
    const {
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigenoDisuelto,
    } = req.body;

    const err = validarCuerpo({
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigenoDisuelto,
    }, res);
    if (err) return err;

    try {
        const grupoDatos = req.user.grupoDatos;

        const dto = new FisicoQuimicaDTO({
            grupoDatos,
            fincaId,
            estanqueId,
            fecha,
            ph,
            salinidad,
            temperatura,
            oxigenoDisuelto,
        });

        const data = await FisicoQuimicaModel.update(req.params.id, dto);

        if (!data)
            return error(res, 'Lectura no encontrada.', null, 404);

        return exito(res, 'Lectura actualizada correctamente.', data);
    } catch (err) {
        return error(res, 'Error al actualizar la lectura.', err);
    }
}