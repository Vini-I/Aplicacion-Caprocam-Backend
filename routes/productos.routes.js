/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: productos.routes.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Productos
Descripcion:
Define las rutas HTTP del modulo de productos usando el estandar PUT /:id/activo.
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from "../controllers/productos.controller.js";
import { validarProductoRequest } from "../middleware/productos.middleware.js";

const router = Router();

router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);
router.post("/", validarProductoRequest, crearProducto);
router.put("/:id", validarProductoRequest, actualizarProducto);

// Borrado logico ajustado al estandar del lider
router.put("/:id/activo", eliminarProducto);

export default router;