/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.model.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Modelo encargado de las operaciones de datos del
modulo de productos. Actualmente utiliza datos
mock mientras se implementa la base de datos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Constantes
import {
    ESTADOS_PRODUCTO
} from "../common/productos.constants.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const productosMock = [
    {
        id: 1,
        nombre: "Alimento Camarón 35%",
        categoria: "Alimentación",
        proveedor: "Biomar",
        cantidad: 150,
        unidad: "kg",
        stockMinimo: 20,
        precioUnidad: 24500,
        entryDate: "2026-06-20",
        expirationDate: "2026-12-20",
        estado: ESTADOS_PRODUCTO.ACTIVO
    },
    {
        id: 2,
        nombre: "Oxitetraciclina",
        categoria: "Antibiótico",
        proveedor: "Farvet",
        cantidad: 35,
        unidad: "L",
        stockMinimo: 5,
        precioUnidad: 18000,
        entryDate: "2026-06-18",
        expirationDate: "2027-01-18",
        estado: ESTADOS_PRODUCTO.ACTIVO
    },
    {
        id: 3,
        nombre: "Probiótico Marino",
        categoria: "Probiótico",
        proveedor: "AquaTech",
        cantidad: 60,
        unidad: "kg",
        stockMinimo: 10,
        precioUnidad: 9500,
        entryDate: "2026-06-15",
        expirationDate: "2027-03-15",
        estado: ESTADOS_PRODUCTO.ACTIVO
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES DE BASE DE DATOS
//////////////////////////////////////////////////////////
*/

export async function obtenerTodosLosProductos() {

    return productosMock.filter(
        producto =>
            producto.estado === ESTADOS_PRODUCTO.ACTIVO
    );

}

export async function obtenerProductoPorId(id) {

    return (
        productosMock.find(
            producto => producto.id === Number(id)
        ) || null
    );

}

export async function crearProducto(datos) {

    const nuevoProducto = {
        id: productosMock.length + 1,
        ...datos,
        estado: ESTADOS_PRODUCTO.ACTIVO
    };

    productosMock.push(nuevoProducto);

    return nuevoProducto;

}

export async function actualizarProducto(id, datos) {

    const indice = productosMock.findIndex(
        producto => producto.id === Number(id)
    );

    if (indice === -1) {

        return null;

    }

    productosMock[indice] = {
        ...productosMock[indice],
        ...datos
    };

    return productosMock[indice];

}

export async function eliminarProducto(id) {

    const producto = productosMock.find(
        producto => producto.id === Number(id)
    );

    if (!producto) {

        return false;

    }

    producto.estado = ESTADOS_PRODUCTO.INACTIVO;

    return true;

}