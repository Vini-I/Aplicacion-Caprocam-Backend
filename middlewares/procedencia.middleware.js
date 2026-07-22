/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.middleware.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Procedencia
Descripcion:
Middleware de validacion de body para procedencia.
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";
import { isEmpty } from "../services/procedencia.service.js";

export function validarBodyProcedencia(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }
    if (isEmpty(req.body.nombre)) {
        return error(res, "El campo 'nombre' es requerido.", null, 400);
    }
    next();
}