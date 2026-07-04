/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.model.js
Autor: Eduard Salas
Fecha: 29/06/2026
Modulo: Densidad Poblacional
Descripcion:
Capa de datos del modulo de Densidad Poblacional.
Por ahora trabaja con datos mock. Cuando exista una
base de datos, solo este archivo cambiara.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { MetodoConteo } from
    '../dtos/densidadPoblacional.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando exista una BD real esta seccion desaparecera.
*/

let densidadesPoblacionales = [
    {
        id: 1,
        finca: 1,
        estanque: 1,
        fecha: '2026-06-28',
        cantidadSiembra: 18,
        areaEstanque: 2500,
        metodoConteo: MetodoConteo.DIRECTO,
        numeroCamarones: 215,
        tirosAtarraya: 5,
        areaAtarraya: 3.5,
        promedioPorTiro: 43,
        sobrevivencia: 92,
        notasConteo: 'Conteo realizado sin novedades.',
    },
    {
        id: 2,
        finca: 2,
        estanque: 2,
        fecha: '2026-06-29',
        cantidadSiembra: 20,
        areaEstanque: 3000,
        metodoConteo: MetodoConteo.DIRECTO,
        numeroCamarones: 248,
        tirosAtarraya: 6,
        areaAtarraya: 4.5,
        promedioPorTiro: 41.3,
        sobrevivencia: 89,
        notasConteo: 'Leve disminucion de sobrevivencia.',
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo.
*/

/**
 * Obtiene todos los registros.
 *
 * @returns {Array}
 */
export function findAll() {
    return densidadesPoblacionales;
}

/**
 * Busca un registro por su ID.
 *
 * @param {number} id ID del registro.
 *
 * @returns {object|null}
 */
export function findById(id) {
    return (
        densidadesPoblacionales.find(
            registro => registro.id === Number(id)
        ) || null
    );
}

/**
 * Agrega un nuevo registro.
 *
 * @param {object} dto DTO del registro.
 *
 * @returns {object}
 */
export function create(dto) {
    const nuevo = {
        ...dto,
        id: densidadesPoblacionales.length + 1,
    };

    densidadesPoblacionales.push(nuevo);

    return nuevo;
}

/**
 * Actualiza un registro existente.
 *
 * @param {number} id  ID del registro.
 * @param {object} dto DTO actualizado.
 *
 * @returns {object|null}
 */
export function update(id, dto) {
    const index = densidadesPoblacionales.findIndex(
        registro => registro.id === Number(id)
    );

    if (index === -1)
        return null;

    densidadesPoblacionales[index] = {
        ...densidadesPoblacionales[index],
        ...dto,
    };

    return densidadesPoblacionales[index];
}

/**
 * Elimina un registro.
 *
 * @param {number} id ID del registro.
 *
 * @returns {object|null}
 */
export function remove(id) {
    const index = densidadesPoblacionales.findIndex(
        registro => registro.id === Number(id)
    );

    if (index === -1)
        return null;

    const eliminado = densidadesPoblacionales[index];

    densidadesPoblacionales.splice(index, 1);

    return eliminado;
}