/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: sync.middleware.js
Autor: Greivin Eliecer A.G
Fecha: 08/08/2026
Modulo: Sincronizacion
Descripcion:
Middleware exclusivo para el modulo de sincronizacion
movil. 
Verifica el JWT de colaborador e inyecta
colaboradorId y grupoDatos directamente en la peticion.
No reutiliza el middleware web general.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function verificarColaborador(req, res, next) {
    /*
    Descripcion:
    Extrae y verifica el Access Token del header Authorization.
    Solo acepta tokens que pertenezcan a un colaborador
    (esColaborador: true). Inyecta req.colaboradorId y
    req.grupoDatos para uso directo en los controladores
    de sincronizacion.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si el token es valido y es de colaborador
    - 401 si no hay token, es invalido o no es de colaborador
    - 403 si el token expiro
    */
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token)
        return error(res, 'No autorizado. Token de colaborador requerido.', null, 401);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded.esColaborador) {
            return error(
                res,
                'Acceso denegado. Esta ruta es exclusiva para colaboradores.',
                null,
                403
            );
        }

        if (!decoded.grupoDatos || Number(decoded.grupoDatos) <= 0) {
            return error(
                res,
                'El token no contiene un grupo de datos valido.',
                null,
                403
            );
        }

        req.colaboradorId = decoded.id;
        req.grupoDatos    = Number(decoded.grupoDatos);
        req.colaborador   = decoded;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError')
            return error(res, 'Token expirado. Vuelve a iniciar sesion.', null, 403);

        return error(res, 'Token invalido o malformado.', null, 401);
    }
}