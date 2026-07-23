/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoTarea.middleware.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoTareas
Descripcion:
Middleware de validacion de body para mantenimiento-tareas.
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
*/

const camposPost = ['mantenimientoEquipoId', 'tareaId'];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyMantenimientoTarea(req, res, next) {
    /*
    Descripcion:
    Verifica campos requeridos para vincular una tarea a un mantenimiento.

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