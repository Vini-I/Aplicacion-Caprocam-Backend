/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.constants.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Constantes utilizadas por el modulo de productos.
Centraliza valores reutilizables para facilitar
el mantenimiento del codigo.
//////////////////////////////////////////////////////////
*/

/*

//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene las constantes utilizadas por el
modulo de productos.

*/

export const ESTADOS_PRODUCTO = {
    ACTIVO: "ACTIVO",
    INACTIVO: "INACTIVO"
};

export const CATEGORIAS_PRODUCTO = [
    "Alimentación",
    "Tratamiento",
    "Químico",
    "Fertilizante",
    "Antibiótico",
    "Probiótico"
];

export const UNIDADES_MEDIDA = [
    "kg",
    "g",
    "L",
    "mL",
    "unidad"
];

export const MENSAJES_PRODUCTO = {
    PRODUCTO_NO_ENCONTRADO:
        "Producto no encontrado.",
    PRODUCTO_CREADO:
        "Producto creado correctamente.",
    PRODUCTO_ACTUALIZADO:
        "Producto actualizado correctamente.",
    PRODUCTO_ELIMINADO:
        "Producto eliminado correctamente.",
    PRODUCTOS_OBTENIDOS:
        "Productos obtenidos correctamente.",
    PRODUCTO_OBTENIDO:
        "Producto obtenido correctamente."
};