/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.middleware.js
Autor: Greivin Arguedas
Fecha: 28/06/2026
Modulo: Crecimiento
Descripcion:
Archivo de middleware para el modulo de crecimiento.
Se encarga de validar los datos recibidos en las solicitudes HTTP.
//////////////////////////////////////////////////////////
*/
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
    
    const { finca, estanque, pesoActual } = req.body;
    if (!finca) {
        return res.status(400).json({
            success: false,
            message: "La finca es obligatoria."
        });
    }
    if (!estanque) {
        return res.status(400).json({
            success: false,
            message: "El estanque es obligatorio."
        });
    }
    if (pesoActual === undefined || pesoActual === null || pesoActual === "") {
        return res.status(400).json({
            success: false,
            message: "El peso actual es obligatorio."
        });
    }
    if (isNaN(pesoActual)) {
        return res.status(400).json({
            success: false,
            message: "El peso actual debe ser numérico."
        });
    }
    if (Number(pesoActual) <= 0) {
        return res.status(400).json({
            success: false,
            message: "El peso actual debe ser mayor que cero."
        });
    }
    if (Number(pesoActual) > 1000) {
        return res.status(400).json({
            success: false,
            message: "El peso actual no puede ser mayor a 1000 gramos."
        });
    }
    next();
}