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

export function isEmpty(string) {
    /*
    Descripcion:
    Verifica si un texto esta vacio o solo contiene espacios.
    */
    return !string || string.trim().length === 0;
}

export function isNumericNegative(value) {
    /*
    Descripcion:
    Verifica si un valor es un numero negativo.
    */
    return value !== undefined && Number(value) < 0;
}

export function isPrecioInvalido(value) {
    /*
    Descripcion:
    Verifica si el precio unitario es menor o igual a cero.
    */
    return value !== undefined && Number(value) <= 0;
}