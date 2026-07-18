/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.middleware.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Ventas
Descripcion:
Archivo de middleware para el modulo de ventas.
Se encarga de validar los datos recibidos en las solicitudes HTTP.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function validarMantVentas(req, res, next) {
    /*
    Descripcion:
    Valida los datos recibidos en la solicitud para el mantenimiento de ventas.

    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware

    Retorna:
    - next() si los datos son validos
    - 400 si los datos son invalidos
    */

    if (req.user && req.user.grupoDatos) {
        req.body.grupoDatos = req.user.grupoDatos;
    }

    const { finca, estanque, pesoPromedio, tamanoPromedio, cantVendida, precioKilo, fecha, total, colaborador, comprador } = req.body;

    // Validación de campos obligatorios básicos
    if (!finca || String(finca).trim() === '') {
        return error(res, "La finca es obligatoria.", null, 400);
    }

    if (!estanque || String(estanque).trim() === '') {
        return error(res, "El estanque es obligatorio.", null, 400);
    }

    // Validación de numéricos positivos
    if (pesoPromedio === undefined || isNaN(pesoPromedio) || Number(pesoPromedio) <= 0) {
        return error(res, "El peso promedio es obligatorio y debe ser mayor que cero.", null, 400);
    }

    if (tamanoPromedio === undefined || isNaN(tamanoPromedio) || Number(tamanoPromedio) <= 0) {
        return error(res, "El tamaño promedio es obligatorio y debe ser mayor que cero.", null, 400);
    }

    if (cantVendida === undefined || isNaN(cantVendida) || Number(cantVendida) <= 0) {
        return error(res, "La cantidad vendida es obligatoria y debe ser mayor que cero.", null, 400);
    }

    if (precioKilo === undefined || isNaN(precioKilo) || Number(precioKilo) <= 0) {
        return error(res, "El precio por kilo es obligatorio y debe ser mayor que cero.", null, 400);
    }

    if (total === undefined || isNaN(total) || Number(total) <= 0) {
        return error(res, "El total es obligatorio y debe ser mayor que cero.", null, 400);
    }

    // Validación de fecha
    if (!fecha || String(fecha).trim() === '') {
        return error(res, "La fecha es obligatoria.", null, 400);
    }
    const parsedDate = new Date(fecha);
    if (isNaN(parsedDate.getTime())) {
        return error(res, "Debe proveer una fecha válida.", null, 400);
    }

    // Validación de llaves foráneas/texto
    if (!colaborador || String(colaborador).trim() === '') {
        return error(res, "El colaborador es obligatorio.", null, 400);
    }

    if (!comprador || String(comprador).trim() === '') {
        return error(res, "El comprador es obligatorio.", null, 400);
    }

    next();
}