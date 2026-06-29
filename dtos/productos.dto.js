/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.dto.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
DTO encargado de controlar la informacion que
es enviada al frontend desde el modulo de
productos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Este archivo no requiere imports.

*/

/*
//////////////////////////////////////////////////////////
VARIABLES DE ENTORNO
//////////////////////////////////////////////////////////

Descripcion de seccion

Este archivo no utiliza variables de entorno.

*/

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Descripcion de seccion

Este archivo no utiliza constantes.

*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas de transformar la
informacion enviada al frontend.

*/

export function productoDTO(producto) {

    /*
    Descripcion:
    Convierte un producto al formato que sera
    enviado al frontend.

    Parametros:
    - producto: Producto obtenido desde el model.

    Retorna:
    Objeto con los campos permitidos.
    */

    return {
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        proveedor: producto.proveedor,
        cantidad: producto.cantidad,
        unidad: producto.unidad,
        stockMinimo: producto.stockMinimo,
        precioUnidad: producto.precioUnidad,
        entryDate: producto.entryDate,
        expirationDate: producto.expirationDate,
        estado: producto.estado
    };

}

export function listaProductosDTO(productos) {

    /*
    Descripcion:
    Convierte una lista de productos utilizando
    el DTO del producto.

    Parametros:
    - productos: Lista de productos.

    Retorna:
    Lista de productos transformados.
    */

    return productos.map(
        (producto) => productoDTO(producto)
    );

}

/*
//////////////////////////////////////////////////////////
PRUEBAS
//////////////////////////////////////////////////////////

GET /api/v1/productos

200 OK

*/