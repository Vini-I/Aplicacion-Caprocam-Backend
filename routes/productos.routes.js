/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.routes.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Define las rutas HTTP del modulo de productos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene los imports necesarios para el archivo.

*/

// Librerias externas
import { Router } from "express";

// Controladores
import {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from "../controllers/productos.controller.js";

// Middlewares
import {
    validarProductoRequest
} from "../middleware/productos.middleware.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene las constantes utilizadas por el archivo.

*/

const router = Router();

/*
//////////////////////////////////////////////////////////
RUTAS
//////////////////////////////////////////////////////////

Descripcion de seccion

Define los endpoints disponibles para el
modulo de productos.

*/

// Obtener todos los productos
router.get(
    "/",
    obtenerProductos
);

// Obtener un producto por id
router.get(
    "/:id",
    obtenerProductoPorId
);

// Registrar un producto
router.post(
    "/",
    validarProductoRequest,
    crearProducto
);

// Actualizar un producto
router.put(
    "/:id",
    validarProductoRequest,
    actualizarProducto
);

// Eliminacion logica
router.delete(
    "/:id",
    eliminarProducto
);

/*
//////////////////////////////////////////////////////////
EXPORTACION
//////////////////////////////////////////////////////////
*/

export default router;

/*
//////////////////////////////////////////////////////////
PRUEBAS
//////////////////////////////////////////////////////////

GET    /api/v1/productos

GET    /api/v1/productos/:id

POST   /api/v1/productos

PUT    /api/v1/productos/:id

DELETE /api/v1/productos/:id

*/