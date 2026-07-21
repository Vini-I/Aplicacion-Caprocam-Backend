/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: laboratorio.routes.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Laboratorio
Descripcion:
Rutas HTTP del modulo de laboratorio.
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarBodyLaboratorio } from "../middlewares/laboratorio.middleware.js";
import {
    getLaboratorios,
    getLaboratorioById,
    createLaboratorio,
    updateLaboratorio,
    deleteLaboratorio
} from "../controllers/laboratorio.controller.js";
const router = Router();
router.get("/", verificarAuth, getLaboratorios);
router.get("/:id", verificarAuth, getLaboratorioById);
router.post("/", verificarAuth, validarBodyLaboratorio, createLaboratorio);
router.put("/:id", verificarAuth, validarBodyLaboratorio, updateLaboratorio);
router.delete("/:id", verificarAuth, deleteLaboratorio);
export default router;