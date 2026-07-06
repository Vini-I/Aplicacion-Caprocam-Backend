/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.service.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Ventas
Descripcion:
Define las reglas de negocio de ventas (funciones helper
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
    Valida si un valor es nulo, indefinido o una cadena vacia.

    Parametros:
    - value: Valor a validar

    Retorna:
    - true si el valor es nulo, indefinido o una cadena vacia
    - false en caso contrario
    */
    return value === undefined || value === null || String(value).trim() === '';
}

export function isNumeroPositivo(value) {
    /*
    Descripcion:
    Valida si un valor es un numero positivo (mayor a cero).

    Parametros:
    - value: Valor a validar

    Retorna:
    - true si el valor es un numero positivo
    - false en caso contrario
    */
    const num = Number(value);
    return !isNaN(num) && num > 0;
}


export function isValidDate(dateString) {
    /*
    Descripcion:
    Valida si un valor es una fecha valida.

    Parametros:
    - dateString: Valor a validar

    Retorna:
    - true si el valor es una fecha valida
    - false en caso contrario
    */
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}