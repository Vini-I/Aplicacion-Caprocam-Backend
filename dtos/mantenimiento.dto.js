/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.dto.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
Descripcion:
Archivo de transferencia de datos para mantenimientos.
Adaptado a la estructura de la tabla mantenimiento_equipo en DB.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const EstadoTicket = Object.freeze({
    PENDIENTE:  'Pendiente',
    ACTIVO:     'Activo',
    RESUELTO:   'Resuelto',
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
        equipoId,
        creadoPorColaboradorId,
        tituloTicket,
        descripcionTicket,
        estadoTicket,
        estadoEquipo,
    }) {
        /*
        Descripcion:
        Construye un objeto MantenimientoDTO con los datos recibidos.

        Parametros:
        - id:                    Identificador unico (opcional en creacion)
        - grupoDatos:            Grupo de datos al que pertenece (requerido)
        - equipoId:              FK a equipos (requerido)
        - creadoPorColaboradorId: FK a colaboradores (TO-DO: de sesion JWT)
        - tituloTicket:          Titulo del ticket (requerido)
        - descripcionTicket:     Descripcion del problema (requerido)
        - estadoTicket:          Estado del ticket (usar EstadoTicket)
        - estadoEquipo:          Estado del equipo en texto libre (opcional)
        */
        this.id                     = id;
        this.grupoDatos             = grupoDatos;
        this.equipoId               = equipoId;
        this.creadoPorColaboradorId = creadoPorColaboradorId ?? null;
        this.tituloTicket           = tituloTicket;
        this.descripcionTicket      = descripcionTicket;
        this.estadoTicket           = estadoTicket ?? EstadoTicket.PENDIENTE;
        this.estadoEquipo           = estadoEquipo ?? null;
    }
}