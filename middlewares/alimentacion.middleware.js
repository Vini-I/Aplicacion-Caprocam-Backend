/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.middleware.js
Autor: Felipe Salas
Fecha: 06/07/2026
Modulo: Alimentacion
Descripcion:
Middleware de validacion de body para alimentacion.
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

Campos minimos requeridos en el body para alimentacion.
Coinciden con las columnas NOT NULL de la tabla alimentaciones,
mas hora y metodo que el negocio exige aunque la BD los permita NULL.
*/

const camposRequeridos = [
    "fecha",
    "hora",
    "metodo",
    "cantidadKg"
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
para el modulo de alimentacion.
*/

export function validarBodyAlimentacion(req, res, next) {
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