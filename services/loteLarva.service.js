/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarva.service.js
Autor: Joan
Fecha: 04/07/2026
Modulo: lotelarva
Descripcion:
Funciones de validacion y utilidades para el modulo de loteLarva.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
 
import { EstadoLote } from "../dtos/loteLarva.dto.js";

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
 
export function normalizarEstadoLote(estado) {
    /*
    Descripcion:
    Busca el valor exacto del ENUM estado_lote (respetando la
    capitalizacion real de la DB) sin importar mayusculas/minusculas.
    */
    if (isEmpty(estado)) return null;
    const valor = String(estado).trim().toLowerCase();
    const opciones = Object.values(EstadoLote);
    return opciones.find((op) => op.toLowerCase() === valor) || null;
}
 
export function isEstadoLoteValido(estado) {
    return normalizarEstadoLote(estado) !== null;
}