/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.middleware.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Middleware encargado de validar el body antes de llegar al
controlador de enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Common
import { error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const CAMPOS_REQUERIDOS = [
    "finca",
    "estanque",
    "fechaReporte",
    "enfermedades",
    "severidad",
    "reporte"
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarBodyEnfermedad(req, res, next) {
    /*
    Descripcion:
    Valida que el body exista y tenga campos requeridos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    - next: Funcion para continuar

    Retorna:
    - next() si es valido
    - 400 si falla la validacion
    */

    if (req.body === undefined) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    if (req.body === null) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    if (Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = obtenerCamposFaltantes(req.body);

    if (faltantes.length > 0) {
        return error(
            res,
            "Faltan campos requeridos: " + faltantes.join(", ") + ".",
            faltantes,
            400
        );
    }

    const errores = validarReglasBody(req.body);

    if (errores.length > 0) {
        return error(res, "Datos invalidos para enfermedad.", errores, 400);
    }

    next();
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

// validarBodyEnfermedad() depende de esta funcion
function obtenerCamposFaltantes(body) {
    /*
    Descripcion:
    Obtiene campos requeridos faltantes.

    Parametros:
    - body: Cuerpo de la peticion

    Retorna:
    - Lista de campos faltantes
    */

    const faltantes = [];

    for (let i = 0; i < CAMPOS_REQUERIDOS.length; i++) {
        const campo = CAMPOS_REQUERIDOS[i];

        if (campoEstaVacio(body[campo]) === true) {
            faltantes.push(campo);
        }
    }

    return faltantes;
}

// validarBodyEnfermedad() depende de esta funcion
function validarReglasBody(body) {
    /*
    Descripcion:
    Valida reglas especificas del body.

    Parametros:
    - body: Cuerpo de la peticion

    Retorna:
    - Lista de errores
    */

    const errores = [];

    validarListaEnfermedades(body.enfermedades, errores);
    validarMortalidad(body.mortalidad, errores);

    return errores;
}

// validarReglasBody() depende de esta funcion
function validarListaEnfermedades(enfermedades, errores) {
    /*
    Descripcion:
    Valida que enfermedades sea una lista con datos.

    Parametros:
    - enfermedades: Valor recibido
    - errores: Lista de errores

    Retorna:
    No retorna
    */

    if (Array.isArray(enfermedades) === false) {
        errores.push("El campo enfermedades debe ser una lista.");
        return;
    }

    if (enfermedades.length === 0) {
        errores.push("Debe seleccionar al menos una enfermedad.");
    }
}

// validarReglasBody() depende de esta funcion
function validarMortalidad(mortalidad, errores) {
    /*
    Descripcion:
    Valida que mortalidad sea numerica y no negativa.

    Parametros:
    - mortalidad: Valor recibido
    - errores: Lista de errores

    Retorna:
    No retorna
    */

    if (mortalidad === undefined) {
        return;
    }

    if (mortalidad === null) {
        return;
    }

    if (String(mortalidad).trim() === "") {
        return;
    }

    const numero = Number(mortalidad);

    if (Number.isNaN(numero) === true) {
        errores.push("El campo mortalidad debe ser numerico.");
        return;
    }

    if (numero < 0) {
        errores.push("El campo mortalidad no puede ser negativo.");
    }
}

// obtenerCamposFaltantes() depende de esta funcion
function campoEstaVacio(valor) {
    /*
    Descripcion:
    Revisa si un campo viene vacio.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - true si esta vacio
    - false si tiene informacion
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (Array.isArray(valor) === true) {
        if (valor.length === 0) {
            return true;
        }

        return false;
    }

    if (String(valor).trim() === "") {
        return true;
    }

    return false;
}
