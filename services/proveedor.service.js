/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.service.js
Autor: Pamela / Joan
Fecha: 29/06/2026
Modulo: Proveedores
Descripcion:
Define las reglas de negocio y validaciones para proveedores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { tipoProductos } from "../dtos/proveedor.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.
    */
    if (valor === undefined) return true;
    if (valor === null) return true;
    if (typeof valor === "string") {
        if (valor.trim().length === 0) return true;
    }
    return false;
}

export function isTelefonoValido(telefono) {
    /*
    Descripcion:
    Valida el formato costarricense +506 XXXX-XXXX.
    */
    const regex = /^\+506 \d{4}-\d{4}$/;
    return regex.test(telefono);
}

export function isCorreoValido(correo) {
    /*
    Descripcion:
    Valida formato de correo si no viene vacio.
    */
    if (isEmpty(correo)) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

export function isTipoProductoValido(tipo) {
    /*
    Descripcion:
    Verifica que el tipo de producto este en el Enum.
    */
    const tipos = Object.values(tipoProductos);
    for (let i = 0; i < tipos.length; i++) {
        if (tipo === tipos[i]) return true;
    }
    return false;
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que el ID sea numerico y mayor que cero.
    */
    const numero = Number(id);
    if (Number.isNaN(numero)) return false;
    if (numero <= 0) return false;
    return true;
}