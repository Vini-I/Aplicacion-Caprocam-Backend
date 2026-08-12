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
*/
import * as SiembraModel from "../models/siembra.model.js";

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

//Validaciones de lógica de negocio.

export function validarRetiroBiomasa(biomasaEstimada,kgRetirados){
    if(Number(kgRetirados) > Number(biomasaEstimada)){
        return false;
    }
    return true;
}

export function validarBiomasaRestante(biomasaEstimada,kgRetirados,biomasaRestanteRecibida){
    const calculada = Number(biomasaEstimada) - Number(kgRetirados);
    if(Number(biomasaRestanteRecibida)<0){
        return false;
    }
    if(Number(biomasaRestanteRecibida)!==calculada){
        return false;
    }
    return true;
}

export function validarPorcentajeRaleo(biomasaEstimada,kgRetirados,porcentajeRecibido){
    const calculado = (Number(kgRetirados) / Number(biomasaEstimada)) *100;
    //Se redondea (por si acaso)
    const porcentajeRedondeado = Number(calculado.toFixed(2)); 
    if(Number(porcentajeRecibido)!== porcentajeRedondeado){
        return false;
    }
    return true;       
}

export function validarFechaNoFutura(fecha) {
    /*
    Descripcion:
    Valida que la fecha recibida sea valida y no sea posterior
    a la fecha actual.

    Parametros:
    - fecha: Fecha recibida en formato YYYY-MM-DD

    Retorna:
    - true si la fecha es valida
    - false si es futura o invalida
    */
    if (!fecha) {
        return false;
    }

    const fechaIngresada = new Date(fecha);
    // Validar fecha incorrecta
    if (Number.isNaN(fechaIngresada.getTime())) {
        return false;
    }
    const hoy = new Date();

    // Eliminamos horas para comparar solamente fechas
    hoy.setHours(0, 0, 0, 0);
    fechaIngresada.setHours(0, 0, 0, 0);
    if (fechaIngresada > hoy) {
        return false;
    }

    return true;
}

//Validacion de estanque activo o no activo para el raleo
export async function validarEstanque(idEstanque, grupoDatos) {

    const siembra = await SiembraModel.findActivaByEstanque(idEstanque, grupoDatos);

    if (!siembra) {
        return null;
    }

    return siembra.id;
}