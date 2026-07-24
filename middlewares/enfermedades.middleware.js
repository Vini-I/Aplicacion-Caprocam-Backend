/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.middleware.js
Autor: Isaac Chaves
Fecha: 18/07/2026
Modulo: Enfermedades
Descripcion:
Valida el grupo de datos obtenido desde el JWT y los
campos requeridos del body del modulo de enfermedades.
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

Campos requeridos enviados por el frontend.
grupoDatos, responsable, colaboradorId y tipoRegistro
no son recibidos desde el frontend.
*/

const camposRequeridos = [
    'fincaId',
    'estanqueId',
    'fechaReporte',
    'enfermedad',
    'severidad',
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarGrupoDatosEnfermedad(
    req,
    res,
    next
) {
    /*
    Descripcion:
    Verifica que el JWT contenga un grupo de datos valido.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
    - next: Funcion para continuar con la solicitud.

    Retorna:
    - next() si el grupo de datos es valido.
    - 403 si el JWT no contiene un grupo valido.
    */

    if (
        req.user === undefined ||
        req.user === null
    ) {
        return error(
            res,
            'No fue posible obtener el usuario autenticado.',
            null,
            403
        );
    }

    const grupoDatos = Number(
        req.user.grupoDatos
    );

    if (Number.isNaN(grupoDatos)) {
        return error(
            res,
            'El usuario no tiene un grupo de datos valido.',
            null,
            403
        );
    }

    if (!Number.isInteger(grupoDatos)) {
        return error(
            res,
            'El usuario no tiene un grupo de datos valido.',
            null,
            403
        );
    }

    if (grupoDatos <= 0) {
        return error(
            res,
            'El usuario no tiene un grupo de datos valido.',
            null,
            403
        );
    }

    next();
}

export function validarBodyEnfermedad(
    req,
    res,
    next
) {
    /*
    Descripcion:
    Verifica que el body no este vacio y que incluya
    los campos requeridos para registrar una enfermedad.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
    - next: Funcion para continuar con la solicitud.

    Retorna:
    - next() si el body contiene los campos requeridos.
    - 400 si el body esta vacio o faltan campos.
    */

    if (
        !req.body ||
        Object.keys(req.body).length === 0
    ) {
        return error(
            res,
            'El body no puede estar vacio.',
            null,
            400
        );
    }

    const faltantes = [];

    for (
        let i = 0;
        i < camposRequeridos.length;
        i++
    ) {
        const campo = camposRequeridos[i];

        if (campoVacio(req.body[campo])) {
            faltantes.push(
                campo
            );
        }
    }

    if (faltantes.length > 0) {
        return error(
            res,
            'Faltan campos requeridos: ' +
            faltantes.join(', ') +
            '.',
            null,
            400
        );
    }

    next();
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function campoVacio(valor) {
    /*
    Descripcion:
    Verifica si un valor no fue enviado o contiene
    un texto vacio.

    Parametros:
    - valor: Valor recibido desde el body.

    Retorna:
    - true si el campo esta vacio.
    - false si contiene un valor.
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (
        typeof valor === 'string' &&
        valor.trim().length === 0
    ) {
        return true;
    }

    return false;
}
