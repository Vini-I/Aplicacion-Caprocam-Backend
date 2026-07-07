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
import { validarBodyLote, validarBodyPrecria } from "../middleware/siembra.middleware.js";
import {
    listarLotes,
    obtenerLote,
    crearLote,
    actualizarLote,
    eliminarLote,
    listarPrecrias,
    obtenerPrecria,
    crearPrecria,
    actualizarPrecria,
    finalizarPrecria,
    eliminarPrecria
} from "../controllers/siembra.controller.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const router = Router();

/*
//////////////////////////////////////////////////////////
RUTAS - LOTES DE LARVA
//////////////////////////////////////////////////////////
*/

router.get("/lotes", verificarAuth, listarLotes);
router.get("/lotes/:id", verificarAuth, obtenerLote);
router.post("/lotes", verificarAuth, validarBodyLote, crearLote);
router.put("/lotes/:id", verificarAuth, validarBodyLote, actualizarLote);
router.delete("/lotes/:id", verificarAuth, eliminarLote);

/*
//////////////////////////////////////////////////////////
RUTAS - PRE-CRIAS
//////////////////////////////////////////////////////////
*/

router.get("/precrias", verificarAuth, listarPrecrias);
router.get("/precrias/:id", verificarAuth, obtenerPrecria);
router.post("/precrias", verificarAuth, validarBodyPrecria, crearPrecria);
router.put("/precrias/:id", verificarAuth, validarBodyPrecria, actualizarPrecria);
router.post("/precrias/:id/finalizar", verificarAuth, finalizarPrecria);
router.delete("/precrias/:id", verificarAuth, eliminarPrecria);

/*
//////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////
*/

export default router;