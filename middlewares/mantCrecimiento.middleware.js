/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.middleware.js
Autor: Greivin Arguedas
Fecha: 03/08/2026
Modulo: Crecimiento
Descripcion:
Archivo de middleware para el modulo de crecimiento.
Se encarga de validar los datos recibidos en las solicitudes HTTP.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
Contiene los middlewares de crecimiento del proyecto.
*/
export async function validarMantCrecimiento(req, res, next) {
    /*
    Descripcion:
    Valida los datos recibidos en la solicitud para el mantenimiento de crecimiento.
    Parametros:
    - req:  Objeto request de Express
    - res:  Objeto response de Express
    - next: Funcion para pasar al siguiente middleware
    Retorna:
    - next() si los datos son validos
    - 400 si los datos son invalidos
    */
    
    const { 
        finca, 
        estanque,
        fechaRegistro, 
        pesoActual,
    } = req.body;

    if (!finca) return error(res, "La finca es obligatoria.", null, 400);
    if (!estanque) return error(res, "El estanque es obligatorio.", null, 400);
    if (!fechaRegistro) {
        return error(res, "La fecha de registro es obligatoria.", null, 400);
    }
    const fechaIngresada = new Date(fechaRegistro);
    if (isNaN(fechaIngresada.getTime())) {
        return error(res, "La fecha de registro debe ser válida.", null, 400);
    }
    const ahora = new Date();
    if (fechaIngresada.getTime() > ahora.getTime()) {
        return error(res, "La fecha de registro no puede ser futura.", null, 400);
    }
    if (pesoActual === undefined || pesoActual === null || pesoActual === "") {
        return error(res, "El peso actual es obligatorio.", null, 400);
    }
    if (isNaN(pesoActual)) {
        return error(res, "El peso actual debe ser numérico.", null, 400);
    }
    if (Number(pesoActual) <= 0) {
        return error(res, "El peso actual debe ser mayor que cero.", null, 400);
    }
    if (Number(pesoActual) > 1000) {
        return error(
            res, 
            "El peso actual no puede ser mayor a 1000 gramos.", 
            null, 
            400
        );
    }
    next();
}