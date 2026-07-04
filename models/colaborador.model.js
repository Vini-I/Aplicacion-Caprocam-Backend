/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.model.js
Autor: Marco Vásquez
Fecha: 28/06/2026
Modulo: Colaboradores
Descripcion:
Capa de datos del modulo de colaboradores.
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
import { RolColaborador } from '../dtos/colaborador.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let colaboradores = [
    {
        id:        1,
        nombre:    'Marco',
        apellidos: 'Vásquez',
        telefono:  '88887777',
        email:     'marco@empresa.com',
        rol:       RolColaborador.ADMIN,
    },
    {
        id:        2,
        nombre:    'Laura',
        apellidos: 'Mora',
        telefono:  '77776666',
        email:     'laura@empresa.com',
        rol:       RolColaborador.COLABORADOR,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de colaboradores.
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todos los colaboradores.

    Parametros:
    No posee.

    Retorna:
    - colaboradores: Lista con todos los colaboradores.
    */
    return colaboradores;
}

export function findById(id) {
    /*
    Descripcion:
    Busca un colaborador por su ID.

    Parametros:
    - id: ID del colaborador a buscar.

    Retorna:
    - El colaborador encontrado, o null si no existe.
    */
    return colaboradores.find(c => c.id === Number(id)) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo colaborador a la lista.

    Parametros:
    - dto: Objeto ColaboradorDTO con los datos del nuevo colaborador.

    Retorna:
    - nuevo: El colaborador recien creado con su ID asignado.
    */
    const nuevo = { ...dto, id: colaboradores.length + 1 };
    colaboradores.push(nuevo);
    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un colaborador existente por su ID.

    Parametros:
    - id:  ID del colaborador a actualizar.
    - dto: Objeto ColaboradorDTO con los nuevos datos.

    Retorna:
    - El colaborador actualizado, o null si no existe.
    */
    const index = colaboradores.findIndex(c => c.id === Number(id));
    if (index === -1) return null;
    colaboradores[index] = { ...colaboradores[index], ...dto };
    return colaboradores[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina un colaborador por su ID.

    Parametros:
    - id: ID del colaborador a eliminar.

    Retorna:
    - El colaborador eliminado, o null si no existe.
    */
    const index = colaboradores.findIndex(c => c.id === Number(id));
    if (index === -1) return null;
    const eliminado = colaboradores[index];
    colaboradores.splice(index, 1);
    return eliminado;
}