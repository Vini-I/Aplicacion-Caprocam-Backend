/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.service.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Pre-cria
Descripcion:
Funciones de validacion y utilidades para el modulo de pre-cria.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { EstadoPrecria } from "../dtos/preCria.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function isEmpty(valor) {
    if (valor === undefined || valor === null) return true;
    if (typeof valor === "string" && valor.trim().length === 0) return true;
    return false;
}
 
export function isFechaValida(fecha) {
    if (isEmpty(fecha)) return false;
    const date = new Date(fecha);
    return !Number.isNaN(date.getTime());
}
 
export function isEnteroPositivo(valor) {
    const numero = Number(valor);
    return !Number.isNaN(numero) && Number.isInteger(numero) && numero > 0;
}
 
export function normalizarEstado(estado) {
    if (isEmpty(estado)) return null;
    const valor = String(estado).trim().toLowerCase();
    const opciones = Object.values(EstadoPrecria);
    return opciones.find((op) => op.toLowerCase() === valor) || null;
}
 
export function isEstadoValido(estado) {
    return normalizarEstado(estado) !== null;
}
 
export function compararFechas(fecha1, fecha2) {
    // true si fecha2 >= fecha1
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return d2.getTime() >= d1.getTime();
}