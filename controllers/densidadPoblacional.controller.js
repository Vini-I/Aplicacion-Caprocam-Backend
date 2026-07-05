/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.controller.js
Autor: Eduard Salas
Fecha: 29/06/2026
Modulo: Densidad Poblacional
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// DTO
import { DensidadPoblacionalDTO } from
    '../dtos/densidadPoblacional.dto.js';

// Servicios
import {
    isEmpty,
    isInteger,
    isDecimal,
    isPercentage,
    isDate,
    maxLength,
} from '../services/densidadPoblacional.service.js';

// Modelos
import * as DensidadModel from
    '../models/densidadPoblacional.model.js';

// Common
import { exito, error } from
    '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCION AUXILIAR
//////////////////////////////////////////////////////////
*/

/**
 * Valida el cuerpo de la peticion antes de crear
 * o actualizar un registro.
 */
function validarCuerpo(
    {
        finca,
        estanque,
        fecha,
        cantidadSiembra,
        areaEstanque,
        metodoConteo,
        numeroCamarones,
        tirosAtarraya,
        areaAtarraya,
        promedioPorTiro,
        sobrevivencia,
        notasConteo,
    },
    res
) {
    if (isEmpty(finca) || !isInteger(finca)) {
        return error(
            res,
            'Finca invalida.',
            null,
            422
        );
    }

    if (isEmpty(estanque) || !isInteger(estanque)) {
        return error(
            res,
            'Estanque invalido.',
            null,
            422
        );
    }

    if (!isDate(fecha)) {
        return error(
            res,
            'Fecha invalida.',
            null,
            422
        );
    }

    if (!isDecimal(cantidadSiembra)) {
        return error(
            res,
            'Cantidad de siembra invalida.',
            null,
            422
        );
    }

    if (!isDecimal(areaEstanque)) {
        return error(
            res,
            'Area de estanque invalida.',
            null,
            422
        );
    }

    if (isEmpty(metodoConteo)) {
        return error(
            res,
            'Metodo de conteo requerido.',
            null,
            422
        );
    }

    if (!isInteger(numeroCamarones)) {
        return error(
            res,
            'Numero de camarones invalido.',
            null,
            422
        );
    }

    if (!isInteger(tirosAtarraya)) {
        return error(
            res,
            'Tiros de atarraya invalidos.',
            null,
            422
        );
    }

    if (!isDecimal(areaAtarraya)) {
        return error(
            res,
            'Area de atarraya invalida.',
            null,
            422
        );
    }

    if (!isDecimal(promedioPorTiro)) {
        return error(
            res,
            'Promedio por tiro invalido.',
            null,
            422
        );
    }

    if (!isPercentage(sobrevivencia)) {
        return error(
            res,
            'Sobrevivencia invalida.',
            null,
            422
        );
    }

    if (
        notasConteo &&
        !maxLength(notasConteo, 255)
    ) {
        return error(
            res,
            'Notas muy largas (max 255).',
            null,
            422
        );
    }

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function getDensidades(req, res) {
    const data = DensidadModel.findAll();

    return exito(
        res,
        'Registros obtenidos correctamente.',
        data
    );
}

export function getDensidadById(req, res) {
    const data = DensidadModel.findById(req.params.id);

    if (!data) {
        return error(
            res,
            'Registro no encontrado.',
            null,
            404
        );
    }

    return exito(
        res,
        'Registro obtenido correctamente.',
        data
    );
}

export function createDensidad(req, res) {
    const body = req.body;

    const err = validarCuerpo(body, res);
    if (err) return err;

    const dto = new DensidadPoblacionalDTO({
        finca: body.finca,
        estanque: body.estanque,
        fecha: body.fecha,
        cantidadSiembra: body.cantidadSiembra,
        areaEstanque: body.areaEstanque,
        metodoConteo: body.metodoConteo,
        numeroCamarones: body.numeroCamarones,
        tirosAtarraya: body.tirosAtarraya,
        areaAtarraya: body.areaAtarraya,
        promedioPorTiro: body.promedioPorTiro,
        sobrevivencia: body.sobrevivencia,
        notasConteo: body.notasConteo,
    });

    const nuevo = DensidadModel.create(dto);

    return exito(
        res,
        'Registro creado correctamente.',
        nuevo,
        201
    );
}

export function updateDensidad(req, res) {
    const body = req.body;

    const err = validarCuerpo(body, res);
    if (err) return err;

    const dto = new DensidadPoblacionalDTO({
        finca: body.finca,
        estanque: body.estanque,
        fecha: body.fecha,
        cantidadSiembra: body.cantidadSiembra,
        areaEstanque: body.areaEstanque,
        metodoConteo: body.metodoConteo,
        numeroCamarones: body.numeroCamarones,
        tirosAtarraya: body.tirosAtarraya,
        areaAtarraya: body.areaAtarraya,
        promedioPorTiro: body.promedioPorTiro,
        sobrevivencia: body.sobrevivencia,
        notasConteo: body.notasConteo,
    });

    const actualizado = DensidadModel.update(
        req.params.id,
        dto
    );

    if (!actualizado) {
        return error(
            res,
            'Registro no encontrado.',
            null,
            404
        );
    }

    return exito(
        res,
        'Registro actualizado correctamente.',
        actualizado
    );
}

export function deleteDensidad(req, res) {
    const eliminado = DensidadModel.remove(req.params.id);

    if (!eliminado) {
        return error(
            res,
            'Registro no encontrado.',
            null,
            404
        );
    }

    return exito(
        res,
        'Registro eliminado correctamente.',
        eliminado
    );
}