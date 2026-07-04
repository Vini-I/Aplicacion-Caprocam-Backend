/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.routes.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Crecimiento
Descripcion:
Define las rutas HTTP del modulo de crecimiento.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/
import { Router } from "express";

// Middlewares
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarMantCrecimiento } from "../middlewares/mantCrecimiento.middleware.js";

// Controladores
import {
  getCrecimientos,
  getCrecimientoById,
  createCrecimiento,
  updateCrecimiento,
  deleteCrecimiento,
} from "../controllers/mantCrecimiento.controller.js";

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
*/

router.get("/", verificarAuth, getCrecimientos);
router.get("/:id", verificarAuth, getCrecimientoById);
router.post("/", verificarAuth, validarMantCrecimiento, createCrecimiento);
router.put("/:id", verificarAuth, validarMantCrecimiento, updateCrecimiento);
router.delete("/:id", verificarAuth, deleteCrecimiento);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/
export default router;
