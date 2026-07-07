/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.middleware.js
Autor: Eduard Salas
Fecha: 29/06/2026
Modulo: Densidad Poblacional
Descripcion:
Middleware de validacion del body para el modulo de
Densidad Poblacional.
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

Campos minimos requeridos en el body para registrar
una densidad poblacional.
*/

const camposRequeridos = [
    'finca',
    'estanque',
    'fecha',
    'cantidadSiembra',
    'areaEstanque',
    'metodoConteo',
    'numeroCamarones',
    'tirosAtarraya',
    'areaAtarraya',
    'promedioPorTiro',
    'sobrevivencia',
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion del body para
el modulo de Densidad Poblacional.
*/

/**
 * Descripcion:
 * Verifica que el body no este vacio y contenga
 * todos los campos requeridos.
 *
 * Parametros:
 * - req: Objeto request de Express.
 * - res: Objeto response de Express.
 * - next: Funcion para continuar con el flujo.
 *
 * Retorna:
 * - next() si el body es valido.
 * - 400 si el body esta vacio.
 * - 400 si faltan campos requeridos.
 */
export function validarBodyDensidadPoblacional(req, res, next) {

    if (!req.body || Object.keys(req.body).length === 0) {
        return error(
            res,
            'El body no puede estar vacío.',
            null,
            400
        );
    }

    const faltantes = camposRequeridos.filter(
        campo =>
            req.body[campo] === undefined ||
            req.body[campo] === null ||
            req.body[campo] === ''
    );

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