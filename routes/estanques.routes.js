/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.routes.js
Autor: Gerald Alfaro
Fecha: 29/06/2026
Modulo: Estanques
Descripcion:
Define las rutas HTTP del modulo de estanques.
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
import { validarBodyEstanque } from "../middlewares/estanques.middleware.js";

// Controladores
import {
    getEstanques,
    getEstanqueById,
    createEstanque,
    updateEstanque,
    deleteEstanque
} from "../controllers/estanques.controller.js";

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

router.get("/", verificarAuth, getEstanques);
router.get("/:id", verificarAuth, getEstanqueById);
router.post("/", verificarAuth, validarBodyEstanque, createEstanque);
router.put("/:id", verificarAuth, validarBodyEstanque, updateEstanque);
router.delete("/:id", verificarAuth, deleteEstanque);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;