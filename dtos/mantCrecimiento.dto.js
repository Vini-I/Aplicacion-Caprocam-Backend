/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.dto.js
Autor: Greivin Arguedas
Fecha: 28/06/2026
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
    constructor({estanqueId, pesoActual, observacion}) {
        /*
        Descripcion:
        Construye un objeto MantCrecimientoDto con los datos recibidos.

        Parametros:
        - estanqueId:  Identificador unico (opcional en creacion)
        - pesoActual:  Peso actual del pez (requerido)
        - observacion: Observacion sobre el crecimiento (opcional)
        */

        this.estanqueId = estanqueId;
        this.pesoActual = pesoActual;
        this.observacion = observacion;
    }
}