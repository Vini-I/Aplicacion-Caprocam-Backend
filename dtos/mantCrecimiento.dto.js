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
    constructor(
        grupoDatos,
        finca,
        estanque,
        colaborador,
        fechaRegistro,
        pesoActual
    ) {
        /*
        Descripcion:
        Construye un objeto MantCrecimientoDto con los datos recibidos.

        Parametros:
        - grupoDatos: Identificador del grupo de datos.
        - finca: Identificador de la finca.
        - estanque: Identificador del estanque.
        - colaborador: Identificador del colaborador.
        - fechaRegistro: Fecha del registro.
        - pesoActual: Peso actual registrado.
        */

        this.grupoDatos = grupoDatos;
        this.finca = finca;
        this.estanque = estanque;
        this.colaborador = colaborador;
        this.fechaRegistro = fechaRegistro;
        this.pesoActual = pesoActual;
    }
}