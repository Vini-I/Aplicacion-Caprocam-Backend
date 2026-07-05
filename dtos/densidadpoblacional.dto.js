/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.dto.js
Autor: Eduard Salas
Fecha: 29/06/2026
Modulo: Densidad Poblacional
Descripcion:
Archivo de transferencia de datos para el modulo de
Densidad Poblacional.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el metodo de conteo.
*/

export const MetodoConteo = Object.freeze({
    DIRECTO: 'Directo',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de
Densidad Poblacional.
*/

export class DensidadPoblacionalDTO {
    constructor({
        id,
        finca,
        estanque,
        fecha,
        cantidadSiembra,
        areaEstanque,
        metodoConteo,
        numeroCamarones,
        tirosAtarraya,
        areaAtarraya,
        promedioPorTiro,
        sobrevivencia,
        notasConteo,
    }) {
        /*
        Descripcion:
        Construye un objeto DensidadPoblacionalDTO con
        los datos recibidos.

        Parametros:
        - id:                 Identificador unico.
        - finca:              ID de la finca.
        - estanque:           ID del estanque.
        - fecha:              Fecha del conteo.
        - cantidadSiembra:    Cantidad sembrada por m².
        - areaEstanque:       Area del estanque.
        - metodoConteo:       Metodo utilizado.
        - numeroCamarones:    Total de camarones.
        - tirosAtarraya:      Cantidad de tiros.
        - areaAtarraya:       Area utilizada.
        - promedioPorTiro:    Promedio por tiro.
        - sobrevivencia:      Porcentaje de sobrevivencia.
        - notasConteo:        Observaciones del conteo.
        */

        this.id               = id;
        this.finca            = finca;
        this.estanque         = estanque;
        this.fecha            = fecha;
        this.cantidadSiembra  = cantidadSiembra;
        this.areaEstanque     = areaEstanque;
        this.metodoConteo     = metodoConteo;
        this.numeroCamarones  = numeroCamarones;
        this.tirosAtarraya    = tirosAtarraya;
        this.areaAtarraya     = areaAtarraya;
        this.promedioPorTiro  = promedioPorTiro;
        this.sobrevivencia    = sobrevivencia;
        this.notasConteo      = notasConteo;
    }
}