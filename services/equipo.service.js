/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.service.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
Define las reglas de negocio y validaciones del modulo
de equipos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
 
DTOs
*/


import { TipoEquipo, EstadoEquipo } from "../dtos/equipo.dto.js";

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
    Verifica si un valor esta vacio, es null o undefined.
 
    Parametros:
    - valor: Valor a revisar.
 
    Retorna:
    - true si esta vacio, false si tiene contenido.
    */

    if (valor === undefined || valor === null) {
        return true;
    }

    if (typeof valor === "string" && valor.trim().length === 0) {
        return true;
    }

    return false;
}

export function isTipoEquipo(tipo) {
        /*
    Descripcion:
    Valida que el tipo recibido exista dentro de los
    valores permitidos del enum TipoEquipo.
 
    Parametros:
    - tipo: String con el tipo de equipo.
 
    Retorna:
    - true si es un tipo valido, false si no.
    */

    const valorNormalizado = normalizarTexto(tipo);
    const tipos = Object.values(TipoEquipo).map(normalizarTexto);

    return tipos.includes(valorNormalizado);
}

export function isEstadoEquipo(estado) {
        /*
    Descripcion:
    Valida que el estado recibido exista dentro de los
    valores permitidos del enum EstadoEquipo.
 
    Parametros:
    - estado: String con el estado del equipo.
 
    Retorna:
    - true si es un estado valido, false si no.
    */

    const valorNormalizado = normalizarTexto(estado);
    const estados = Object.values(EstadoEquipo).map(normalizarTexto);

    return estados.includes(valorNormalizado);
}

export function isIdValido(id) {
        /*
    Descripcion:
    Valida que un id sea numerico y mayor a cero.
 
    Parametros:
    - id: Valor a validar.
 
    Retorna:
    - true si es valido, false si no.
    */

    const numero = Number(id);

    if (Number.isNaN(numero)) {
        return false;
    }

    return numero > 0;
}

export function isFechaValida(fecha) {
        /*
    Descripcion:
    Valida que una fecha tenga formato dd/mm/aaaa y
    represente una fecha calendario real.
 
    Parametros:
    - fecha: String a validar.
 
    Retorna:
    - true si la fecha es valida, false si no.
    */

    if (isEmpty(fecha)) {
        return false;
    }

    const texto = String(fecha).trim();
    const partes = texto.split("/");

    if (partes.length !== 3) {
        return false;
    }

    const dia = Number(partes[0]);
    const mes = Number(partes[1]);
    const anio = Number(partes[2]);

    if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(anio)) {
        return false;
    }

    if (partes[2].length !== 4 || dia < 1 || mes < 1 || mes > 12) {
        return false;
    }

    const fechaObj = new Date(anio, mes - 1, dia);

    return (
        fechaObj.getFullYear() === anio &&
        fechaObj.getMonth() === mes - 1 &&
        fechaObj.getDate() === dia
    );
}

function normalizarTexto(valor) {
    return String(valor ?? "")
        .trim()
        .toLocaleLowerCase("es")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
