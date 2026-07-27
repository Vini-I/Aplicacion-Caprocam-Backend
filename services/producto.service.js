/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.service.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Productos
Descripcion:
Reglas de negocio y utilidades de validacion de productos.
//////////////////////////////////////////////////////////
*/

/**
 * Descripcion:
 * Verifica si un texto esta vacio o solo contiene espacios.
 *
 * Parametros:
 * - string: Texto a evaluar.
 *
 * Retorna:
 * - Boolean indicando si esta vacio.
 */
export function isEmpty(string) {
    return !string || string.trim().length === 0;
}

/**
 * Descripcion:
 * Verifica si un valor es un numero negativo.
 *
 * Parametros:
 * - value: Valor numerico a evaluar.
 *
 * Retorna:
 * - Boolean indicando si es negativo.
 */
export function isNumericNegative(value) {
    return value !== undefined && Number(value) < 0;
}

/**
 * Descripcion:
 * Verifica si el precio unitario es menor o igual a cero.
 *
 * Parametros:
 * - value: Precio a evaluar.
 *
 * Retorna:
 * - Boolean indicando si es invalido.
 */
export function isPrecioInvalido(value) {
    return value !== undefined && Number(value) <= 0;
}