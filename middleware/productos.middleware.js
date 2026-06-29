/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.middleware.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Middleware del modulo de productos.
Actualmente contiene la estructura base para las
validaciones del modulo.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
MIDDLEWARES
//////////////////////////////////////////////////////////
*/

export function validarProductoRequest(
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