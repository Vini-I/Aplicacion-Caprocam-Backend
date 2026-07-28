/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoTarea.dto.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoTareas
Descripcion:
DTO para la tabla junction mantenimiento_equipo_tareas.
Vincula un ticket de mantenimiento con una tarea.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const EstadoTareaMantenimiento = Object.freeze({
    PENDIENTE:  'Pendiente',
    REALIZADO:  'Realizado',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class MantenimientoTareaDTO {
    constructor({ id, grupoDatos, mantenimientoEquipoId, tareaId, estadoTarea }) {
        /*
        Descripcion:
        Construye un objeto MantenimientoTareaDTO.

        Parametros:
        - id:                   Identificador unico (opcional en creacion)
        - grupoDatos:           Grupo de datos (requerido)
        - mantenimientoEquipoId: FK a mantenimiento_equipo (requerido)
        - tareaId:              FK a tareas (requerido)
        - estadoTarea:          Estado de la tarea en este mantenimiento
        */
        this.id                    = id;
        this.grupoDatos            = grupoDatos;
        this.mantenimientoEquipoId = mantenimientoEquipoId;
        this.tareaId               = tareaId;
        this.estadoTarea           = estadoTarea ?? EstadoTareaMantenimiento.PENDIENTE;
    }
}