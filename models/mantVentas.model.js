/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.model.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Ventas
Descripcion:
Capa de datos del modulo de ventas.
Por ahora trabaja con datos mock.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { mantVentaDTO } from '../dtos/mantVentas.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/

let ventas = [
    {
        id: '1',
        finca: 'Finca La Perla',
        estanque: 'EST-01',
        pesoPromedio: 15.5,
        tamanoPromedio: 12.0,
        cantVendida: 1000,
        precioKilo: 4500,
        fecha: '2026-06-20',
        total: 4500000,
        colaborador: 'Marco Vásquez',
        comprador: 'Mariscos del Rey'
    },
    {
        id: '2',
        finca: 'Finca El Oasis',
        estanque: 'EST-02',
        pesoPromedio: 14.2,
        tamanoPromedio: 11.4,
        cantVendida: 850,
        precioKilo: 4700,
        fecha: '2026-06-22',
        total: 3995000,
        colaborador: 'Ana Rojas',
        comprador: 'Peces del Pacífico'
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todos los registros de ventas.

    Parametros:
    - Ninguno

    Retorna:
    - Un arreglo con todos los registros de ventas.
    */
    return ventas;
}

export function findById(id) {
    /*
    Descripcion:
    Obtiene un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a buscar

    Retorna:
    - El registro de ventas si se encuentra, o null si no existe.
    */
    return ventas.find(v => v.id === id) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Crea un nuevo registro de ventas.

    Parametros:
    - dto: Objeto de tipo mantVentaDTO con los datos del nuevo registro

    Retorna:
    - El registro de ventas creado
    */
    const nuevaVenta = {
        id: dto.id,
        finca: dto.finca,
        estanque: dto.estanque,
        pesoPromedio: dto.pesoPromedio,
        tamanoPromedio: dto.tamanoPromedio,
        cantVendida: dto.cantVendida,
        precioKilo: dto.precioKilo,
        fecha: dto.fecha,
        total: dto.total,
        colaborador: dto.colaborador,
        comprador: dto.comprador
    };
    ventas.push(nuevaVenta);
    return nuevaVenta;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a actualizar
    - dto: Objeto de tipo mantVentaDTO con los nuevos datos

    Retorna:
    - El registro de ventas actualizado si se encuentra, o null si no existe.
    */
    const index = ventas.findIndex(v => v.id === id);
    if (index === -1) return null;

    ventas[index] = {
        ...ventas[index],
        finca: dto.finca || ventas[index].finca,
        estanque: dto.estanque || ventas[index].estanque,
        pesoPromedio: dto.pesoPromedio !== undefined ? dto.pesoPromedio : ventas[index].pesoPromedio,
        tamanoPromedio: dto.tamanoPromedio !== undefined ? dto.tamanoPromedio : ventas[index].tamanoPromedio,
        cantVendida: dto.cantVendida !== undefined ? dto.cantVendida : ventas[index].cantVendida,
        precioKilo: dto.precioKilo !== undefined ? dto.precioKilo : ventas[index].precioKilo,
        fecha: dto.fecha || ventas[index].fecha,
        total: dto.total !== undefined ? dto.total : ventas[index].total,
        colaborador: dto.colaborador || ventas[index].colaborador,
        comprador: dto.comprador || ventas[index].comprador
    };

    return ventas[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a eliminar

    Retorna:
    - El registro de ventas eliminado si se encuentra, o null si no existe.
    */
    const index = ventas.findIndex(v => v.id === id);
    if (index === -1) return null;

    const eliminado = ventas.splice(index, 1);
    return eliminado[0];
}