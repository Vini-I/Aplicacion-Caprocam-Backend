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

export function isCodigoLarvaValido(valor) {
    /*
    Descripcion:
    Valida el formato de codigo_lote y certificado_larva.
    Segun el criterio de negocio (documento de preguntas de siembra):
    unicamente letras y numeros, maximo 14 caracteres
    (ejemplo valido: "1823092503E").
    */
    if (isEmpty(valor)) return false;
    return /^[A-Za-z0-9]{1,14}$/.test(String(valor).trim());
}