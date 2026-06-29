/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.middleware.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Middleware encargado de validar de forma de forma individual
los campos obligatorios de un comprador antes del controlador.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
MIDDLEWARES
//////////////////////////////////////////////////////////
*/

export function validarCompradorRequest(req, res, next) {

    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "La solicitud no contiene informacion."
        });
    }

    const datos = req.body;

    if (!datos.nombre?.trim()) {
        return res.status(400).json({
            success: false,
            message: "El campo nombre es obligatorio."
        });
    }

    if (!datos.contacto?.trim()) {
        return res.status(400).json({
            success: false,
            message: "El campo contacto es obligatorio."
        });
    }

    if (!datos.telefono?.trim()) {
        return res.status(400).json({
            success: false,
            message: "El campo telefono es obligatorio."
        });
    }

    next();
}