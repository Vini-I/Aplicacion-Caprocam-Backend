/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.middleware.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Middleware encargado de validar que el body de las peticiones
POST y PUT del modulo de parasitologias tenga los campos minimos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos para crear o actualizar
un registro de parasitologia.
*/

const camposRequeridos = [
    "finca",
    "estanque",
    "fechaReporte",
    "parasito",
    "camaronesMuestreados",
    "camaronesInfectados"
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares exportables que se usan en las rutas
del modulo de parasitologias.
*/

export function validarBodyParasitologia(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y que tenga los campos
    requeridos para procesar una parasitologia.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    - next: Funcion para continuar al controlador

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos requeridos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = [];

    for (let i = 0; i < camposRequeridos.length; i++) {
        const campo = camposRequeridos[i];

        if (campoVacio(req.body[campo]) === true) {
            faltantes.push(campo);
        }
    }

    if (faltantes.length > 0) {
        return error(
            res,
            "Faltan campos requeridos: " + faltantes.join(", ") + ".",
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

Funciones internas utilizadas por los middlewares de este archivo.
*/

function campoVacio(valor) {
    /*
    Descripcion:
    Verifica si un campo recibido esta vacio.

    Parametros:
    - valor: Valor recibido en el body

    Retorna:
    - true si el campo esta vacio, false si tiene contenido
    */
    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (String(valor).trim() === "") {
        return true;
    }

    return false;
}