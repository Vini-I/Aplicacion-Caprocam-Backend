/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.dto.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Fisico Quimica
Descripcion:
DTO encargado de recibir la informacion enviada
desde el cliente y devolver solamente los campos
que necesita el modelo.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES DTO
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas de transformar la
informacion recibida desde el cliente.

*/

export class fisicoQuimicaDto {
    constructor({
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigeno
    }) {
         /*
        Descripcion:
        Construye un objeto FisicoQuimicaDTO
        con la informacion enviada desde el
        cliente.

        Parametros:
        - fincaId: Identificador de la finca.
        - estanqueId: Identificador del estanque.
        - fecha: Fecha de la medicion.
        - ph: Valor del potencial de hidrogeno.
        - salinidad: Valor de la salinidad.
        - temperatura: Valor de la temperatura.
        - oxigenoDisuelto: Valor del oxigeno disuelto.
        */

        this.fincaId = fincaId;
        this.estanqueId = estanqueId;
        this.fecha = fecha;
        this.ph = ph;
        this.salinidad = salinidad;
        this.temperatura = temperatura;
        this.oxigeno = oxigeno;
    }
}