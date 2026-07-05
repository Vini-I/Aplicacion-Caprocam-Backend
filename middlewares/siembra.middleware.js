/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.middleware.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Middleware de validacion de body para el modulo de siembra.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyLote(req, res, next) {
    /*
    Descripcion:
    Valida la presencia del body y campos basicos para crear/editar Lotes.
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }
    next();
}

export function validarBodyPrecria(req, res, next) {
    /*
    Descripcion:
    Valida la presencia del body y campos basicos para crear/editar Pre-crias.
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }
    next();
}