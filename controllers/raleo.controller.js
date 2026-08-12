/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.controller.js
Autor: Sebastian Villegas Barquero
Fecha: 03/07/2026
Modulo: Raleo
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

import { RaleoDTO } from "../dtos/raleo.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isIdValido,
    validarRetiroBiomasa,
    validarBiomasaRestante,
    validarPorcentajeRaleo,
    validarFechaNoFutura
} from "../services/raleo.service.js";

// Modelos
import * as RaleoModel from "../models/raleo.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js"

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

    if (isEmpty(body.idFinca)) {errores.push("El campo idFinca es requerido.");}
    if (isEmpty(body.idEstanque)) { errores.push("El campo idEstanque es requerido.");}
    if (isEmpty(body.idSiembra)) {errores.push("El campo idSiembra es requerido.");}
    if (isEmpty(body.fecha)) {errores.push("El campo fecha es requerido.");}
    if (isEmpty(body.porcentaje)) {errores.push("El campo porcentaje es requerido.");}
    if (isEmpty(body.kgRetirados)) {errores.push("El campo kgRetirados es requerido.");}
    if (isEmpty(body.biomasaRestante)) {errores.push("El campo biomasaRestante es requerido.");}    
    if (isEmpty(body.biomasaEstimada)) {errores.push("El campo biomasaEstimada es requerido.");}

    if (!isNumeroMayorCero(body.idFinca)) {errores.push("El campo idFinca debe ser numerico y mayor que cero.");}
    if (!isNumeroMayorCero(body.idEstanque)) {errores.push("El campo idEstanque debe ser numerico y mayor que cero.");}
    if (!isNumeroMayorCero(body.idSiembra)) {errores.push("El campo idSiembra debe ser numerico y mayor que cero.");}    
    if (!isNumeroMayorCero(body.porcentaje)) {errores.push("El campo porcentaje debe ser numerico y mayor que cero.");}
    if (!isNumeroMayorCero(body.kgRetirados)) {errores.push("El campo kgRetirados debe ser numerico y mayor que cero.");}
    if (!isNumeroMayorCero(body.biomasaEstimada)) {errores.push("El campo biomasaEstimada debe ser numerico y mayor que cero.");}

    //Validaciones de lógica de negocio
    if (!validarFechaNoFutura(body.fecha)) {errores.push("La fecha del raleo no puede ser futura y debe ser válida.");}
    if (!validarRetiroBiomasa(body.biomasaEstimada, body.kgRetirados)) {errores.push("Los kg retirados no pueden superar la biomasa estimada.");}
    if (!validarBiomasaRestante(body.biomasaEstimada, body.kgRetirados, body.biomasaRestante)) {errores.push("Calculo recibido de BiomasaRestante incorrecto / o no debe ser negativo");}
    if (!validarPorcentajeRaleo(body.biomasaEstimada, body.kgRetirados, body.porcentaje)) {errores.push("Calculo recibido de Porcentaje incorrecto")}

    if (errores.length > 0) {
    return error(res, "Datos invalidos para el raleo.", errores, 422);
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
ruta del modulo de raleo.
*/

export async function getRaleo(req, res) {
    /*
    Descripcion:
    Obtiene todos los raleos.
    Permite filtrar por idFinca con query params.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de raleos
    */
   try {
    const { grupoDatos } = obtenerContextoPeticion(req);
    const filtros = {
        idFinca: req.query.idFinca
    };

    const data = await RaleoModel.findAll(grupoDatos);

    return exito(res, "Raleos obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los raleos.", err, 500);
    }
}

export async function getRaleoById(req, res) {
    /*
    Descripcion:
    Obtiene un raleo por su ID desde MySQL.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el raleo encontrado
    - 404 si no existe
    */
   try {
    const { grupoDatos } = obtenerContextoPeticion(req);
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const raleo = await RaleoModel.findById(req.params.id, grupoDatos);

    if (!raleo) {
        return error(res, "Raleo no encontrado.", null, 404);
    }

    return exito(res, "Raleo obtenido correctamente.", raleo);
    } catch (err) {
        return error(res, "Error al obtener el raleo.", err, 500);
    }
}

export async function createRaleo(req, res) {
    /*
    Descripcion:
    Crea un nuevo raleo en la base de datos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 201 con el raleo creado
    - 400/422 si hay errores de validacion
    */
   try {
    const {
        grupoDatos,
        creadoPorUsuarioId,
        creadoPorColaboradorId
    } = obtenerContextoPeticion(req);

    const err = validarCuerpo(req.body, res);

    if (err) {
        return err;
    }
    const dto = new RaleoDTO({
    ...req.body,
    creadoPorUsuarioId,
    creadoPorColaboradorId
    });

    const existente = await RaleoModel.findByEstanqueYFecha(
        grupoDatos,
        dto.idEstanque,
        dto.fecha
    );

    if (existente) {
        return error(
            res,
            "Ya existe un raleo de ese estanque con esa fecha.",
            null,
            409
        );
    }
    
    const nuevo = await RaleoModel.create(dto, grupoDatos);

    return exito(res, "Raleo creado correctamente.", nuevo, 201);
    } catch (err) {
        console.error("=== ERROR CREATE RALEO ===");
    console.error(err);
    console.error("==========================");

    return error(res, "Error al crear el raleo.", err, 500);
    }
}

export async function updateRaleo(req, res) {
    /*
    Descripcion:
    Actualiza un raleo existente.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el raleo actualizado
    - 400/422 si hay errores de validacion
    - 404 si no existe
    */
    try {
        const {
        grupoDatos,
        creadoPorUsuarioId,
        creadoPorColaboradorId
        } = obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const dto = new RaleoDTO({
        ...req.body,
        creadoPorUsuarioId,
        creadoPorColaboradorId
        });

        const actualizado = await RaleoModel.update(
            req.params.id,
            dto,
            grupoDatos,
        );

        if (!actualizado) {
            return error(res, "Raleo no encontrado.", null, 404);
        }

        return exito(res, "Raleo actualizado correctamente.", actualizado);
    } catch (err) {
        console.error("=== ERROR UPDATE RALEO ===");
        console.error(err);
        console.error("==========================");

        return error(res, "Error al actualizar el raleo.", err, 500);
    }
}

export async function deleteRaleo(req, res) {
    /*
    Descripcion:
    Elimina logicamente un raleo por su ID.
    No elimina fisicamente el registro de la base de datos.
    El model se encarga de actualizar activo, deleted_at y version.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el raleo eliminado
    - 404 si no existe
    */
   try {
    const { grupoDatos } = obtenerContextoPeticion(req);
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const eliminado = await RaleoModel.remove(req.params.id, grupoDatos);

    if (!eliminado) {
        return error(res, "Raleo no encontrado.", null, 404);
    }

    return exito(res, "Raleo eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el raleo.", err, 500);
    }
}