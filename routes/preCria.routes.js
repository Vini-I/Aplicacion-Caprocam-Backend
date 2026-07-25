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
import { validarBodyPrecria } from "../middlewares/preCria.middleware.js";
import {
    listarPrecrias,
    obtenerPrecria,
    crearPrecria,
    actualizarPrecria,
    finalizarPrecria,
    eliminarPrecria,
} from "../controllers/preCria.controller.js";

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
 
router.get("/", verificarAuth, listarPrecrias);
router.get("/:id", verificarAuth, obtenerPrecria);
router.post("/", verificarAuth, validarBodyPrecria, crearPrecria);
router.put("/:id", verificarAuth, validarBodyPrecria, actualizarPrecria);
router.post("/:id/finalizar", verificarAuth, finalizarPrecria);
router.delete("/:id", verificarAuth, eliminarPrecria);
 
export default router;