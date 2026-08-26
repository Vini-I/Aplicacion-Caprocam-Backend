/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.service.js
Autor: Rodolfo Chaves
Fecha: 20/07/2026
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

import {
    TipoEquipo,
    EstadoOperativoEquipo,
    EstadoEquipo
} from "../dtos/equipo.dto.js";

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
    - valor: Valor a validar.

    Retorna:
    - true si es valido, false si no.
    */

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    return numero > 0;
}

export function isNumeroMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor o igual a cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es valido, false si no.
    */

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    return numero >= 0;
}

export function isNumeroOpcionalMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida un valor numerico opcional. Si viene vacio se
    considera valido, ya que el campo no es obligatorio.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es valido, false si no.
    */

    if (isEmpty(valor)) {
        return true;
    }

    return isNumeroMayorIgualCero(valor);
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

    const tipos = Object.values(TipoEquipo);

    for (let i = 0; i < tipos.length; i++) {
        if (tipo === tipos[i]) {
            return true;
        }
    }

    return false;
}

export function isEstadoOperativoEquipo(estado) {
    /*
    Descripcion:
    Valida que el estado operativo recibido exista dentro
    de los valores permitidos del enum EstadoOperativoEquipo.

    Parametros:
    - estado: String con el estado operativo del equipo.

    Retorna:
    - true si es un estado valido, false si no.
    */

    const estados = Object.values(EstadoOperativoEquipo);

    for (let i = 0; i < estados.length; i++) {
        if (estado === estados[i]) {
            return true;
        }
    }

    return false;
}

export function isEstadoEquipo(estado) {
    /*
    Descripcion:
    Valida que el estado de encendido recibido exista
    dentro de los valores permitidos del enum EstadoEquipo.

    Parametros:
    - estado: String con el estado de encendido del equipo.

    Retorna:
    - true si es un estado valido, false si no.
    */

    const estados = Object.values(EstadoEquipo);

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
    - id: Valor a validar.

    Retorna:
    - true si es valido, false si no.
    */

    return isNumeroMayorCero(id);
}

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Valida que una fecha tenga formato dd/mm/aaaa o YYYY-MM-DD y
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

    // Formato ISO: YYYY-MM-DD o YYYY/MM/DD
    if (/^\d{4}[-\/]\d{1,2}[-\/]\d{1,2}$/.test(texto)) {
        const partes = texto.split(/[-\/]/);
        const anio = Number(partes[0]);
        const mes = Number(partes[1]);
        const dia = Number(partes[2]);
        if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
        const fechaObj = new Date(anio, mes - 1, dia);
        return fechaObj.getFullYear() === anio && fechaObj.getMonth() === mes - 1 && fechaObj.getDate() === dia;
    }

    // Formato Latino: DD/MM/YYYY o DD-MM-YYYY
    const partes = texto.split(/[-\/]/);
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