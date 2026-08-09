/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: auth.middleware.js
Autor: Marco Vásquez
Fecha: 08/08/2026
Modulo: Middleware
Descripcion:
Verifica que la peticion viene de un usuario o colaborador
autenticado mediante JWT (sin roles).
//////////////////////////////////////////////////////////
*/

import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN, JWT_RENEW_THRESHOLD } from '../config/jwt.js';
import { error } from '../common/respuestaJson.js';

export function verificarAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token      = authHeader && authHeader.split(' ')[1];

    if (!token)
        return error(res, 'No autorizado. Token requerido.', null, 401);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.esColaborador) {
            return error(
                res, 
                'Acceso denegado. Los colaboradores no pueden acceder a esta ruta.', 
                null, 
                403
            );
        }

        req.user        = decoded;
        req.colaborador = null;

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