/*
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
Archivo: trazabilidad.dto.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Trazabilidad
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

export class TrazabilidadDTO {
    constructor({
        fincaId,
        estanqueOrigenId,
        estanqueDestinoId,
        fecha,
        colaboradorId,
        tamano,
        dias,
        pl,
        tipoMovimiento
    }) {
        /*
        Descripcion:
        Construye un objeto TrazabilidadDTO
        con la informacion enviada desde el
        cliente.

        Parametros:
        - fincaId: Identificador de la finca.
        - estanqueOrigenId: Identificador del estanque de origen.
        - estanqueDestinoId: Identificador del estanque de destino.
        - fecha: Fecha del movimiento.
        - colaboradorId: Identificador del colaborador.
        - tamano: Tamaño promedio del camarón.
        - dias: Días de cultivo.
        - pl: Cantidad de postlarvas.
        - tipoMovimiento: Tipo de movimiento realizado.
        */

        this.fincaId = fincaId;
        this.estanqueOrigenId = estanqueOrigenId
        this.estanqueDestinoId = estanqueDestinoId;
        this.fecha = fecha;
        this.colaboradorId = colaboradorId;
        this.tamano = tamano;
        this.dias = dias;
        this.pl = pl;
        this.tipoMovimiento = tipoMovimiento
    }
}  
