/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.middleware.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Middleware encargado de validar de forma individual los
campos obligatorios de un producto antes del controlador.
//////////////////////////////////////////////////////////
*/

import { CATEGORIAS_PRODUCTO } from "../common/productos.constants.js";

/*
//////////////////////////////////////////////////////////
MIDDLEWARES
//////////////////////////////////////////////////////////
*/

export function validarProductoRequest(req, res, next) {

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

    if (!datos.categoria) {
        return res.status(400).json({
            success: false,
            message: "La categoria es obligatoria."
        });
    }

    if (!CATEGORIAS_PRODUCTO.includes(datos.categoria)) {
        return res.status(400).json({
            success: false,
            message: "La categoria indicada no es valida."
        });
    }

    if (datos.cantidad !== undefined && Number(datos.cantidad) < 0) {
        return res.status(400).json({
            success: false,
            message: "La cantidad no puede ser negativa."
        });
    }

    if (datos.stockMinimo !== undefined && Number(datos.stockMinimo) < 0) {
        return res.status(400).json({
            success: false,
            message: "El stock minimo no puede ser negativo."
        });
    }

    if (datos.precioUnidad !== undefined && Number(datos.precioUnidad) <= 0) {
        return res.status(400).json({
            success: false,
            message: "El precio por unidad debe ser mayor que cero."
        });
    }

    next();
}