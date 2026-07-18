/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.middleware.js
Autor: Sebastian Villegas Barquero
Fecha: 02/07/2026
Modulo: Raleo
Descripcion:
Middleware de validacion de body para raleo.
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
Campos minimos requeridos en el body para raleo.
*/
const camposRequeridos = [
    "idFinca",
    "idEstanque",
    "idColaborador",
    "fecha",
    "porcentaje",
    "pesoEstimado",
    "biomasaEstimado",
    "objetivo",
    "metodo"
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de raleo.
*/

export function validarBodyRaleo(req, res, next) {
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