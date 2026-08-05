/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.middleware.js
Autor: Oscar Mario Alvarez
Fecha: 29/06/2026
Modulo: Proveedor
Descripcion:
Middleware encargado de la validacion entre la peticion y 
la respuesta, para asi evitar errores
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";
import { tipoProductos } from "../dtos/proveedor.dto.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Campos minimos requeridos en el body para proveedores.
*/

const camposRequeridos = ["nombre", "tipoProducto", "telefono"];
const telefonoRegex = /^\d{8}$/;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Funciones que validaran el body.
*/

export function validarBodyProveedor(req, res, next) {
    /*
    Descripcion:
    Verifica que el body no este vacio y contenga
    los campos minimos requeridos y validos.

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

    if (faltantes.length > 0) {
        return error(
            res,
            "Faltan campos requeridos: " + faltantes.join(", ") + ".",
            null,
            400
        );
    }

    // Validar tipo de producto
    const tiposValidos = Object.values(tipoProductos);
    if (!tiposValidos.includes(req.body.tipoProducto)) {
        return error(
            res,
            "Tipo de producto invalido. Valores permitidos: " +
                tiposValidos.join(", ") +
                ".",
            null,
            400
        );
    }

    // Validar telefono de ocho digitos
    if (!telefonoRegex.test(req.body.telefono)) {
        return error(
            res,
            "Formato de telefono invalido. Debe contener 8 digitos.",
            null,
            400
        );
    }

    // Validar formato del correo si viene
    if (req.body.correo) {
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(req.body.correo)) {
            return error(
                res,
                "Formato de correo electronico invalido.",
                null,
                400
            );
        }
    }

    next();
}