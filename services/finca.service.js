/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantFinca.service.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Define las reglas de negocio de finca (funciones helper
de validacion para el middleware).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import * as FincaModel from "../models/finca.model.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion.
*/

export function isEmpty(value) {
    /*
    Descripcion:
    Verifica si un valor es nulo, indefinido o una cadena vacía.

    Parametros:
    - value: Valor a verificar.

    Retorna:
    - true si el valor es nulo, indefinido o una cadena vacía;
    */
    return value === undefined || value === null || String(value).trim() === '';
}

export function isNumeroPositivo(value) {
    /*
    Descripcion:
    Verifica si un valor es un número positivo.

    Parametros:
    - value: Valor a verificar.

    Retorna:
    - true si el valor es un número positivo; false en caso contrario.
    */
    const num = Number(value);
    return !isNaN(num) && num > 0;
}

export async function tieneCodigoCBODuplicado(req, codigoCBO, codigoActual = null) {
    /*
    Descripcion:
    Verifica si ya existe una finca con el mismo CBO dentro del grupo.

    Parametros:
    - req: Peticion HTTP para obtener el contexto de grupo.
    - codigoCBO: CBO a validar.
    - codigoActual: CBO actual en caso de actualizacion.

    Retorna:
    - true si ya existe otro registro con ese CBO.
    - false si no existe duplicado.
    */
    const { grupoDatos } = obtenerContextoPeticion(req);
    const codigoNormalizado = String(codigoCBO).trim();
    const codigoRegistroActual = String(codigoActual ?? "").trim();
    const fincaExistente = await FincaModel.findByIdCBO(codigoNormalizado, grupoDatos);

    return Boolean(fincaExistente && codigoNormalizado !== codigoRegistroActual);
}