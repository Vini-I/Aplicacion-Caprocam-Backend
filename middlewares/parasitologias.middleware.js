/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.middleware.js
Autor: Andres Gutierrez
Fecha: 18/07/2026
Modulo: Parasitologias
Descripcion:
Middlewares de validacion del modulo de parasitologias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
    error
} from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const camposRequeridos = [
    "fincaId",
    "estanqueId",
    "fechaReporte",
    "parasito",
    "camaronesMuestreados",
    "camaronesInfectados"
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarGrupoDatos(
    req,
    res,
    next
) {
    /*
    Descripcion:
    Verifica que el JWT contenga un grupo de datos valido.
    */

    if (!req.user) {
        return error(
            res,
            "No fue posible obtener el usuario autenticado.",
            null,
            403
        );
    }

    const grupoDatos = Number(
        req.user.grupoDatos
    );

    if (Number.isNaN(grupoDatos)) {
        return error(
            res,
            "El usuario no tiene un grupo de datos valido.",
            null,
            403
        );
    }

    if (grupoDatos <= 0) {
        return error(
            res,
            "El usuario no tiene un grupo de datos valido.",
            null,
            403
        );
    }

    next();
}

export function validarBodyParasitologia(
    req,
    res,
    next
) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga los
    campos requeridos.
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

        if (campoVacio(req.body[campo])) {
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

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function campoVacio(valor) {
    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (typeof valor === "string") {
        if (valor.trim().length === 0) {
            return true;
        }
    }

    return false;
}