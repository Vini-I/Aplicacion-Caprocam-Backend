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
    return phoneRegex.test(phone.trim());
}

export function isEmpty(string) {
    return !string || string.trim().length === 0;
}