/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.dto.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: Mantenimientos
Descripcion:
Archivo de transferencia de datos para mantenimientos.
Adaptado a la estructura actual de mantenimiento_equipo en DB.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const EstadoTicket = Object.freeze({
    EN_ESPERA:        'En espera',
    EN_MANTENIMIENTO: 'En mantenimiento',
    TERMINADO:        'Terminado',
});

export const TipoPersonal = Object.freeze({
    INTERNO:  'TrabajadorInterno',
    EXTERNO:  'TrabajadorExterno',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class MantenimientoDTO {
    constructor({
        id,
        grupoDatos,
        codigoTicket,
        equipoId,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
        fechaMantenimiento,
        tituloTicket,
        descripcionTicket,
        tipoPersonal,
        costoManoObra,
        costoProductos,
        costoTotalEstimado,
        estadoTicket,
    }) {
        /*
        Descripcion:
        Construye un objeto MantenimientoDTO con los datos recibidos.

        Parametros:
        - id:                    Identificador unico (opcional en creacion)
        - grupoDatos:            Grupo de datos (requerido)
        - codigoTicket:          Codigo unico del ticket por grupo (requerido)
        - equipoId:              FK a equipos (requerido)
        - creadoPorUsuarioId:    FK a usuarios - web (opcional)
        - creadoPorColaboradorId: FK a colaboradores - movil (opcional)
        - fechaMantenimiento:    Fecha y hora del mantenimiento (requerido)
        - tituloTicket:          Titulo del ticket (requerido)
        - descripcionTicket:     Descripcion del problema (requerido)
        - tipoPersonal:          Tipo de personal (usar TipoPersonal)
        - costoManoObra:         Costo de mano de obra (default 0)
        - costoProductos:        Costo de productos (default 0)
        - costoTotalEstimado:    Costo total estimado (default 0)
        - estadoTicket:          Estado del ticket (usar EstadoTicket)
        */
        this.id                     = id;
        this.grupoDatos             = grupoDatos;
        this.codigoTicket           = codigoTicket;
        this.equipoId               = equipoId;
        this.creadoPorUsuarioId     = creadoPorUsuarioId     ?? null;
        this.creadoPorColaboradorId = creadoPorColaboradorId ?? null;
        this.fechaMantenimiento     = fechaMantenimiento;
        this.tituloTicket           = tituloTicket;
        this.descripcionTicket      = descripcionTicket;
        this.tipoPersonal           = tipoPersonal           ?? null;
        this.costoManoObra          = Number(costoManoObra)  || 0;
        this.costoProductos         = Number(costoProductos) || 0;
        this.costoTotalEstimado     = Number(costoTotalEstimado) || 0;
        this.estadoTicket           = estadoTicket ?? EstadoTicket.EN_ESPERA;
    }
}