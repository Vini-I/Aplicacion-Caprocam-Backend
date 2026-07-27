/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.service.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Compradores
Descripcion:
Reglas de negocio y funciones de validacion para compradores.
//////////////////////////////////////////////////////////
*/

const phoneRegex = /^\d{8}$/;

export function isPhone(phone) {
    /*
    Descripcion:
    Valida si el valor ingresado es un numero telefonico de 8 digitos.
    */
    if (phone === undefined || phone === null) return false;
    return phoneRegex.test(String(phone).trim());
}

export function isEmpty(string) {
    /*
    Descripcion:
    Verifica si una cadena de texto esta vacia.
    */
    return !string || String(string).trim().length === 0;
}