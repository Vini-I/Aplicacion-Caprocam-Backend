/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.service.js
Autor: Felipe Salas
Fecha: 06/07/2026
Modulo: Alimentacion
Descripcion:
Define las reglas de negocio y validaciones del modulo
de alimentacion.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MetodoAlimentacion, HoraAlimentacion } from "../dtos/alimentacion.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.

    Parametros:
    - valor: Valor a revisar

    Retorna:
    - true si esta vacio, false si tiene contenido
    */
    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (typeof valor === "string") {
        if (valor.trim().length === 0) {
            return true;
        }
    }

    return false;
}

export function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor a cero.

    Parametros:
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
    */
    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero <= 0) {
        return false;
    }

    return true;
}

export function isNumeroOpcionalMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor opcional sea numerico y mayor o igual a cero.
    Si viene vacio, se considera valido.

    Parametros:
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(valor)) {
        return true;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero < 0) {
        return false;
    }

    return true;
}

export function isFechaValida(valor) {
    /*
    Descripcion:
    Valida que una fecha sea valida.

    Parametros:
    - valor: Fecha a validar

    Retorna:
    - true si es valida, false si no
    */
    if (isEmpty(valor)) {
        return false;
    }

    return !Number.isNaN(Date.parse(valor));
}

export function isMetodoAlimentacion(metodo) {
    /*
    Descripcion:
    Valida que el metodo recibido exista dentro de los metodos
    permitidos del modulo.

    Parametros:
    - metodo: Metodo recibido

    Retorna:
    - true si es valido, false si no
    */
    const metodos = Object.values(MetodoAlimentacion);

    for (let i = 0; i < metodos.length; i++) {
        if (metodo === metodos[i]) {
            return true;
        }
    }

    return false;
}

export function isHoraAlimentacion(hora) {
    /*
    Descripcion:
    Valida que la hora recibida exista dentro de las horas
    permitidas del modulo.

    Parametros:
    - hora: Hora recibida

    Retorna:
    - true si es valida, false si no
    */
    const horas = Object.values(HoraAlimentacion);

    for (let i = 0; i < horas.length; i++) {
        if (hora === horas[i]) {
            return true;
        }
    }

    return false;
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id sea numerico y mayor a cero.

    Parametros:
    - id: Id recibido

    Retorna:
    - true si es valido, false si no
    */
    return isNumeroMayorCero(id);
}

export function maxLength(valor, max) {
    /*
    Descripcion:
    Verifica que el texto no sobrepase una longitud maxima.

    Parametros:
    - valor: Texto a validar.
    - max: Longitud maxima permitida.

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(valor)) {
        return true;
    }

    return String(valor).trim().length <= max;
}