/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.routes.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Ventas
Descripcion:
Define las rutas HTTP del modulo de ventas.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { Router } from "express";

// Middlewares
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarMantVentas } from "../middlewares/mantVentas.middleware.js";

// Controladores
import {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
} from "../controllers/mantVentas.controller.js";

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

router.get("/", verificarAuth, getVentas);
router.get("/:id", verificarAuth, getVentaById);
router.post("/", verificarAuth, validarMantVentas, createVenta);
router.put("/:id", verificarAuth, validarMantVentas, updateVenta);
router.delete("/:id", verificarAuth, deleteVenta);

export default router;
