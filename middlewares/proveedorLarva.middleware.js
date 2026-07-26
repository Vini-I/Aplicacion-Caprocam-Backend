/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.middleware.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Proveedor Larva
Descripcion:
Middleware de validacion de body para proveedor de larva.
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";
import { isEmpty } from "../services/proveedorLarva.service.js";

export function validarBodyProveedorLarva(req, res, next) {
    /*
    Descripcion:
    Middleware encargado de interceptar y validar el cuerpo (body) de la peticion HTTP para asegurar que los datos obligatorios de proveedorLarva esten presentes y cumplan con los formatos esperados antes de pasar al controlador.
    Parametros:
    - req: Objeto Request de Express (contiene body, params y user autenticado).
    - res: Objeto Response de Express para envio estructurado de JSON.
    - next: Callback para pasar el control al siguiente middleware en la cadena.

    Retorna:
    - Invoca next() si el payload es valido, de lo contrario retorna una respuesta JSON HTTP 422 (Unprocessable Entity) con el arreglo de errores detectados.
    */
if (!req.body || Object.keys(req.body).length === 0) {
        return error(res, "El body no puede estar vacio.", null, 400);
    }
    if (isEmpty(req.body.nombre)) {
        return error(res, "El campo 'nombre' es requerido.", null, 400);
    }
    next();
}