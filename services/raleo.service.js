/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.service.js
Autor: Sebastian Villegas Barquero
Fecha: 03/07/2026
Modulo: Raleo
Descripcion:
Define las reglas de negocio de raleo.
//////////////////////////////////////////////////////////
*/
/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MetodoRaleo } from "../dtos/raleo.dto.js";

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

export function isNumeroMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor o igual a cero.

    Parametros:
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
    */
    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero < 0) {
        return false;
    }

    return true;
}

export function isMetodoRaleo(metodo) {
    /*
    Descripcion:
    Valida que el metodo de raleo recibido exista dentro de los metodos
    permitidos del modulo.

    Parametros:
    - estado: Estado recibido

    Retorna:
    - true si es valido, false si no
    */
    const metodos = Object.values(MetodoRaleo);

    for (let i = 0; i < metodos.length; i++) {
        if (metodo === metodos[i]) {
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