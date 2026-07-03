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

export function isEmpty(string) {
    return !string || string.trim().length === 0;
}

export function isNumericNegative(value) {
    return value !== undefined && Number(value) < 0;
}

export function isPrecioInvalido(value) {
    return value !== undefined && Number(value) <= 0;
}