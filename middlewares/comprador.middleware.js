/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.middleware.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Compradores
Descripcion:
Middleware de validacion inicial de presencia del body para compradores.
//////////////////////////////////////////////////////////
*/

import { error } from '../common/respuestaJson.js';

const camposRequeridos = ['nombre', 'contacto'];

export function validarBodyComprador(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const faltantes = camposRequeridos.filter(campo => !req.body[campo]);
    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);

    next();
}