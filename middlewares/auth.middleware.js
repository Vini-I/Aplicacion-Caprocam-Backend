/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: auth.middleware.js
Autor: Marco Vásquez
Fecha: 28/06/2026
Modulo: Middleware
Descripcion:
Verifica que la peticion viene de un usuario autenticado.
Por ahora es un placeholder para cuando se implemente JWT.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los middlewares de autenticacion del proyecto.
*/

export function verificarAuth(req, res, next) {
    /*
    Descripcion:
    Verifica que el request tenga un token valido.
    Por ahora deja pasar todo (placeholder para JWT).

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si la autenticacion es valida
    - 401 si no hay token (cuando se implemente)
    */

    // TO-DO: validar JWT aqui cuando haya sistema de auth
    // const token = req.headers['authorization'];
    // if (!token) return error(res, 'No autorizado.', null, 401);

    next();
}