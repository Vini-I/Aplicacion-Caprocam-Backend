/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.dto.js
Autor: Greivin Arguedas
Fecha: 03/08/2026
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
    constructor(
        grupoDatos,
        finca,
        estanque,
        fechaRegistro,
        pesoActual,
        creadoPorUsuarioId,
        creadoPorColaboradorId
    ) {
        /*
        Descripcion:
        Construye un objeto MantCrecimientoDto con los datos recibidos.

        Parametros:
        - grupoDatos: Identificador del grupo de datos.
        - finca: Identificador de la finca.
        - estanque: Identificador del estanque.
        - fechaRegistro: Fecha del registro.
        - pesoActual: Peso actual registrado.
        - creadoPorUsuarioId: Identificador del usuario que creó el registro.
        - creadoPorColaboradorId: Identificador del colaborador que creó el registro.
        */

        this.grupoDatos = grupoDatos;
        this.finca = finca;
        this.estanque = estanque;
        this.fechaRegistro = fechaRegistro;
        this.pesoActual = pesoActual;
        this.creadoPorUsuarioId     = creadoPorUsuarioId ?? null;
        this.creadoPorColaboradorId = creadoPorColaboradorId ?? null;
    }
}