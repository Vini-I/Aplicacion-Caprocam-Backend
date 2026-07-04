/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.model.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Crecimiento
Descripcion:
Capa de datos del modulo de crecimiento.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
//////////////////////////////////////////////////////////
*/


/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
import pool from "../config/database.js";
*/


/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let crecimientos = [
    {
        id: '1',
        finca: 'Finca La Perla',
        estanque: 'EST-01',
        pesoActual: 2.5
    },
    {
        id: '2',
        finca: 'Finca La Perla',
        estanque: 'EST-02',
        pesoActual: 3.1
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de crecimiento.
*/
export function findAll() {
    /*
    Descripcion:
    Obtiene todos los registros de crecimiento.
    Parametros:
    No posee.
    Retorna:
    - crecimientos: Lista con todos los registros.
    */
    return crecimientos;
}
export function findById(id) {
    /*
    Descripcion:
    Busca un registro de crecimiento por su ID.
    Parametros:
    - id: ID del registro a buscar.
    Retorna:
    - El registro encontrado, o null si no existe.
    */
    return crecimientos.find(c => c.id === id) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo registro de crecimiento a la lista.
    Parametros:
    - dto: Objeto CrecimientoDTO con los datos del nuevo registro.
    Retorna:
    - nuevo: El registro recien creado.
    */
    const nuevoRegistro = {
        id: dto.id,
        finca: dto.finca,
        estanque: dto.estanque,
        pesoActual: dto.pesoActual
    };
    crecimientos.push(nuevoRegistro);
    return nuevoRegistro;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza los datos de un registro de crecimiento existente.
    Parametros:
    - id: ID del registro a actualizar.
    - dto: Objeto CrecimientoDTO con los nuevos datos.
    Retorna:
    - El registro actualizado, o null si no se encontro.
    */
    const index = crecimientos.findIndex(c => c.id === id);
    if (index === -1) return null;
    crecimientos[index] = {
        ...crecimientos[index],
        finca: dto.finca || crecimientos[index].finca,
        estanque: dto.estanque || crecimientos[index].estanque,
        pesoActual: dto.pesoActual !== undefined ? dto.pesoActual : crecimientos[index].pesoActual
    };
    return crecimientos[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina un registro de crecimiento por su ID.
    Parametros:
    - id: ID del registro a eliminar.
    Retorna:
    - El registro eliminado, o null si no se encontro.
    */
    const index = crecimientos.findIndex(c => c.id === id);
    if (index === -1) return null;
    const eliminado = crecimientos.splice(index, 1);
    return eliminado[0];
}
