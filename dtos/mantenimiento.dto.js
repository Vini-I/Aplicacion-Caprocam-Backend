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
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo estado.
*/

export const EstadoMantenimiento = Object.freeze({
    EN_MANTENIMIENTO: 'en_mantenimiento',
    FUERA_DE_SERVICIO: 'fuerda_de_servicio',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de mantenimientos.
*/

export class MantenimientoDTO {
    constructor({ id, fechaHora, creadoPor, titulo, equipo, tarea, descripcion, estado }) {
        /*
        Descripcion:
        Construye un objeto MantenimientoDTO con los datos recibidos.

        Parametros:
        - id:          Identificador unico (opcional en creacion)
        - fechaHora:   Fecha y hora del mantenimiento (requerido, ISO 8601)
        - creadoPor:   Nombre o ID del usuario que crea el ticket (de sesion)
        - titulo:      Titulo del ticket (requerido)
        - equipo:      Equipo al que aplica el mantenimiento (requerido)
        - tarea:       ID de la tarea asociada (requerido)
        - descripcion: Descripcion del problema (requerido)
        - estado:      Estado del ticket (default: abierto)
        */
        this.id = id;
        this.fechaHora = fechaHora;
        this.creadoPor = creadoPor;
        this.titulo = titulo;
        this.equipo = equipo;
        this.tarea = tarea;
        this.descripcion = descripcion;
        this.estado = estado ?? EstadoMantenimiento.EN_MANTENIMIENTO;
    }
}