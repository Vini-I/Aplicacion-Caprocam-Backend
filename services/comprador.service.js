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

/**
 * Descripcion:
 * Valida si el valor ingresado es un numero telefonico de 8 digitos.
 *
 * Parametros:
 * - phone: Cadena o numero a evaluar.
 *
 * Retorna:
 * - Boolean indicando si es valido o no.
 */
export function isPhone(phone) {
    if (phone === undefined || phone === null) return false;
    return phoneRegex.test(String(phone).trim());
}

/**
 * Descripcion:
 * Verifica si una cadena de texto esta vacia.
 *
 * Parametros:
 * - string: Texto a evaluar.
 *
 * Retorna:
 * - Boolean indicando si esta vacia.
 */
export function isEmpty(string) {
    return !string || String(string).trim().length === 0;
}