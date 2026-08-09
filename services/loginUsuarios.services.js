/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.services.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 08/08/2026
Modulo: Login
Descripcion:
Define las reglas de negocio y validaciones del modulo
de login (sin roles). Maneja regex de contrasenas, bcrypt (costo 12)
y control de 5 intentos maximo de autenticacion.
//////////////////////////////////////////////////////////
*/

import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = 12;
const pinRegex = /^\d{4}$/;
const contrasenaRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

const MAX_INTENTOS_LOGIN = 5;
const TIEMPO_BLOQUEO_MS = 15 * 60 * 1000;

const intentosLogin = new Map();

export async function isContrasenaValida(contrasena, hash) {
    return await bcrypt.compare(contrasena, hash);
}

export async function hashContrasena(contrasena) {
    return await bcrypt.hash(contrasena, BCRYPT_SALT_ROUNDS);
}

export async function hashPin(pin) {
    return await bcrypt.hash(String(pin), BCRYPT_SALT_ROUNDS);
}

export async function isPinValido(pin, hash) {
    return await bcrypt.compare(String(pin), hash);
}

export function isPin(pin) {
    return pinRegex.test(String(pin ?? ""));
}

export function isContrasenaSegura(contrasena) {
    return contrasenaRegex.test(String(contrasena ?? ""));
}

export function estaBloqueado(identificador) {
    const clave = String(identificador ?? "").toLowerCase();
    const registro = intentosLogin.get(clave);

    if (!registro) return { bloqueado: false, tiempoRestanteMinutos: 0 };

    const ahora = Date.now();
    if (registro.bloqueadoHasta && ahora < registro.bloqueadoHasta) {
        const tiempoRestante = Math.ceil(
            (registro.bloqueadoHasta - ahora) / (60 * 1000)
        );
        return { bloqueado: true, tiempoRestanteMinutos: tiempoRestante };
    }

    if (registro.bloqueadoHasta && ahora >= registro.bloqueadoHasta) {
        intentosLogin.delete(clave);
        return { bloqueado: false, tiempoRestanteMinutos: 0 };
    }

    return { bloqueado: false, tiempoRestanteMinutos: 0 };
}

export function registrarIntentoFallido(identificador) {
    const clave = String(identificador ?? "").toLowerCase();
    const ahora = Date.now();
    let registro = intentosLogin.get(clave) || { intentos: 0, bloqueadoHasta: null };

    registro.intentos += 1;

    if (registro.intentos >= MAX_INTENTOS_LOGIN) {
        registro.bloqueadoHasta = ahora + TIEMPO_BLOQUEO_MS;
        intentosLogin.set(clave, registro);
        return { bloqueado: true, intentosRestantes: 0 };
    }

    intentosLogin.set(clave, registro);
    const intentosRestantes = MAX_INTENTOS_LOGIN - registro.intentos;
    return { bloqueado: false, intentosRestantes };
}

export function resetearIntentosLogin(identificador) {
    const clave = String(identificador ?? "").toLowerCase();
    intentosLogin.delete(clave);
}