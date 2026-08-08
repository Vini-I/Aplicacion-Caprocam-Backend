/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.middleware.js
Autor: Marco Vásquez
Fecha: 08/08/2026
Modulo: Colaboradores
Descripcion:
Middleware de validacion de body para colaboradores (sin roles).
//////////////////////////////////////////////////////////
*/

import { error } from '../common/respuestaJson.js';

const camposPost = ['nombre', 'apellidos', 'nombreUsuario', 'pinHash'];
const camposPut  = ['nombre', 'apellidos'];

export function validarBodyColaboradorPost(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const faltantes = camposPost.filter(campo => !req.body[campo]);

    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);

    next();
}

export function validarBodyColaboradorPut(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const faltantes = camposPut.filter(campo => !req.body[campo]);

    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);

    next();
}