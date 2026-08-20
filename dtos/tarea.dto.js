/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.dto.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: Tareas
Descripcion:
Archivo de transferencia de datos para tareas.
Adaptado a la estructura actual de la tabla tareas en DB.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUMS
//////////////////////////////////////////////////////////
*/

export const CategoriasTarea = Object.freeze({
    PREVENTIVO:  'Preventivo',
    CORRECTIVO:  'Correctivo',
    PREDICTIVO:  'Predictivo',
    EMERGENCIA:  'Emergencia',
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
        codigoTarea,
        nombre,
        descripcion,
        categoria,
        horas,
    }) {
        /*
        Descripcion:
        Construye un objeto TareaDTO con los datos recibidos.

        Parametros:
        - id:          Identificador unico (opcional en creacion)
        - grupoDatos:  Grupo de datos al que pertenece (requerido)
        - codigoTarea: Codigo unico de la tarea por grupo (requerido)
        - nombre:      Nombre de la tarea (requerido)
        - descripcion: Descripcion de la tarea (requerido)
        - categoria:   Categoria (usar CategoriasTarea)
        - horas:       Duracion estimada en horas (requerido, numerico)
        */
        this.id          = id;
        this.grupoDatos  = grupoDatos;
        this.codigoTarea = codigoTarea;
        this.nombre      = nombre;
        this.descripcion = descripcion;
        this.categoria   = categoria;
        this.horas       = Number(horas);
    }
}