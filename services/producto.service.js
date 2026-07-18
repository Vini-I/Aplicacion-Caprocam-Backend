/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.service.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Productos
Descripcion:
Define las reglas de negocio y utilidades de validacion de productos.
//////////////////////////////////////////////////////////
*/

/**
 * Verifica si un campo de texto está vacío o compuesto solo por espacios.
 */
export function isEmpty(string) {
    return !string || string.trim().length === 0;
}

/**
 * Valida si un valor numérico es negativo.
 */
export function isNumericNegative(value) {
    return value !== undefined && Number(value) < 0;
}

/**
 * Valida si un precio unitario es menor o igual a cero.
 */
export function isPrecioInvalido(value) {
    return value !== undefined && Number(value) <= 0;
}