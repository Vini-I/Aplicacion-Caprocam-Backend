/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.middleware.js
Autor: Brandon
Fecha: 03/07/2026
Modulo: Trazabilidad
Descripcion:
Middleware de validacion de body para registros de
trazabilidad. Verifica que los campos obligatorios
esten presentes antes de llegar al controller.
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

Campos minimos requeridos en el body para un registro.
colaboradorId ya NO se pide aqui: se toma del JWT
(req.user.colaboradorId), ver trazabilidad.controller.js.
Pendiente de que el login de operarios incluya
colaboradorId en el payload del token.
*/

const camposRequeridos = [
    'fincaId',
    'estanqueOrigenId',
    'estanqueDestinoId',
    'fecha',
    'tamano',
    'dias',
    'pl',
];

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function estaVacio(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio, sin marcar
    como faltante un 0 valido (mismo bug corregido
    en fisicoQuimica.middleware.js).

    Parametros:
    - valor: Valor a revisar.

    Retorna:
    - true si esta vacio.
    - false si tiene contenido, incluyendo 0.
    */
    if (valor === undefined) return true;
    if (valor === null) return true;
    if (typeof valor === 'string' && valor.trim() === '') return true;
    return false;
}

function esNumeroMayorCero(valor) {
    /*
    Descripcion:
    Verifica que un valor sea numerico y mayor a
    cero. Centraliza aqui la validacion de formato
    que antes se repetia en el controller.

    Parametros:
    - valor: Valor a revisar.

    Retorna:
    - true si es un numero valido mayor a cero.
    - false en cualquier otro caso.
    */
    const numero = Number(valor);
    return !Number.isNaN(numero) && numero > 0;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de trazabilidad.
*/

export function validarTrazabilidad(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para un registro
    de trazabilidad.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0)
        return error(res, 'El body no puede estar vacio.', null, 400);

    const faltantes = camposRequeridos.filter(campo => estaVacio(req.body[campo]));

    if (faltantes.length > 0)
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(', ')}.`,
            null,
            400
        );

    const { estanqueOrigenId, estanqueDestinoId } = req.body;

    if (estanqueOrigenId === estanqueDestinoId)
        return error(
            res,
            'El estanque origen y destino no pueden ser el mismo.',
            null,
            400
        );

    const fechaIngresada = new Date(req.body.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaIngresada > hoy)
        return error(res, 'La fecha no puede ser futura.', null, 400);

    const camposNumericos = {
        fincaId: req.body.fincaId,
        estanqueOrigenId: req.body.estanqueOrigenId,
        estanqueDestinoId: req.body.estanqueDestinoId,
        tamano: req.body.tamano,
        dias: req.body.dias,
        pl: req.body.pl,
    };

    for (const [campo, valor] of Object.entries(camposNumericos)) {
        if (!esNumeroMayorCero(valor))
            return error(
                res,
                `El campo ${campo} debe ser numerico y mayor a cero.`,
                null,
                400
            );
    }

    // colaboradorId es opcional (el "colaborador responsable" en
    // campo). Si el front lo manda, se valida su formato aqui.
    if (!estaVacio(req.body.colaboradorId) && !esNumeroMayorCero(req.body.colaboradorId))
        return error(
            res,
            'El campo colaboradorId debe ser numerico y mayor a cero.',
            null,
            400
        );

    next();
}