/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.service.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
Descripcion:
Define las reglas de negocio y validaciones del
modulo de mantenimientos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { EstadoTicket } from '../dtos/mantenimiento.dto.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const fechaHoraRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/

export function isEstadoValido(estado) {
    /*
    Descripcion:
    Valida que el estado del ticket sea uno de los valores
    permitidos por el enum EstadoTicket.

    Parametros:
    - estado: String a validar.

    Retorna:
    - true si es un estado valido, false si no.
    */
    return Object.values(EstadoTicket).includes(estado);
}

export function isFechaHoraValida(fechaHora) {
    /*
    Descripcion:
    Valida que la fecha y hora tenga formato ISO 8601.
    Mantenido por si se necesita en el futuro.
    Ejemplo valido: 2026-07-04T10:30:00

    Parametros:
    - fechaHora: String a validar.

    Retorna:
    - true si el formato es valido, false si no.
    */
    return fechaHoraRegex.test(String(fechaHora).trim());
}

export function isEmpty(string) {
    /*
    Descripcion:
    Verifica si un string esta vacio o solo tiene espacios.

    Parametros:
    - string: String a verificar.

    Retorna:
    - true si esta vacio, false si tiene contenido.
    */
    return String(string).trim().length === 0;
}