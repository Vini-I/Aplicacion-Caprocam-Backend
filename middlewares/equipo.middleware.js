/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.middleware.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
Middleware de validacion de body para el modulo
de equipos.
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
 
Campos minimos requeridos en el body para crear
o actualizar un equipo.
*/


const camposRequeridos = [
    ["identificador", "nombre"],
    ["descripcion"],
    ["fechaInstalacion"],
    ["tipo"],
    ["estado"],
    ["funcionEquipo"]
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
 
Contiene los middlewares de validacion de body
para el modulo de equipo.
*/
 


export function validarBodyEquipo(req, res, next) {
        /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos.
 
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

    const faltantes = obtenerCamposFaltantes(req.body, camposRequeridos);

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
