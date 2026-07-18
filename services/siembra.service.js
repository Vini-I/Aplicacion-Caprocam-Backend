/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.service.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Funciones de validacion y utilidades para el modulo de siembra.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { EstadoPrecria } from "../dtos/siembra.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.
    */
    if (valor === undefined || valor === null) return true;
    if (typeof valor === "string") {
        if (valor.trim().length === 0) return true;
    }
    return false;
}

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Valida que la fecha tenga un formato valido.
    */
    if (isEmpty(fecha)) return false;
    const date = new Date(fecha);
    return !Number.isNaN(date.getTime());
}

export function isEnteroPositivo(valor) {
    /*
    Descripcion:
    Valida que el valor sea un numero entero mayor que cero.
    */
    const numero = Number(valor);
    return !Number.isNaN(numero) && Number.isInteger(numero) && numero > 0;
}

export function isEstadoValido(estado) {
    /*
    Descripcion:
    Valida que el estado coincida con las opciones permitidas.
    */
    if (isEmpty(estado)) return false;
    const estados = Object.values(EstadoPrecria);
    return estados.includes(estado.toUpperCase().trim());
}

export function compararFechas(fecha1, fecha2) {
    /*
    Descripcion:
    Compara dos fechas. Retorna true si fecha2 >= fecha1.
    */
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return d2.getTime() >= d1.getTime();
}