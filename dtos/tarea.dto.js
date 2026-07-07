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
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo categoria.
*/

export const CategoriasTarea = Object.freeze({
    PREVENTIVO: 'preventivo',
    CORRECTIVO: 'correctivo',
    PREDICTIVO: 'predictivo',
    EMERGENCIA: 'emergencia',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de tareas.
*/

export class TareaDTO {
    constructor({ id, nombre, descripcion, categoria, duracionEstimada }) {
        /*
        Descripcion:
        Construye un objeto TareaDTO con los datos recibidos.

        Parametros:
        - id:               Identificador unico (opcional en creacion)
        - nombre:           Nombre de la tarea (requerido)
        - descripcion:      Descripcion de la tarea (requerido)
        - categoria:        Categoria de la tarea (requerido, usar CategoriasTarea)
        - duracionEstimada: Duracion estimada en horas, solo numerico (requerido)
        */
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.duracionEstimada = Number(duracionEstimada);
    }
}