/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.middleware.js
Autor: Gerald Alfaro
Fecha: 31/07/2026
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

import {
    error
} from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos en el body para estanques.
El grupoDatos no se recibe desde el frontend porque se
obtiene desde el JWT.

fechaMantenimiento y precria son opcionales porque la
tabla permite null y un valor por defecto.
*/

const camposRequeridos = [
    "idFinca",
    "codigo",
    "tipoEstanque",
    "estado",
    "largo",
    "ancho",
    "profundidad"
];

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function campoEstaVacio(valor) {
    /*
    Descripcion:
    Verifica si un campo requerido no fue enviado
    o contiene un texto vacio.

    Parametros:
    - valor: Valor recibido desde el body.

    Retorna:
    - true si el campo esta vacio.
    - false si contiene un valor.
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (typeof valor === "string") {
        if (valor.trim() === "") {
            return true;
        }
    }

    return false;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body.
*/

export function validarBodyEstanque(
    req,
    res,
    next
) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
    - next: Funcion para pasar al siguiente middleware.

    Retorna:
    - next() si el body es valido.
    - 400 si el body esta vacio o faltan campos.
    */

    if (
        !req.body ||
        Object.keys(req.body).length === 0
    ) {
        return error(
            res,
            "El body no puede estar vacio.",
            null,
            400
        );
    }

    const faltantes = [];

    for (
        let i = 0;
        i < camposRequeridos.length;
        i++
    ) {
        const campo = camposRequeridos[i];
        const valor = req.body[campo];

        if (campoEstaVacio(valor)) {
            faltantes.push(
                campo
            );
        }
    }

    if (faltantes.length > 0) {
        return error(
            res,
            "Faltan campos requeridos: " +
            faltantes.join(", ") +
            ".",
            null,
            400
        );
    }

    next();
}