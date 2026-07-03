/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.controller.js
Autor: Gerald Alfaro
Fecha: 03/07/2026
Modulo: Estanques
Descripcion:
Recibe las peticiones HTTP, delega al modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

import { EstanqueDTO, EstadoEstanque } from "../dtos/estanques.dto.js";

import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isNumeroOpcionalMayorIgualCero,
    isEstadoEstanque,
    isIdValido
} from "../services/estanques.service.js";

import * as EstanqueModel from "../models/estanques.model.js";

import { exito, error } from "../common/respuestaJson.js";

function validarCuerpo(body, res) {
    const errores = [];

    if (isEmpty(body.idFinca)) {
        errores.push("El campo idFinca es requerido.");
    }

    if (isEmpty(body.codigo)) {
        errores.push("El campo codigo es requerido.");
    }

    if (isEmpty(body.tipoEstanque)) {
        errores.push("El campo tipoEstanque es requerido.");
    }

    if (isEmpty(body.estado)) {
        errores.push("El campo estado es requerido.");
    }

    if (isEmpty(body.largo)) {
        errores.push("El campo largo es requerido.");
    }

    if (isEmpty(body.ancho)) {
        errores.push("El campo ancho es requerido.");
    }

    if (isEmpty(body.profundidad)) {
        errores.push("El campo profundidad es requerido.");
    }

    if (!isNumeroMayorCero(body.idFinca)) {
        errores.push("El campo idFinca debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.largo)) {
        errores.push("El campo largo debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.ancho)) {
        errores.push("El campo ancho debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.profundidad)) {
        errores.push("El campo profundidad debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.grupoDatos)) {
        if (!isNumeroMayorCero(body.grupoDatos)) {
            errores.push("El campo grupoDatos debe ser numerico y mayor que cero.");
        }
    }

    if (!isEmpty(body.densidadSiembra)) {
        if (!isNumeroMayorIgualCero(body.densidadSiembra)) {
            errores.push("El campo densidadSiembra debe ser numerico y mayor o igual que cero.");
        }
    }

    if (!isNumeroOpcionalMayorIgualCero(body.numeroAireadores)) {
        errores.push("El campo numeroAireadores debe ser numerico y mayor o igual que cero.");
    }

    if (!isEstadoEstanque(body.estado)) {
        errores.push(
            "Estado invalido. Opciones: " + Object.values(EstadoEstanque).join(", ")
        );
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

export async function getEstanques(req, res) {
    try {
        const filtros = {
            idFinca: req.query.idFinca,
            grupoDatos: req.query.grupoDatos
        };

        const data = await EstanqueModel.findAll(filtros);

        return exito(res, "Estanques obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los estanques.", err, 500);
    }
}

export async function getEstanqueById(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const estanque = await EstanqueModel.findById(req.params.id);

        if (!estanque) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Estanque obtenido correctamente.", estanque);
    } catch (err) {
        return error(res, "Error al obtener el estanque.", err, 500);
    }
}

export async function createEstanque(req, res) {
    try {
        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const existente = await EstanqueModel.findByCodigoAndFinca(
            req.body.codigo,
            req.body.idFinca,
            null
        );

        if (existente) {
            return error(
                res,
                "Ya existe un estanque con ese codigo en la finca.",
                null,
                409
            );
        }

        const dto = new EstanqueDTO(req.body);
        const nuevo = await EstanqueModel.create(dto);

        return exito(res, "Estanque creado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear el estanque.", err, 500);
    }
}

export async function updateEstanque(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const estanqueActual = await EstanqueModel.findById(req.params.id);

        if (!estanqueActual) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        const existente = await EstanqueModel.findByCodigoAndFinca(
            req.body.codigo,
            req.body.idFinca,
            req.params.id
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro estanque con ese codigo en la finca.",
                null,
                409
            );
        }

        const dto = new EstanqueDTO(req.body);
        const actualizado = await EstanqueModel.update(req.params.id, dto);

        return exito(res, "Estanque actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el estanque.", err, 500);
    }
}

export async function deleteEstanque(req, res) {
    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const eliminado = await EstanqueModel.remove(req.params.id);

        if (!eliminado) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Estanque eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el estanque.", err, 500);
    }
}