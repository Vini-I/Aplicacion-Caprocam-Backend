/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.dto.js
Autor: Brandon
Fecha: 29/06/2026
Modulo: Trazabilidad
Descripcion:
Archivo de transferencia de datos para el
modulo de trazabilidad.
Contiene el caparazon de datos requerido
por el backend.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de
trazabilidad.
*/

export class TrazabilidadDTO {

    constructor({
        id,
        grupoDatos,
        fincaId,
        estanqueOrigenId,
        estanqueDestinoId,
        colaboradorId,
        fecha,
        tamano,
        dias,
        pl,
        tipoMovimiento
    }) {

        /*
        Descripcion:
        Construye un objeto TrazabilidadDTO
        con la informacion recibida.

        Parametros:
        - id: Identificador del registro.
        - grupoDatos: Grupo de datos.
        - fincaId: Identificador de la finca.
        - estanqueOrigenId: Estanque origen.
        - estanqueDestinoId: Estanque destino.
        - colaboradorId: Colaborador responsable.
        - fecha: Fecha del movimiento.
        - tamano: Tamaño promedio.
        - dias: Dias de cultivo.
        - pl: Cantidad de post larvas.
        - tipoMovimiento: Tipo de movimiento realizado
        */

        this.id = id;
        this.grupoDatos = grupoDatos;
        this.fincaId = fincaId;
        this.estanqueOrigenId = estanqueOrigenId;
        this.estanqueDestinoId = estanqueDestinoId;
        this.colaboradorId = colaboradorId;
        this.fecha = fecha;
        this.tamano = tamano;
        this.dias = dias;
        this.pl = pl;
        this.tipoMovimiento = tipoMovimiento;
    }

}