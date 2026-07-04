/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.dto.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Crecimiento
Descripcion:
Archivo de transferencia de datos para crecimiento.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
Caparazon de datos para el modulo de crecimiento.
*/
export class MantCrecimientoDto {
    constructor(id, finca, estanque, pesoActual) {
        /*
        Descripcion:
        Construye un objeto CrecimientoDTO con los datos recibidos.

        Parametros:
        - id: Identificador unico del crecimiento (opcional)
        - finca: Identificador de la finca (requerido)
        - estanque: Identificador del estanque (requerido)
        - pesoActual: Peso actual del pez (requerido)
        */

        this.id = id || null;
        this.finca = finca;
        this.estanque = estanque;
        this.pesoActual = pesoActual;
    }
}