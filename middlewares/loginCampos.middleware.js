/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.middleware.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 08/08/2026
Modulo: Login
Descripcion:
Middlewares de validacion de body para el modulo de login (sin roles).
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";

const camposLogin = [
    ["usuario", "correo", "email", "nombreUsuario"],
    ["contrasena"]
];

const camposRegistro = [
    ["nombre"],
    ["apellidos"],
    ["correo", "email"],
    ["usuario", "nombreUsuario"],
    ["contrasena"],
];

const camposRegistroOperario = [
    ["nombre"],
    ["apellidos"],
    ["usuario", "nombreUsuario"],
    ["pin"],
];

const camposVerificarPin = [["operarioId"], ["pin"]];

export function validarBodyLogin(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, "El body no puede estar vacio.", null, 400);

    const faltantes = obtenerCamposFaltantes(req.body, camposLogin);
    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(", ")}.`, null, 400);

    next();
}

export function validarBodyRegistro(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, "El body no puede estar vacio.", null, 400);

    const faltantes = obtenerCamposFaltantes(req.body, camposRegistro);
    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(", ")}.`, null, 400);

    next();
}

export function validarBodyRegistroOperario(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, "El body no puede estar vacio.", null, 400);

    const faltantes = obtenerCamposFaltantes(req.body, camposRegistroOperario);
    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(", ")}.`, null, 400);

    next();
}

export function validarBodyVerificarPin(req, res, next) {
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, "El body no puede estar vacio.", null, 400);

    const faltantes = obtenerCamposFaltantes(req.body, camposVerificarPin);
    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(", ")}.`, null, 400);

    next();
}

function obtenerCamposFaltantes(body, grupos) {
    const faltantes = [];
    for (let i = 0; i < grupos.length; i++) {
        const grupo = grupos[i];
        const tieneCampo = grupo.some((campo) => valorPresente(body[campo]));
        if (!tieneCampo) faltantes.push(grupo[0]);
    }
    return faltantes;
}

function valorPresente(valor) {
    if (valor === undefined || valor === null) return false;
    if (typeof valor === "string" && valor.trim().length === 0) return false;
    return true;
}