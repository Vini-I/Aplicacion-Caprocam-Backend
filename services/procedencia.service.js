/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.service.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Procedencia
Descripcion:
Funciones de validacion y utilidades para procedencia.
//////////////////////////////////////////////////////////
*/

export function isEmpty(valor) {
    if (valor === undefined || valor === null) return true;
    if (typeof valor === "string" && valor.trim().length === 0) return true;
    return false;
}