/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     alimentacion.service.js
Autor:       Felipe Salas
Fecha:       29/06/2026
Modulo:      Alimentacion
Descripcion:
Capa de logica de negocio del modulo de alimentacion.
Define todas las reglas de validacion de los campos.
No accede a la BD ni instancia DTOs.
//////////////////////////////////////////////////////////
*/
 
/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
 
DTOs — solo para acceder a los enums, no para instanciar.
*/
 
import {
    MetodoAlimentacion,
    HoraAlimentacion,
} from '../dtos/alimentacion.dto.js';
 
/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
 
Expresion regular para fechas en formato DD/MM/AAAA.
*/
 
const FECHA_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
 
/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
 
Validaciones atomicas que usa validarRegistro internamente.
*/
 
function esFechaValida(fecha) {
    /*
    Descripcion:
    Verifica que el string tenga el formato DD/MM/AAAA.
 
    Parametros:
    - fecha: String a evaluar.
 
    Retorna:
    - true si cumple el formato, false si no.
    */
    return typeof fecha === 'string' && FECHA_REGEX.test(fecha.trim());
}
 
function esMetodoValido(metodo) {
    /*
    Descripcion:
    Verifica que el metodo sea uno de los definidos
    en el enum MetodoAlimentacion.
 
    Parametros:
    - metodo: String a evaluar.
 
    Retorna:
    - true si el valor es valido, false si no.
    */
    return Object.values(MetodoAlimentacion).includes(metodo);
}
 
function esHoraValida(hora) {
    /*
    Descripcion:
    Verifica que la hora sea una de las opciones
    definidas en el enum HoraAlimentacion.
 
    Parametros:
    - hora: String a evaluar.
 
    Retorna:
    - true si el valor es valido, false si no.
    */
    return Object.values(HoraAlimentacion).includes(hora);
}
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
 
Logica de negocio exportable que usa el controlador.
*/
 
export function validarRegistro({
    finca,
    estanque,
    fecha,
    hora,
    metodo,
    cantidadKg,
}) {
    /*
    Descripcion:
    Valida los campos requeridos de un registro de
    alimentacion. Devuelve un array con los mensajes de
    error encontrados. Array vacio = datos validos.
 
    Parametros:
    - finca:      Nombre de la finca (requerido).
    - estanque:   Identificador del estanque (requerido).
    - fecha:      Fecha en formato DD/MM/AAAA (requerido).
    - hora:       Hora de alimentacion, valor del enum.
    - metodo:     Metodo de alimentacion, valor del enum.
    - cantidadKg: Cantidad en kg (entero positivo, requerido).
 
    Retorna:
    - errores: Array de strings. Vacio si todo es valido.
    */
    const errores = [];
 
    if (!finca || String(finca).trim().length === 0)
        errores.push('La finca es requerida.');
 
    if (!estanque || String(estanque).trim().length === 0)
        errores.push('El estanque es requerido.');
 
    if (!esFechaValida(fecha))
        errores.push('La fecha debe tener el formato DD/MM/AAAA.');
 
    if (!esHoraValida(hora))
        errores.push(
            `Hora invalida. ` +
            `Opciones: ${Object.values(HoraAlimentacion).join(', ')}.`
        );
 
    if (!esMetodoValido(metodo))
        errores.push(
            `Metodo invalido. ` +
            `Opciones: ${Object.values(MetodoAlimentacion).join(', ')}.`
        );
 
    const kg = Number(cantidadKg);
    if (!Number.isInteger(kg) || kg <= 0)
        errores.push(
            'La cantidad en kg debe ser un entero positivo.'
        );
 
    return errores;
}