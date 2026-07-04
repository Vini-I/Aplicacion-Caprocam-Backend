/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.service.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Crecimiento
Descripcion:
Define las validaciones de logica de negocio del modulo
de crecimiento. No orquesta, solo valida.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/
export function isEmpty(value) {
    /*
    Descripcion:
    Valida si un valor esta vacio.
    Parametros:
    - value: Valor a verificar.
    Retorna:
    - true si esta vacio, false si no.
    */
    return value === undefined || value === null || String(value).trim() === '';
}
export function isNumeroMayorIgualCero(value) {
    /*
    Descripcion:
    Valida si un valor es un numero mayor o igual a cero.
    Parametros:
    - value: Valor a verificar.
    Retorna:
    - true si es numero >= 0, false si no.
    */
    const num = Number(value);
    return !isNaN(num) && num >= 0;
}