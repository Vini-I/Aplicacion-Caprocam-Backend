/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.dto.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Tareas
Descripcion:
Archivo de transferencia de datos para tareas.
Adaptado a la estructura de la tabla tareas en DB.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUMS
//////////////////////////////////////////////////////////
*/

export const CategoriasTarea = Object.freeze({
    PREVENTIVO:  'preventivo',
    CORRECTIVO:  'correctivo',
    PREDICTIVO:  'predictivo',
    EMERGENCIA:  'emergencia',
});

export const EstadoTarea = Object.freeze({
    PENDIENTE:   'Pendiente',
    EN_PROCESO:  'En proceso',
    FINALIZADA:  'Finalizada',
    CANCELADA:   'Cancelada',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class TareaDTO {
    constructor({
        id,
        grupoDatos,
        colaboradorId,
        equipoId,
        nombre,
        descripcion,
        categoria,
        horas,
        estado,
    }) {
        /*
        Descripcion:
        Construye un objeto TareaDTO con los datos recibidos.

        Parametros:
        - id:            Identificador unico (opcional en creacion)
        - grupoDatos:    Grupo de datos al que pertenece (requerido)
        - colaboradorId: FK a colaboradores (opcional)
        - equipoId:      FK a equipos (opcional)
        - nombre:        Nombre de la tarea (requerido)
        - descripcion:   Descripcion de la tarea (requerido)
        - categoria:     Categoria (usar CategoriasTarea)
        - horas:         Duracion estimada en horas (requerido, numerico)
        - estado:        Estado de la tarea (usar EstadoTarea, default Pendiente)
        */
        this.id            = id;
        this.grupoDatos    = grupoDatos;
        this.colaboradorId = colaboradorId ?? null;
        this.equipoId      = equipoId      ?? null;
        this.nombre        = nombre;
        this.descripcion   = descripcion;
        this.categoria     = categoria;
        this.horas         = Number(horas);
        this.estado        = estado ?? EstadoTarea.PENDIENTE;
    }
}