/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.service.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Tareas
Descripcion:
Define las reglas de negocio y validaciones del
modulo de tareas.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { CategoriasTarea } from '../dtos/tarea.dto.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/

export function isCategoriaValida(categoria) {
    /*
    Descripcion:
    Valida que la categoria sea uno de los valores permitidos.

    Parametros:
    - categoria: String a validar.

    Retorna:
    - true si es una categoria valida, false si no.
    */
    return Object.values(CategoriasTarea).includes(categoria);
}

export function isDuracionValida(duracion) {
    /*
    Descripcion:
    Valida que la duracion estimada sea un numero mayor a cero.

    Parametros:
    - duracion: Valor a validar.

    Retorna:
    - true si es un numero valido y mayor a cero, false si no.
    */
    const numero = Number(duracion);
    return !Number.isNaN(numero) && numero > 0;
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