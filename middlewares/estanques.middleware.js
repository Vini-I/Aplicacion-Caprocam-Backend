/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.middleware.js
Autor: Gerald Alfaro
Fecha: 29/06/2026
Modulo: Estanques
Descripcion:
Middleware de validacion de body para estanques.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos en el body para estanques.
*/

const camposRequeridos = [
    "idFinca",
    "codigo",
    "tipoEstanque",
    "estado",
    "largo",
    "ancho",
    "profundidad",
    "fechaSiembra",
    "densidadSiembra"
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de estanques.
*/

export function validarBodyEstanque(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = [];

    for (let i = 0; i < camposRequeridos.length; i++) {
        const campo = camposRequeridos[i];

        if (!req.body[campo]) {
            faltantes.push(campo);
        }
    }

    if (faltantes.length > 0) {
        return error(
            res,
            "Faltan campos requeridos: " + faltantes.join(", ") + ".",
            null,
            400
        );
    }

    next();
}