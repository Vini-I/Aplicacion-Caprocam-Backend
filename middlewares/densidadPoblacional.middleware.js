/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.middleware.js
Autor: Eduard Salas
Fecha: 6/07/2026
Modulo: Densidad Poblacional
Descripcion:
Middleware de validacion de body para densidad poblacional.
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

Campos minimos requeridos en el body para densidad poblacional.
Coinciden con las columnas NOT NULL de la tabla densidad_poblacional.
*/

const camposRequeridos = [
    "fecha"
];

/*
Grupos de alias aceptados para los campos que el frontend
puede enviar con distintos nombres (idFinca/fincaId/finca
y idEstanque/estanqueId/estanque).
*/

const gruposAlias = [
    { nombre: "idFinca", alias: ["idFinca", "fincaId", "finca"] },
    { nombre: "idEstanque", alias: ["idEstanque", "estanqueId", "estanque"] }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de validacion de body
para el modulo de densidad poblacional.
*/

export function validarBodyDensidadPoblacional(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el body es valido
    - 400 si el body esta vacio o faltan campos
    */
    if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }

    const faltantes = [];

    for (let i = 0; i < camposRequeridos.length; i++) {
        const campo = camposRequeridos[i];

        if (!req.body[campo]) {
            faltantes.push(campo);
        }
    }

    for (let i = 0; i < gruposAlias.length; i++) {
        const grupo = gruposAlias[i];
        let tieneAlguno = false;

        for (let j = 0; j < grupo.alias.length; j++) {
            if (req.body[grupo.alias[j]]) {
                tieneAlguno = true;
            }
        }

        if (!tieneAlguno) {
            faltantes.push(grupo.nombre);
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