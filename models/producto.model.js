/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.model.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Productos
Descripcion:
Capa de datos en memoria para el modulo de productos.
//////////////////////////////////////////////////////////
*/

let productos = [
    {
        id: 1,
        nombre: 'Fertilizante Foliar H2',
        categoria: 'Fertilizante',
        cantidad: 50,
        stockMinimo: 10,
        precioUnidad: 3500,
        estado: 'ACTIVO'
    },
    {
        id: 2,
        nombre: 'Herbicida Total Max',
        categoria: 'Herbicida',
        cantidad: 20,
        stockMinimo: 5,
        precioUnidad: 7800,
        estado: 'ACTIVO'
    }
];

export function findAll() {
    return productos.filter(p => p.estado === 'ACTIVO');
}

export function findById(id) {
    return productos.find(p => p.id === Number(id) && p.estado === 'ACTIVO') || null;
}

export function create(dto) {
    const nuevo = { ...dto, id: productos.length + 1, estado: 'ACTIVO' };
    productos.push(nuevo);
    return nuevo;
}

export function update(id, dto) {
    const index = productos.findIndex(p => p.id === Number(id) && p.estado === 'ACTIVO');
    if (index === -1) return null;
    productos[index] = { ...productos[index], ...dto };
    return productos[index];
}

export function removeLogicamente(id) {
    const index = productos.findIndex(p => p.id === Number(id) && p.estado === 'ACTIVO');
    if (index === -1) return null;
    productos[index].estado = 'INACTIVO';
    return productos[index];
}