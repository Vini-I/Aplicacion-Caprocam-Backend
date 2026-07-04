/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.routes.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Archivo encargado de definir las rutas del modulo de
enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Librerias externas
import { Router } from "express";

// Controladores
import {
    actualizarEnfermedad,
    crearEnfermedad,
    eliminarEnfermedad,
    limpiarEnfermedades,
    obtenerCatalogoEnfermedades,
    obtenerCatalogoSeveridades,
    obtenerEnfermedadPorId,
    obtenerEnfermedades,
    obtenerResumenEnfermedades
} from "../controllers/enfermedades.controller.js";

// Middlewares
import {
    validarBodyEnfermedad
} from "../middlewares/enfermedades.middleware.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const router = Router();

/*
//////////////////////////////////////////////////////////
RUTAS
//////////////////////////////////////////////////////////

Las rutas especiales van antes de /:id para evitar conflictos.
*/

router.get("/", obtenerEnfermedades);
router.get("/resumen", obtenerResumenEnfermedades);
router.get("/catalogos/enfermedades", obtenerCatalogoEnfermedades);
router.get("/catalogos/severidades", obtenerCatalogoSeveridades);
router.get("/:id", obtenerEnfermedadPorId);

router.post("/", validarBodyEnfermedad, crearEnfermedad);
router.put("/:id", validarBodyEnfermedad, actualizarEnfermedad);

router.delete("/", limpiarEnfermedades);
router.delete("/:id", eliminarEnfermedad);

/*
//////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////
*/

export default router;
