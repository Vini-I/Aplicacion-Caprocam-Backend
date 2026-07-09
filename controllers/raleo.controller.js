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

import { RaleoDTO, MetodoRaleo } from "../dtos/raleo.dto.js";

// Servicios
import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isMetodoRaleo,
    isIdValido
} from "../services/raleo.service.js";

// Modelos
import * as RaleoModel from "../models/raleo.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

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

    if (!isEmpty(body.grupoDatos)) {
            if (!isNumeroMayorCero(body.grupoDatos)) {
                errores.push("El campo grupoDatos debe ser numerico y mayor que cero.");
            }
        }

    if (isEmpty(body.idFinca)) {
        errores.push("El campo idFinca es requerido.");
    }

    if (isEmpty(body.idEstanque)) {
        errores.push("El campo idEstanque es requerido.");
    }

    if (isEmpty(body.idColaborador)) {
        errores.push("El campo idColaborador es requerido.");
    }

    if (isEmpty(body.fecha)) {
        errores.push("El campo fecha es requerido.");
    }

    if (isEmpty(body.porcentaje)) {
        errores.push("El campo porcentaje es requerido.");
    }

    if (isEmpty(body.pesoEstimado)) {
        errores.push("El campo pesoEstimado es requerido.");
    }

    if (isEmpty(body.biomasaEstimado)) {
        errores.push("El campo biomasaEstimado es requerido.");
    }

    if (isEmpty(body.objetivo)) {
        errores.push("El campo objetivo es requerido.");
    }

    if (isEmpty(body.metodo)) {
        errores.push("El campo metodo es requerido.");
    }

    if (!isNumeroMayorCero(body.idFinca)) {
        errores.push("El campo idFinca debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.idEstanque)) {
        errores.push("El campo idEstanque debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.idColaborador)) {
        errores.push("El campo idColaborador debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.porcentaje)) {
        errores.push("El campo porcentaje debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.pesoEstimado)) {
        errores.push("El campo pesoEstimado debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.biomasaEstimado)) {
        errores.push("El campo biomasaEstimado debe ser numerico y mayor que cero.");
    }

    if (!isMetodoRaleo(body.metodo)) {
        errores.push(
            "Metodo invalido. Opciones: " + Object.values(MetodoRaleo).join(", ")
        );
    }

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
    const filtros = {
        idFinca: req.query.idFinca
    };

    const data = await RaleoModel.findAll(filtros);

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
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const raleo = await RaleoModel.findById(req.params.id);

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
    const err = validarCuerpo(req.body, res);

    if (err) {
        return err;
    }
    const dto = new RaleoDTO(req.body);

    const existente = await RaleoModel.findByEstanqueYFecha(
        dto.grupoDatos,
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
    
    const nuevo = await RaleoModel.create(dto);

    return exito(res, "Raleo creado correctamente.", nuevo, 201);
    } catch (err) {
        console.error("=== ERROR CREATE RALEO ===");
    console.error(err);
    console.error("==========================");

    return error(res, "Error al crear el raleo.", err, 500);
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
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const eliminado = await RaleoModel.remove(req.params.id);

    if (!eliminado) {
        return error(res, "Raleo no encontrado.", null, 404);
    }

    return exito(res, "Raleo eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el raleo.", err, 500);
    }
}