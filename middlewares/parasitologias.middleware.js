/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.middleware.js
Autor: Andres Gutierrez
Fecha: 30/07/2026
Modulo: Parasitologias
Descripcion:
Valida el contexto autenticado y el body del modulo de
parasitologias.
//////////////////////////////////////////////////////////
*/

import {
    error
} from "../common/respuestaJson.js";

const camposRequeridos = [
    "fincaId",
    "estanqueId",
    "fechaReporte",
    "parasito",
    "gradoInfeccion"
];

export function validarGrupoDatos(
    req,
    res,
    next
) {
    const grupoDatos =
        req.colaborador?.grupoDatos ??
        req.user?.grupoDatos;

    const grupoNumero =
        Number(grupoDatos);

    if (
        Number.isInteger(grupoNumero) === false ||
        grupoNumero <= 0
    ) {
        return error(
            res,
            "El usuario no tiene un grupo de datos valido.",
            null,
            403
        );
    }

    return next();
}

export function validarBodyParasitologia(
    req,
    res,
    next
) {
    if (
        req.body === undefined ||
        req.body === null ||
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
        const campo =
            camposRequeridos[i];

        if (
            campoVacio(
                req.body[campo]
            )
        ) {
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

    return next();
}

function campoVacio(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return true;
    }

    if (
        typeof valor === "string" &&
        valor.trim().length === 0
    ) {
        return true;
    }

    return false;
}