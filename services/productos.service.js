/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.service.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Servicio encargado de la logica de negocio del
modulo de productos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene los imports necesarios para el archivo.

*/

// Modelos
import {
    obtenerTodosLosProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from "../models/productos.model.js";

// DTOs
import {
    productoDTO,
    listaProductosDTO
} from "../dtos/productos.dto.js";

// Constantes
import {
    CATEGORIAS_PRODUCTO
} from "../common/productos.constants.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene la logica de negocio del modulo.

*/

export async function listarProductos() {

    try {

        const productos =
            await obtenerTodosLosProductos();

        return listaProductosDTO(productos);

    } catch (error) {

        throw error;

    }

}

export async function obtenerProducto(id) {

    try {

        validarId(id);

        const producto =
            await obtenerProductoPorId(id);

        if (!producto) {

            return null;

        }

        return productoDTO(producto);

    } catch (error) {

        throw error;

    }

}

export async function registrarProducto(datos) {

    try {

        validarProducto(datos);

        const nuevoProducto =
            await crearProducto(datos);

        return productoDTO(nuevoProducto);

    } catch (error) {

        throw error;

    }

}

export async function editarProducto(id, datos) {

    try {

        validarId(id);

        validarProducto(datos);

        const producto =
            await actualizarProducto(
                id,
                datos
            );

        if (!producto) {

            return null;

        }

        return productoDTO(producto);

    } catch (error) {

        throw error;

    }

}

export async function desactivarProducto(id) {

    try {

        validarId(id);

        return await eliminarProducto(id);

    } catch (error) {

        throw error;

    }

}

/*

//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones privadas utilizadas por el servicio.

*/

function validarProducto(datos) {

    /*
    Descripcion:
    Valida la informacion del producto antes de
    realizar cualquier operacion.

    Parametros:
    - datos: Informacion del producto.

    Retorna:
    No posee.

    */

    if (!datos.nombre?.trim()) {

        throw new Error(
            "El nombre del producto es obligatorio."
        );

    }

    if (!datos.categoria) {

        throw new Error(
            "La categoria es obligatoria."
        );

    }

    if (
        !CATEGORIAS_PRODUCTO.includes(
            datos.categoria
        )
    ) {

        throw new Error(
            "La categoria indicada no es valida."
        );

    }

    if (Number(datos.cantidad) < 0) {

        throw new Error(
            "La cantidad no puede ser negativa."
        );

    }

    if (Number(datos.stockMinimo) < 0) {

        throw new Error(
            "El stock minimo no puede ser negativo."
        );

    }

    if (Number(datos.precioUnidad) <= 0) {

        throw new Error(
            "El precio por unidad debe ser mayor que cero."
        );

    }

}

function validarId(id) {

    /*
    Descripcion:
    Valida que el identificador recibido sea
    valido.

    Parametros:
    - id: Identificador del producto.

    Retorna:
    No posee.

    */

    if (!id || Number(id) <= 0) {

        throw new Error(
            "El identificador del producto no es valido."
        );

    }

}

/*
//////////////////////////////////////////////////////////
PRUEBAS
//////////////////////////////////////////////////////////

GET /api/v1/productos

200 OK

*/