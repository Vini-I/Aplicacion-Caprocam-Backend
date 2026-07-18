/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.middleware.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Colaboradores
Descripcion:
Middleware de validacion de body para colaboradores.
Separado en POST y PUT para evitar exigir credenciales
en actualizaciones.
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

camposPost: incluye credenciales requeridas solo en creacion.
camposPut:  solo campos editables, sin credenciales de acceso.
*/

const camposPost = ['nombre', 'apellidos', 'rolId', 'nombreUsuario', 'pinHash'];
const camposPut  = ['nombre', 'apellidos', 'rolId'];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyColaboradorPost(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para creacion de colaborador.
    Incluye nombreUsuario y pinHash.

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

export function validarBodyColaboradorPut(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para actualizacion de colaborador.
    No exige credenciales de acceso.

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