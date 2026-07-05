/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantFinca.service.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Define las reglas de negocio de finca (funciones helper
de validacion para el middleware).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion.
*/

export function isEmpty(value) {
    /*
    Descripcion:
    Verifica si un valor es nulo, indefinido o una cadena vacía.

    Parametros:
    - value: Valor a verificar.

    Retorna:
    - true si el valor es nulo, indefinido o una cadena vacía;
    */
    return value === undefined || value === null || String(value).trim() === '';
}

export function isNumeroPositivo(value) {
    /*
    Descripcion:
    Verifica si un valor es un número positivo.

    Parametros:
    - value: Valor a verificar.

    Retorna:
    - true si el valor es un número positivo; false en caso contrario.
    */
    const num = Number(value);
    return !isNaN(num) && num > 0;
}