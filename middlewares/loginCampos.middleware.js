/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.middleware.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Middlewares de validacion de body para el modulo de
login.
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

Campos minimos requeridos por endpoint del modulo login.
El body acepta "usuario" O "correo" en el login web;
solo se exige "contrasena" porque el Service decide
cual identificador usar.
*/
const camposLogin = [
    ["usuario", "correo", "email", "nombreUsuario"],
    ["contrasena"]
];

const camposRegistro = [
    ["nombre"],
    ["apellidos"],
    ["correo", "email"],
    ["usuario", "nombreUsuario"],
    ["contrasena"],
    ["rolId"],
];

const camposRegistroOperario = [
    ["nombre"],
    ["apellidos"],
    ["usuario", "nombreUsuario"],
    ["rolId"],
    ["pin"],
];

const camposVerificarPin = [["operarioId"], ["pin"]];
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de login.
*/
export function validarBodyLogin(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para el login web.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposLogin);

    if (faltantes.length > 0) {
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(", ")}.`,
            null,
            400
        );
    }

    next();
}

export function validarBodyRegistro(req, res, next) {
      /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para registrar un
    administrador web.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposRegistro);

    if (faltantes.length > 0) {
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(", ")}.`,
            null,
            400
        );
    }

    next();
}

export function validarBodyRegistroOperario(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para registrar un
    operario de campo.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposRegistroOperario);

    if (faltantes.length > 0) {
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(", ")}.`,
            null,
            400
        );
    }

    next();
}

export function validarBodyVerificarPin(req, res, next) {
     /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos para verificar el
    PIN de un operario de campo en la app movil.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = obtenerCamposFaltantes(req.body, camposVerificarPin);

    if (faltantes.length > 0) {
        return error(
            res,
            `Faltan campos requeridos: ${faltantes.join(", ")}.`,
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

function obtenerCamposFaltantes(body, grupos) {
    const faltantes = [];

    for (let i = 0; i < grupos.length; i++) {
        const grupo = grupos[i];
        const tieneCampo = grupo.some((campo) => valorPresente(body[campo]));

        if (!tieneCampo) {
            faltantes.push(grupo[0]);
        }
    }

    return faltantes;
}

function valorPresente(valor) {
    if (valor === undefined || valor === null) {
        return false;
    }

    if (typeof valor === "string" && valor.trim().length === 0) {
        return false;
    }

    return true;
}
