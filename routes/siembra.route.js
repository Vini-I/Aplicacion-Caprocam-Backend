/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.route.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Define las rutas HTTP para lotes de larva y pre-crias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarBodySiembra } from "../middlewares/siembra.middleware.js";
import {
    listarSiembra,
    obtenerSiembra,
    crearSiembra,
    actualizarSiembra,
    eliminarSiembra,
    finalizarSiembra,
} from "../controllers/siembra.controller.js";

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

router.get("/", verificarAuth, listarSiembra);
router.get("/:id", verificarAuth, obtenerSiembra);
router.post("/", verificarAuth, validarBodySiembra, crearSiembra);
router.put("/:id", verificarAuth, validarBodySiembra, actualizarSiembra);
router.post("/:id/finalizar", verificarAuth, finalizarSiembra);
router.delete("/:id", verificarAuth, eliminarSiembra);
 
export default router;