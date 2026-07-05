/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.service.js
Autor: Gerald Alfaro
Fecha: 29/06/2026
Modulo: Estanques
Descripcion:
Define las reglas de negocio y validaciones del modulo
de estanques.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { EstadoEstanque } from "../dtos/estanques.dto.js";

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

    return isNumeroMayorIgualCero(valor);
}

export function isEstadoEstanque(estado) {
    /*
    Descripcion:
    Valida que el estado recibido exista dentro de los estados
    permitidos del modulo.

    Parametros:
    - estado: Estado recibido

    Retorna:
    - true si es valido, false si no
    */
    const estados = Object.values(EstadoEstanque);

    for (let i = 0; i < estados.length; i++) {
        if (estado === estados[i]) {
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