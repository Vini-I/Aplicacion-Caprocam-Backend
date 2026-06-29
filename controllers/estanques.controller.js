/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.controller.js
Autor: Gerald Alfaro
Fecha: 29/06/2026
Modulo: Estanques
Descripcion:
Recibe las peticiones HTTP, delega al modelo,
y devuelve la respuesta al cliente.
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
    isNumeroMayorIgualCero,
    isNumeroOpcionalMayorIgualCero,
    isEstadoEstanque,
    isIdValido
} from "../services/estanques.service.js";

// Modelos
import * as EstanqueModel from "../models/estanques.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Las funciones createEstanque() y updateEstanque()
dependen de esta funcion para trabajar.
*/

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - body: Campos del body
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien
    */
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

    if (isEmpty(body.fechaSiembra)) {
        errores.push("El campo fechaSiembra es requerido.");
    }

    if (isEmpty(body.densidadSiembra)) {
        errores.push("El campo densidadSiembra es requerido.");
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

    if (!isNumeroMayorIgualCero(body.densidadSiembra)) {
        errores.push("El campo densidadSiembra debe ser numerico y mayor o igual que cero.");
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
    /*
    Descripcion:
    Valida que el parametro id sea numerico y mayor a cero.

    Parametros:
    - id: ID recibido por params
    - res: Objeto response de Express

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien
    */
    if (!isIdValido(id)) {
        return error(res, "El id debe ser numerico y mayor que cero.", null, 400);
    }

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de estanques.
*/

export function getEstanques(req, res) {
    /*
    Descripcion:
    Obtiene todos los estanques.
    Permite filtrar por idFinca con query params.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de estanques
    */
    const filtros = {
        idFinca: req.query.idFinca
    };

    const data = EstanqueModel.findAll(filtros);

    return exito(res, "Estanques obtenidos correctamente.", data);
}

export function getEstanqueById(req, res) {
    /*
    Descripcion:
    Obtiene un estanque por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el estanque encontrado
    - 404 si no existe
    */
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const estanque = EstanqueModel.findById(req.params.id);

    if (!estanque) {
        return error(res, "Estanque no encontrado.", null, 404);
    }

    return exito(res, "Estanque obtenido correctamente.", estanque);
}

export function createEstanque(req, res) {
    /*
    Descripcion:
    Crea un nuevo estanque.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 201 con el estanque creado
    - 400/422 si hay errores de validacion
    - 409 si el codigo ya existe en la finca
    */
    const err = validarCuerpo(req.body, res);

    if (err) {
        return err;
    }

    const existente = EstanqueModel.findByCodigoAndFinca(
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
    const nuevo = EstanqueModel.create(dto);

    return exito(res, "Estanque creado correctamente.", nuevo, 201);
}

export function updateEstanque(req, res) {
    /*
    Descripcion:
    Actualiza un estanque existente por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el estanque actualizado
    - 400/422 si hay errores de validacion
    - 404 si no existe
    - 409 si el codigo ya existe en la finca
    */
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const err = validarCuerpo(req.body, res);

    if (err) {
        return err;
    }

    const estanqueActual = EstanqueModel.findById(req.params.id);

    if (!estanqueActual) {
        return error(res, "Estanque no encontrado.", null, 404);
    }

    const existente = EstanqueModel.findByCodigoAndFinca(
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
    const actualizado = EstanqueModel.update(req.params.id, dto);

    return exito(res, "Estanque actualizado correctamente.", actualizado);
}

export function deleteEstanque(req, res) {
    /*
    Descripcion:
    Elimina un estanque por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el estanque eliminado
    - 404 si no existe
    */
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const eliminado = EstanqueModel.remove(req.params.id);

    if (!eliminado) {
        return error(res, "Estanque no encontrado.", null, 404);
    }

    return exito(res, "Estanque eliminado correctamente.", eliminado);
}