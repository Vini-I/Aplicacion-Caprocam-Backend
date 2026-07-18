/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: auth.middleware.js
Autor: Marco Vásquez
Fecha: 15/07/2026
Modulo: Middleware
Descripcion:
Verifica que la peticion viene de un usuario autenticado
mediante JWT. Adjunta req.user con los datos del token.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import jwt from 'jsonwebtoken';

// Config
import { JWT_SECRET } from '../config/jwt.js';

// Common
import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function verificarAuth(req, res, next) {
    /*
    Descripcion:
    Extrae y verifica el Access Token del header Authorization.
    Si es valido, adjunta req.user con id, grupoDatos y rol.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el token es valido
    - 401 si no hay token o es invalido
    - 403 si el token expiro
    */
    const authHeader = req.headers['authorization'];
    const token      = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token)
        return error(res, 'No autorizado. Token requerido.', null, 401);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, grupoDatos, rol, nombre }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return error(res, 'Token expirado.', null, 403);

        return error(res, 'Token invalido.', null, 401);
    }
}