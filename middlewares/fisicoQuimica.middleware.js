/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.middleware.js
Autor: Brandon
Fecha: 03/07/2026
Modulo: Fisico Quimica
Descripcion:
Middleware de validacion de body para lecturas
fisico quimicas. Verifica que los campos obligatorios
esten presentes antes de llegar al controller.
//////////////////////////////////////////////////////////
*/

import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos en el body para una lectura.
*/

const camposRequeridos = [
    'fincaId',
    'estanqueId',
    'fecha',
    'ph',
    'salinidad',
    'temperatura',
    'oxigenoDisuelto',
];

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function estaVacio(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio, sin marcar
    como faltante un 0 valido (bug del !valor anterior).

    Parametros:
    - valor: Valor a revisar.

    Retorna:
    - true si esta vacio.
    - false si tiene contenido, incluyendo 0.
    */
    if (valor === undefined) return true;
    if (valor === null) return true;
    if (typeof valor === 'string' && valor.trim() === '') return true;
    return false;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarFisicoQuimica(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para una lectura
    fisico quimica.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacio.', null, 400);

    const faltantes = camposRequeridos.filter(campo => estaVacio(req.body[campo]));

    if (faltantes.length > 0)
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );

    const fechaIngresada = new Date(req.body.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaIngresada > hoy)
        return error(res, 'La fecha no puede ser futura.', null, 400);

    next();
}