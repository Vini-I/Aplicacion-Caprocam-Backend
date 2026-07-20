/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.routes.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Proveedor Larva
Descripcion:
Rutas HTTP del modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarBodyProveedorLarva } from "../middlewares/proveedorLarva.middleware.js";
import {
    getProveedoresLarva,
    getProveedorLarvaById,
    createProveedorLarva,
    updateProveedorLarva,
    deleteProveedorLarva
} from "../controllers/proveedorLarva.controller.js";

const router = Router();

router.get("/", verificarAuth, getProveedoresLarva);
router.get("/:id", verificarAuth, getProveedorLarvaById);
router.post("/", verificarAuth, validarBodyProveedorLarva, createProveedorLarva);
router.put("/:id", verificarAuth, validarBodyProveedorLarva, updateProveedorLarva);
router.delete("/:id", verificarAuth, deleteProveedorLarva);

export default router;