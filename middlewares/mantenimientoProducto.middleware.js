/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.middleware.js
Autor: Marco Vásquez
Fecha: 30/07/2026
Modulo: MantenimientoProductos
Descripcion:
Middleware de validacion de body para mantenimiento-productos.
costoUnitario y subtotal son opcionales — el backend los extrae
de la tabla productos y realiza el calculo automatico.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

costoUnitario y subtotal no son campos obligatorios del body.
El backend los resuelve consultando precio_unidad en productos.
*/

const camposPost = ['mantenimientoEquipoId', 'productoId', 'cantidad'];
const camposPut  = ['cantidad'];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyMantenimientoProductoPost(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para vincular un producto a un mantenimiento.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const faltantes = camposPost.filter(
        campo => req.body[campo] === undefined ||
                 req.body[campo] === null ||
                 req.body[campo] === ''
    );

    if (faltantes.length > 0)
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );

    next();
}

export function validarBodyMantenimientoProductoPut(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para actualizar un producto en un mantenimiento.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacío.', null, 400);

    const faltantes = camposPut.filter(
        campo => req.body[campo] === undefined ||
                 req.body[campo] === null ||
                 req.body[campo] === ''
    );

    if (faltantes.length > 0)
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );

    next();
}