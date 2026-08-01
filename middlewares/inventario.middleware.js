/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.middleware.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Middleware de validacion de body para inventario.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyInventarioCreate(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga los campos
    minimos requeridos para crear un registro de inventario.
 
    Parametros:
    - req:  Objeto request de Express.
    - res:  Objeto response de Express.
    - next: Funcion para pasar al siguiente middleware.
 
    Retorna:
    - next() si el body es valido.
    - 400 si el body esta vacio o faltan campos.
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, 'El body no puede estar vacío.', null, 400);
    }
    const faltantes = [];
    if (req.body.producto_id === undefined || req.body.producto_id === null || req.body.producto_id === '') {
        faltantes.push('producto_id');
    }
    if (req.body.stock_minimo === undefined || req.body.stock_minimo === null || req.body.stock_minimo === '') {
        faltantes.push('stock_minimo');
    }
    if (faltantes.length > 0) {
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);
    }
    next();
}
 
export function validarBodyInventarioUpdate(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga stock_minimo
    para actualizar un registro de inventario. cantidad no se
    valida aqui porque no se acepta en este endpoint.
 
    Parametros:
    - req:  Objeto request de Express.
    - res:  Objeto response de Express.
    - next: Funcion para pasar al siguiente middleware.
 
    Retorna:
    - next() si el body es valido.
    - 400 si el body esta vacio o falta stock_minimo.
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, 'El body no puede estar vacío.', null, 400);
    }
    const stockMinimo = req.body.stock_minimo ?? req.body.stockMinimo;
    if (stockMinimo === undefined || stockMinimo === null || stockMinimo === '') {
        return error(res, 'Falta el campo requerido: stock_minimo.', null, 400);
    }
    next();
}