/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.middleware.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Middleware del modulo de compradores.
Valida las solicitudes antes de que lleguen
al controlador.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarCompradorRequest(
    req,
    res,
    next
) {

    /*
    Descripcion:
    Middleware encargado de validar que el body
    exista antes de enviar la informacion al
    controlador.

    Parametros:
    - req
    - res
    - next

    Retorna:
    Continua con next() si la solicitud es valida.

    */

    if (!req.body) {

        return res.status(400).json({
            success: false,
            message:
                "La solicitud no contiene informacion."
        });

    }

    next();

}