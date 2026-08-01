/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.middleware.js
Autor: Marco Vásquez
Fecha: 28/07/2026
Modulo: Mantenimientos
Descripcion:
Middleware de validacion de body para mantenimientos.
costoProductos y costoTotalEstimado removidos de los
campos requeridos — son calculados automaticamente.
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

costoProductos y costoTotalEstimado no son campos del body.
Son calculados por el backend al agregar/modificar productos.
*/

const camposPost = ['codigoTicket', 'equipoId', 'fechaMantenimiento', 'tituloTicket', 'descripcionTicket'];
const camposPut  = ['equipoId', 'tituloTicket', 'descripcionTicket'];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyMantenimientoPost(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para creacion de ticket.

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

    const faltantes = camposPost.filter(campo => !req.body[campo]);

    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);

    next();
}

export function validarBodyMantenimientoPut(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para actualizacion de ticket.
    codigoTicket no se puede modificar.

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

    const faltantes = camposPut.filter(campo => !req.body[campo]);

    if (faltantes.length > 0)
        return error(res, `Faltan campos requeridos: ${faltantes.join(', ')}.`, null, 400);

    next();
}