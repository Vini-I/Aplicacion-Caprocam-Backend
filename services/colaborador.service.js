/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.service.js
Autor: Marco Vásquez
Fecha: 08/08/2026
Modulo: Colaboradores
Descripcion:
Define las reglas de negocio, validaciones y hasheo
de PINs para el modulo de colaboradores (Bcrypt costo 12).
//////////////////////////////////////////////////////////
*/

import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = 12;

const emailRegex  = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const phoneRegex  = /^\d{8}$/;
const cedulaRegex = /^\d{9,12}$/;
const pinRegex    = /^\d{4}$/;

export function isEmail(email) {
    return emailRegex.test(String(email ?? '').trim());
}

export function isPhone(phone) {
    return phoneRegex.test(String(phone ?? '').trim());
}

export function isCedula(cedula) {
    return cedulaRegex.test(String(cedula ?? '').trim());
}

export function isPin(pin) {
    return pinRegex.test(String(pin ?? '').trim());
}

export async function hashPin(pin) {
    /*
    Descripcion:
    Genera un hash bcrypt costo 12 a partir de un PIN de 4 digitos.

    Parametros:
    - pin: String o numero con el PIN a cifrar.

    Retorna:
    - El hash bcrypt generado con costo 12.
    */
    return await bcrypt.hash(String(pin), BCRYPT_SALT_ROUNDS);
}

export async function isPinValido(pin, hash) {
    return await bcrypt.compare(String(pin), hash);
}

export function isEmpty(string) {
    return String(string ?? '').trim().length === 0;
}