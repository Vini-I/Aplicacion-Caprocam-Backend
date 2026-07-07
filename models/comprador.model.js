/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.model.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Compradores
Descripcion:
Capa de datos en memoria para compradores.
//////////////////////////////////////////////////////////
*/

let compradores = [
    {
        id: 1,
        nombre: 'AgroComercial S.A.',
        contacto: 'Juan Pérez',
        telefono: '88334455',
        estado: 'ACTIVO'
    },
    {
        id: 2,
        nombre: 'Corporacion Ganadera del Norte',
        contacto: 'Maria Gomez',
        telefono: '77665544',
        estado: 'ACTIVO'
    }
];

export function findAll() {
    return compradores.filter(c => c.estado === 'ACTIVO');
}

export function findById(id) {
    return compradores.find(c => c.id === Number(id) && c.estado === 'ACTIVO') || null;
}

export function create(dto) {
    const nuevo = { ...dto, id: compradores.length + 1, estado: 'ACTIVO' };
    compradores.push(nuevo);
    return nuevo;
}

export function update(id, dto) {
    const index = compradores.findIndex(c => c.id === Number(id) && c.estado === 'ACTIVO');
    if (index === -1) return null;
    compradores[index] = { ...compradores[index], ...dto };
    return compradores[index];
}

export function removeLogicamente(id) {
    const index = compradores.findIndex(c => c.id === Number(id) && c.estado === 'ACTIVO');
    if (index === -1) return null;
    compradores[index].estado = 'INACTIVO';
    return compradores[index];
}