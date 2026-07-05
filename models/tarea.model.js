/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.model.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Tareas
Descripcion:
Capa de datos del modulo de tareas.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { CategoriasTarea } from '../dtos/tarea.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let tareas = [
    {
        id: 1,
        nombre: 'Limpieza de filtros',
        descripcion: 'Limpieza y reemplazo de filtros de agua.',
        categoria: CategoriasTarea.PREVENTIVO,
        duracionEstimada: 2,
    },
    {
        id: 2,
        nombre: 'Revision de bombas',
        descripcion: 'Inspeccion general del sistema de bombeo.',
        categoria: CategoriasTarea.INSPECCION,
        duracionEstimada: 1,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de tareas.
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todas las tareas.

    Parametros:
    No posee.

    Retorna:
    - tareas: Lista con todas las tareas.
    */
    return tareas;
}

export function findById(id) {
    /*
    Descripcion:
    Busca una tarea por su ID.

    Parametros:
    - id: ID de la tarea a buscar.

    Retorna:
    - La tarea encontrada, o null si no existe.
    */
    return tareas.find(t => t.id === Number(id)) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega una nueva tarea a la lista.

    Parametros:
    - dto: Objeto TareaDTO con los datos de la nueva tarea.

    Retorna:
    - nueva: La tarea recien creada con su ID asignado.
    */
    const nueva = { ...dto, id: tareas.length + 1 };
    tareas.push(nueva);
    return nueva;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza una tarea existente por su ID.

    Parametros:
    - id:  ID de la tarea a actualizar.
    - dto: Objeto TareaDTO con los nuevos datos.

    Retorna:
    - La tarea actualizada, o null si no existe.
    */
    const index = tareas.findIndex(t => t.id === Number(id));
    if (index === -1) return null;
    tareas[index] = { ...tareas[index], ...dto };
    return tareas[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina una tarea por su ID.

    Parametros:
    - id: ID de la tarea a eliminar.

    Retorna:
    - La tarea eliminada, o null si no existe.
    */
    const index = tareas.findIndex(t => t.id === Number(id));
    if (index === -1) return null;
    const eliminada = tareas[index];
    tareas.splice(index, 1);
    return eliminada;
}