/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarva.route.js
Autor: Joan
Fecha: 04/07/2026
Modulo: LoteLarva
Descripcion:
Define las rutas HTTP para lotes de larva
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarBodyLote } from "../middlewares/loteLarva.middleware.js";
import {
    listarLotes,
    obtenerLote,
    crearLote,
    actualizarLote,
    eliminarLote,
} from "../controllers/loteLarva.controller.js";

/*
//////////////////////////////////////////////////////////
constantes
//////////////////////////////////////////////////////////
*/
 
const router = Router();

/*
//////////////////////////////////////////////////////////
RUTAS
//////////////////////////////////////////////////////////
*/
 
router.get("/", verificarAuth, listarLotes);
router.get("/:id", verificarAuth, obtenerLote);
router.post("/", verificarAuth, validarBodyLote, crearLote);
router.put("/:id", verificarAuth, validarBodyLote, actualizarLote);
router.delete("/:id", verificarAuth, eliminarLote);
 
export default router;