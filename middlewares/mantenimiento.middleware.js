/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.middleware.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
Descripcion:
Middleware de validacion de body para mantenimientos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos en el body para mantenimientos.
creadoPor no esta aqui porque viene de sesion, no del form.
*/

const camposRequeridos = ['titulo', 'equipo', 'tarea', 'descripcion'];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyMantenimiento(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const faltantes = camposRequeridos.filter(campo => !req.body[campo]);

    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);

    next();
}