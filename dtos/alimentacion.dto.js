/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     alimentacion.dto.js
Autor:       Felipe Salas
Fecha:       29/06/2026
Modulo:      Alimentacion
Descripcion:
Objeto de transferencia de datos del modulo de
alimentacion. Solo define que campos se transportan
entre capas. No valida ni realiza ninguna operacion
de negocio.
//////////////////////////////////////////////////////////
*/
 
/*
//////////////////////////////////////////////////////////
ENUMS
//////////////////////////////////////////////////////////
 
Valores permitidos para los campos clave del modulo.
Reflejan exactamente las opciones del frontend.
*/
 
export const MetodoAlimentacion = Object.freeze({
    PLATO: 'Plato',
    BOLEO: 'Boleo',
});
 
export const PresentacionAlimento = Object.freeze({
    POLVO:     'Polvo',
    GRANULADO: 'Granulado',
});
 
export const TipoAlimento = Object.freeze({
    INICIADOR_35: 'Balanceado iniciador 35%',
    ENGORDE_38:   'Balanceado engorde 38%',
    PREMIUM_40:   'Balanceado premium 40%',
    ANTIBIOTICO:  'Antibiótico',
});
 
export const HoraAlimentacion = Object.freeze({
    MANANA: '7:00 AM',
    TARDE:  '3:00 PM',
});
 
/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
 
Caparazon de datos para el modulo de alimentacion.
Recibe los campos, los asigna y los expone.
No valida, no calcula, no accede a la base de datos.
*/
 
export class AlimentacionDTO {
    constructor({
        finca,
        estanque,
        fecha,
        hora,
        metodo,
        cantidadKg,
        presentacion,
        proveedor,
        tipoAlimento,
        observaciones,
    }) {
        /*
        Descripcion:
        Construye un DTO con los datos del registro de
        alimentacion. No realiza ninguna validacion.
 
        Parametros:
        - finca:          Nombre de la finca (requerido)
        - estanque:       Identificador del estanque (requerido)
        - fecha:          Fecha del registro (DD/MM/AAAA, requerido)
        - hora:           Hora de alimentacion (requerido)
        - metodo:         Metodo de alimentacion (MetodoAlimentacion)
        - cantidadKg:     Cantidad suministrada en kg (requerido)
        - presentacion:   Presentacion del alimento (opcional)
        - proveedor:      Proveedor del alimento (opcional)
        - tipoAlimento:   Tipo de alimento (opcional)
        - observaciones:  Notas del registro (opcional)
        */
        this.finca         = finca;
        this.estanque      = estanque;
        this.fecha         = fecha;
        this.hora          = hora;
        this.metodo        = metodo;
        this.cantidadKg    = cantidadKg;
        this.presentacion  = presentacion;
        this.proveedor     = proveedor;
        this.tipoAlimento  = tipoAlimento;
        this.observaciones = observaciones;
    }
}