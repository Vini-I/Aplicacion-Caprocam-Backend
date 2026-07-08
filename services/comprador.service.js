/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.service.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Compradores
Descripcion:
Validaciones de negocio especificas para el modulo de compradores.
//////////////////////////////////////////////////////////
*/

const phoneRegex = /^\d{8}$/;

export function isPhone(phone) {
    if (phone === undefined || phone === null) return false;
    return phoneRegex.test(String(phone).trim());
}

export function isEmpty(string) {
    return !string || String(string).trim().length === 0;
}