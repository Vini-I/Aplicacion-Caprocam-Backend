/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.middleware.js
Autor: Samuel Cerdas
Fecha: 31/07/2026
Modulo: Fisico Quimica
Descripcion:
Middleware de validacion de body para lecturas
fisico quimicas. Verifica que los campos obligatorios
esten presentes antes de llegar al controller.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Servicios
*/
import {
    isFechaValida,
    isIdValido,
    isPhValido,
    isSalinidadValida,
    isTemperaturaValida,
    isOxigeno
} from '../services/fisicoQuimica.service.js';

// Common
import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos generales requeridos en el body para una lectura.
*/

const camposRequeridos = [
    'fincaId',
    'estanqueId',
    'fecha'
];

/*
Campos de mediciones fisico quimicas.
Al menos uno debe contener una medicion.
*/

const camposMedicion = [
    'ph',
    'salinidad',
    'temperatura',
    'oxigenoDisuelto'
];

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene las validaciones internas utilizadas por el
middleware del modulo.
*/

function normalizarMediciones(req) {
    /*
    Descripcion:
    Convierte en arreglos vacios los campos de medicion
    que no fueron enviados en el body.

    Parametros:
    - req: Objeto request de Express.

    Retorna:
    - No retorna un valor.
    */
    for (const campo of camposMedicion) {
        if (req.body[campo] === undefined) {
            req.body[campo] = [];
        }
    }
}

function validarCampos(req, res) {
    /*
    Descripcion:
    Verifica el formato y contenido de los campos de una
    lectura fisico quimica.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - Respuesta 400 si algun campo es invalido.
    - null si todos los campos son validos.
    */
    const {
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigenoDisuelto
    } = req.body;

    if (!isIdValido(fincaId)) {
        return error(
            res,
            'El fincaId no es valido.',
            null,
            400
        );
    }

    if (!isIdValido(estanqueId)) {
        return error(
            res,
            'El estanqueId no es valido.',
            null,
            400
        );
    }

    if (!isFechaValida(fecha)) {
        return error(
            res,
            'La fecha no es valida.',
            null,
            400
        );
    }

    const totalMediciones =
        ph.length +
        salinidad.length +
        temperatura.length +
        oxigenoDisuelto.length;

    if (totalMediciones === 0) {
        return error(
            res,
            'Debe incluir al menos una medicion.',
            null,
            400
        );
    }

    if (!isPhValido(ph)) {
        return error(
            res,
            'El ph debe contener mediciones validas.',
            null,
            400
        );
    }

    if (!isSalinidadValida(salinidad)) {
        return error(
            res,
            'La salinidad debe contener mediciones validas.',
            null,
            400
        );
    }

    if (!isTemperaturaValida(temperatura)) {
        return error(
            res,
            'La temperatura debe contener mediciones validas.',
            null,
            400
        );
    }

    if (!isOxigeno(oxigenoDisuelto)) {
        return error(
            res,
            'El oxigeno disuelto debe contener ' +
                'mediciones validas con horaMedicion.',
            null,
            400
        );
    }

    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de fisico quimica.
*/

export function validarFisicoQuimica(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio, contenga los campos
    generales requeridos y al menos una medicion valida.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
    - next: Funcion para pasar al siguiente middleware.

    Retorna:
    - next() si el body es valido.
    - 400 si el body esta vacio, incompleto o es invalido.
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(
            res,
            'El body no puede estar vacio.',
            null,
            400
        );
    }

    const faltantes = camposRequeridos.filter(
        campo => req.body[campo] === undefined
    );

    if (faltantes.length > 0) {
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );
    }

    normalizarMediciones(req);

    const resultadoValidacion = validarCampos(
        req,
        res
    );

    if (resultadoValidacion) {
        return resultadoValidacion;
    }

    return next();
}