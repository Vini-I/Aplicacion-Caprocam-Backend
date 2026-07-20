/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: laboratorio.service.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Laboratorio
Descripcion:
Funciones de validacion y utilidades para laboratorio.
//////////////////////////////////////////////////////////
*/

export function isEmpty(valor) {
    if (valor === undefined || valor === null) return true;
    if (typeof valor === "string" && valor.trim().length === 0) return true;
    return false;
}