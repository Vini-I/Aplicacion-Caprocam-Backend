/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.service.js
Autor: Greivin Arguedas
Fecha: 28/06/2026
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

export function esEstanqueValido(estanque) {
    /*
    Descripcion:
    Verifica si un estanque existe (no es null ni undefined).

    Parametros:
    - estanque: Objeto del estanque a verificar.

    Retorna:
    - true si el estanque existe, false si no.
    */
    return estanque !== null && estanque !== undefined;
}

export function esPesoValido(peso) {
    /*
    Descripcion:
    Verifica que el peso sea un numero mayor que cero.

    Parametros:
    - peso: Valor a verificar.

    Retorna:
    - true si el peso es valido, false si no.
    */
    return !isNaN(peso) && Number(peso) > 0;
}

export function calcularIncremento(pesoAnterior, pesoActual) {
    /*
    Descripcion:
    Calcula el incremento de peso entre dos mediciones.

    Parametros:
    - pesoAnterior: Peso previo del estanque.
    - pesoActual:   Nuevo peso registrado.

    Retorna:
    - Incremento redondeado a 2 decimales.
    */
    return Number((Number(pesoActual) - Number(pesoAnterior)).toFixed(2));
}