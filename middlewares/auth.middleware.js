/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: auth.middleware.js
Autor: Marco Vásquez
Fecha: 30/07/2026
Modulo: Middleware
Descripcion:
Verifica que la peticion viene de un usuario o colaborador
autenticado mediante JWT. Adjunta req.user y req.colaborador.
Implementa renovacion continua de token si hay actividad.
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
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_RENEW_THRESHOLD } from '../config/jwt.js';

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
    Distingue si el token pertenece a un Usuario Web o a un Colaborador.
    Adjunta req.user y req.colaborador segun corresponda.

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

        // Si el JWT pertenece a un colaborador (APK movil)
        if (decoded.esColaborador) {
            req.user        = decoded;
            req.colaborador = {
                id:         decoded.id,
                grupoDatos: decoded.grupoDatos,
                rolId:      decoded.rolId,
                nombre:     decoded.nombre,
            };
        } else {
            // Usuario Web
            req.user        = decoded;
            req.colaborador = null;
        }

        // Renovacion continua: si le quedan menos de JWT_RENEW_THRESHOLD seg
        const ahora = Math.floor(Date.now() / 1000);
        const tiempoRestante = decoded.exp - ahora;

        if (tiempoRestante > 0 && tiempoRestante < JWT_RENEW_THRESHOLD) {
            const { iat, exp, ...payload } = decoded;
            const nuevoToken = jwt.sign(payload, JWT_SECRET, {
                expiresIn: JWT_EXPIRES_IN,
            });
            res.setHeader('X-Renewed-Token', nuevoToken);
            res.setHeader('Access-Control-Expose-Headers', 'X-Renewed-Token');
        }

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return error(res, 'Token expirado.', null, 403);

        return error(res, 'Token invalido.', null, 401);
    }
}