/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.middleware.js
Autor: Jose Espinoza
Fecha: 20/07/2026
Modulo: Compradores
Descripcion:
Middleware de validación inicial de presencia del body para compradores (acepta cedula o contacto).
//////////////////////////////////////////////////////////
*/

import { error } from '../common/respuestaJson.js';

export function validarBodyComprador(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const { nombre, cedula, contacto } = req.body;
    const faltantes = [];

    if (!nombre) faltantes.push('nombre');
    if (!cedula && !contacto) faltantes.push('cedula o contacto');

    if (faltantes.length > 0) {
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);
    }

    next();
}