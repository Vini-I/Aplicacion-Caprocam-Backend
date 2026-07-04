/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.middleware.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Middleware de validacion de body para enfermedades.
Verifica que el body exista y contenga los campos minimos
requeridos antes de llegar al controller.
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

Campos minimos requeridos en el body para enfermedades.
*/

const camposRequeridos = [
    'finca',
    'estanque',
    'fechaReporte',
    'enfermedades',
    'severidad',
    'reporte',
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de enfermedades.
*/

export function validarBodyEnfermedad(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos.

    Parametros:
    - req:  Objeto request de Express.
    - res:  Objeto response de Express.
    - next: Funcion para pasar al siguiente middleware.

    Retorna:
    - next() si el body es valido.
    - 400 si el body esta vacio o faltan campos.
    */

    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, 'El body no puede estar vacio.', null, 400);
    }

    const faltantes = [];

    for (let i = 0; i < camposRequeridos.length; i++) {
        const campo = camposRequeridos[i];

        if (campoVacio(req.body[campo])) {
            faltantes.push(campo);
        }
    }

    if (faltantes.length > 0) {
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );
    }

    next();
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas del middleware.
*/

function campoVacio(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.

    Parametros:
    - valor: Valor a revisar.

    Retorna:
    - true si esta vacio.
    - false si tiene contenido.
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (Array.isArray(valor)) {
        if (valor.length === 0) {
            return true;
        }

        return false;
    }

    if (String(valor).trim().length === 0) {
        return true;
    }

    return false;
}