/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.model.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
Descripcion:
Capa de datos del modulo de mantenimientos.
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

import { EstadoMantenimiento } from '../dtos/mantenimiento.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let mantenimientos = [
    {
        id: 1,
        fechaHora: '2026-07-01T08:00:00',
        creadoPor: 'Marco Vásquez',
        titulo: 'Falla en sistema de bombeo',
        equipo: 'Bomba principal estanque 1',
        tarea: 2,
        descripcion: 'La bomba principal presenta ruido inusual y baja presión.',
        estado: EstadoMantenimiento.ABIERTO,
    },
    {
        id: 2,
        fechaHora: '2026-07-02T10:30:00',
        creadoPor: 'Laura Mora',
        titulo: 'Mantenimiento preventivo filtros',
        equipo: 'Sistema de filtrado',
        tarea: 1,
        descripcion: 'Limpieza programada de filtros del sistema de recirculacion.',
        estado: EstadoMantenimiento.EN_PROGRESO,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de mantenimientos.
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todos los mantenimientos.

    Parametros:
    No posee.

    Retorna:
    - mantenimientos: Lista con todos los mantenimientos.
    */
    return mantenimientos;
}

export function findById(id) {
    /*
    Descripcion:
    Busca un mantenimiento por su ID.

    Parametros:
    - id: ID del mantenimiento a buscar.

    Retorna:
    - El mantenimiento encontrado, o null si no existe.
    */
    return mantenimientos.find(m => m.id === Number(id)) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo mantenimiento a la lista.

    Parametros:
    - dto: Objeto MantenimientoDTO con los datos del nuevo mantenimiento.

    Retorna:
    - nuevo: El mantenimiento recien creado con su ID asignado.
    */
    const nuevo = { ...dto, id: mantenimientos.length + 1 };
    mantenimientos.push(nuevo);
    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un mantenimiento existente por su ID.

    Parametros:
    - id:  ID del mantenimiento a actualizar.
    - dto: Objeto MantenimientoDTO con los nuevos datos.

    Retorna:
    - El mantenimiento actualizado, o null si no existe.
    */
    const index = mantenimientos.findIndex(m => m.id === Number(id));
    if (index === -1) return null;
    mantenimientos[index] = { ...mantenimientos[index], ...dto };
    return mantenimientos[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina un mantenimiento por su ID.

    Parametros:
    - id: ID del mantenimiento a eliminar.

    Retorna:
    - El mantenimiento eliminado, o null si no existe.
    */
    const index = mantenimientos.findIndex(m => m.id === Number(id));
    if (index === -1) return null;
    const eliminado = mantenimientos[index];
    mantenimientos.splice(index, 1);
    return eliminado;
}