/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.routes.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Procedencia
Descripcion:
Rutas HTTP del modulo de procedencia.
//////////////////////////////////////////////////////////
*/
import { Router } from "express";
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarBodyProcedencia } from "../middlewares/procedencia.middleware.js";
import {
    getProcedencias,
    getProcedenciaById,
    createProcedencia,
    updateProcedencia,
    deleteProcedencia
} from "../controllers/procedencia.controller.js";

const router = Router();

router.get("/", verificarAuth, getProcedencias);
router.get("/:id", verificarAuth, getProcedenciaById);
router.post("/", verificarAuth, validarBodyProcedencia, createProcedencia);
router.put("/:id", verificarAuth, validarBodyProcedencia, updateProcedencia);
router.delete("/:id", verificarAuth, deleteProcedencia);

export default router;