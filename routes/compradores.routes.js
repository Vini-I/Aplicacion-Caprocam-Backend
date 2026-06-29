/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.routes.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Define las rutas HTTP del modulo de compradores.
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
    obtenerCompradores,
    obtenerCompradorPorId,
    crearComprador,
    actualizarComprador,
    eliminarComprador
} from "../controllers/compradores.controller.js";

// Middlewares
import {
    validarCompradorRequest
} from "../middleware/compradores.middleware.js";

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
modulo de compradores.

*/

// Obtener todos los compradores
router.get(
    "/",
    obtenerCompradores
);

// Obtener un comprador por id
router.get(
    "/:id",
    obtenerCompradorPorId
);

// Registrar un comprador
router.post(
    "/",
    validarCompradorRequest,
    crearComprador
);

// Actualizar un comprador
router.put(
    "/:id",
    validarCompradorRequest,
    actualizarComprador
);

// Eliminacion logica
router.delete(
    "/:id",
    eliminarComprador
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

GET    /api/v1/compradores

GET    /api/v1/compradores/:id

POST   /api/v1/compradores

PUT    /api/v1/compradores/:id

DELETE /api/v1/compradores/:id

*/