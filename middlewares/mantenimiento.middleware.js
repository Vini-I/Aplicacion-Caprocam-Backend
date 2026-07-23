/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.middleware.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: Mantenimientos
Descripcion:
Middleware de validacion de body para mantenimientos.
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

codigoTicket y fechaMantenimiento son nuevos campos requeridos.
estadoEquipo removido — ya no existe en la tabla.
creadoPor removido — viene del JWT.
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
    codigoTicket no se puede cambiar en update.

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