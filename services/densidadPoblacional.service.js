/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.service.js
Autor: Eduard Salas
Fecha: 29/06/2026
Modulo: Densidad Poblacional
Descripcion:
Define las reglas de negocio del modulo de
Densidad Poblacional.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Expresiones regulares utilizadas para validar
campos numericos.
*/

const decimalRegex = /^\d+(\.\d+)?$/;
const integerRegex = /^\d+$/;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
utilizadas por el controlador.
*/

/**
 * Verifica si un valor esta vacio.
 *
 * @param {*} value Valor a verificar.
 *
 * @returns {boolean}
 */
export function isEmpty(value) {
    if (value === null || value === undefined)
        return true;

    return String(value).trim().length === 0;
}

/**
 * Verifica si un valor es un numero entero.
 *
 * @param {*} value Valor a validar.
 *
 * @returns {boolean}
 */
export function isInteger(value) {
    return integerRegex.test(String(value).trim());
}

/**
 * Verifica si un valor es un numero decimal.
 *
 * @param {*} value Valor a validar.
 *
 * @returns {boolean}
 */
export function isDecimal(value) {
    return decimalRegex.test(String(value).trim());
}

/**
 * Verifica que un numero sea mayor que cero.
 *
 * @param {*} value Valor a validar.
 *
 * @returns {boolean}
 */
export function isPositive(value) {
    return Number(value) > 0;
}

/**
 * Verifica que un porcentaje este entre
 * 0 y 100.
 *
 * @param {*} value Valor a validar.
 *
 * @returns {boolean}
 */
export function isPercentage(value) {
    const porcentaje = Number(value);

    return porcentaje >= 0 &&
           porcentaje <= 100;
}

/**
 * Verifica que una fecha sea valida.
 *
 * @param {*} value Fecha a validar.
 *
 * @returns {boolean}
 */
export function isDate(value) {
    return !Number.isNaN(Date.parse(value));
}

/**
 * Verifica que el texto no sobrepase
 * una longitud maxima.
 *
 * @param {string} value Texto.
 * @param {number} max   Longitud maxima.
 *
 * @returns {boolean}
 */
export function maxLength(value, max) {
    return String(value).trim().length <= max;
}