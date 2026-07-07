/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.middleware.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Middleware de validacion de body para inventario.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const camposRequeridos = [
    'nombre', 'categoria', 'cantidad', 'unidad', 'stockMinimo',
    'proveedor', 'precioUnidad',
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyInventario(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga los campos requeridos.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si es correcto, o 400 si faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, 'El body no puede estar vacío.', null, 400);
    }

    const faltantes = [];
    for (let i = 0; i < camposRequeridos.length; i++) {
        const campo = camposRequeridos[i];
        const valor = req.body[campo];
        if (valor === undefined || valor === null || valor === '') {
            faltantes.push(campo);
        }
    }

    if (faltantes.length > 0) {
        const lista = faltantes.join(', ');
        return error(res, `Faltan campos requeridos: ${lista}.`, null, 400);
    }

    next();
}