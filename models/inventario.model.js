/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.model.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Capa de datos del modulo de inventario.
Trabaja con datos en memoria (borrado logico).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { UnidadInventario } from '../dtos/inventario.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/

let productos = [
    {
        id:           1,
        codigo:       'ALI-001',
        nombre:       'Alimento Biomar 35%',
        categoria:    'Alimentación',
        cantidad:     250,
        unidad:       UnidadInventario.KILOGRAMOS,
        stockMinimo:  50,
        proveedor:    'Biomar',
        precioUnidad: 1450,
        activo:       true,
    },
    {
        id:           2,
        codigo:       'ALI-002',
        nombre:       'Melaza de caña',
        categoria:    'Alimentación',
        cantidad:     30,
        unidad:       UnidadInventario.LITROS,
        stockMinimo:  50,
        proveedor:    'Trisan',
        precioUnidad: 320,
        activo:       true,
    },
    {
        id:           3,
        codigo:       'TRA-001',
        nombre:       'Cal agrícola',
        categoria:    'Tratamiento',
        cantidad:     120,
        unidad:       UnidadInventario.KILOGRAMOS,
        stockMinimo:  40,
        proveedor:    'Farivet',
        precioUnidad: 850,
        activo:       true,
    },
    {
        id:           4,
        codigo:       'TRA-002',
        nombre:       'Probiótico EM-1',
        categoria:    'Tratamiento',
        cantidad:     15,
        unidad:       UnidadInventario.LITROS,
        stockMinimo:  20,
        proveedor:    'Farivet',
        precioUnidad: 4200,
        activo:       true,
    },
    {
        id:           5,
        codigo:       'QUI-001',
        nombre:       'Oxígeno granulado',
        categoria:    'Químico',
        cantidad:     80,
        unidad:       UnidadInventario.KILOGRAMOS,
        stockMinimo:  30,
        proveedor:    'Trisan',
        precioUnidad: 2100,
        activo:       true,
    },
    {
        id:           6,
        codigo:       'ALI-003',
        nombre:       'Sal mineral',
        categoria:    'Alimentación',
        cantidad:     200,
        unidad:       UnidadInventario.KILOGRAMOS,
        stockMinimo:  60,
        proveedor:    'Trisan',
        precioUnidad: 560,
        activo:       true,
    },
    {
        id:           7,
        codigo:       'FER-001',
        nombre:       'Fertilizante NPK',
        categoria:    'Fertilizante',
        cantidad:     5,
        unidad:       UnidadInventario.KILOGRAMOS,
        stockMinimo:  10,
        proveedor:    'Farivet',
        precioUnidad: 1750,
        activo:       true,
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
    Obtiene todos los productos activos del inventario.

    Parametros:
    No posee.

    Retorna:
    - Array de productos activos.
    */
    return productos.filter(p => p.activo === true);
}

export function findById(id) {
    /*
    Descripcion:
    Busca un producto activo por su ID.

    Parametros:
    - id: ID del producto a buscar.

    Retorna:
    - El producto activo o null.
    */
    const numeroId = Number(id);
    const encontrado = productos.find(p => p.id === numeroId);
    if (!encontrado || encontrado.activo === false) {
        return null;
    }
    return encontrado;
}

export function findByCodigo(codigo) {
    /*
    Descripcion:
    Busca un producto activo por su codigo (case-insensitive).

    Parametros:
    - codigo: Codigo del producto.

    Retorna:
    - El producto activo o null.
    */
    if (!codigo) return null;
    const codigoNormalizado = codigo.trim().toLowerCase();
    return productos.find(p => 
        p.codigo && p.codigo.trim().toLowerCase() === codigoNormalizado && 
        p.activo === true
    ) || null;
}

export function findByCodigoIgnorandoId(codigo, idIgnorado) {
    /*
    Descripcion:
    Busca un producto activo por codigo ignorando un ID especifico.

    Parametros:
    - codigo: Codigo a buscar.
    - idIgnorado: ID que se omitira de la busqueda.

    Retorna:
    - El producto duplicado encontrado o null.
    */
    if (!codigo) return null;
    const codigoNormalizado = codigo.trim().toLowerCase();
    const numeroIgnorado = Number(idIgnorado);
    return productos.find(p => 
        p.codigo && p.codigo.trim().toLowerCase() === codigoNormalizado && 
        p.activo === true && 
        p.id !== numeroIgnorado
    ) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo producto a la lista (con activo = true).

    Parametros:
    - dto: Objeto con los datos del nuevo producto.

    Retorna:
    - El producto creado con su ID asignado.
    */
    const maximoId = productos.reduce((max, p) => Math.max(max, p.id), 0);
    const nuevo = { 
        ...dto, 
        id: maximoId + 1,
        activo: true 
    };
    productos.push(nuevo);
    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza los datos de un producto activo por su ID.

    Parametros:
    - id: ID del producto.
    - dto: Nuevos datos.

    Retorna:
    - El producto actualizado o null.
    */
    const numeroId = Number(id);
    const index = productos.findIndex(p => p.id === numeroId);
    if (index === -1 || productos[index].activo === false) {
        return null;
    }
    productos[index] = { 
        ...productos[index], 
        ...dto, 
        id: productos[index].id 
    };
    return productos[index];
}

export function remove(id) {
    /*
    Descripcion:
    Realiza un borrado logico del producto (activo = false).

    Parametros:
    - id: ID del producto a eliminar.

    Retorna:
    - El producto desactivado o null.
    */
    const numeroId = Number(id);
    const index = productos.findIndex(p => p.id === numeroId);
    if (index === -1 || productos[index].activo === false) {
        return null;
    }
    productos[index].activo = false;
    return productos[index];
}