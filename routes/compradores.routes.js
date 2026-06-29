/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.routes.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Define las rutas HTTP del modulo de compradores en el orden correcto.
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import {
    obtenerCompradores,
    obtenerCompradorPorId,
    crearComprador,
    actualizarComprador,
    eliminarComprador
} from "../controllers/compradores.controller.js";
import { validarCompradorRequest } from "../middleware/compradores.middleware.js";

const router = Router();

router.get("/", obtenerCompradores);
router.get("/:id", obtenerCompradorPorId);
router.post("/", validarCompradorRequest, crearComprador);

// IMPORTANTE: Ruta específica arriba para evitar conflictos con /:id
router.put("/:id/activo", eliminarComprador);
router.put("/:id", validarCompradorRequest, actualizarComprador);

export default router;