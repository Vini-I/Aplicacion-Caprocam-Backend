/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.route.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Siembra
Descripcion:
Define las rutas HTTP para el modulo de siembras.
//////////////////////////////////////////////////////////
*/

import { Router } from "express";
import { verificarAuth } from "../middlewares/auth.middleware.js";
import { validarBodySiembra } from "../middlewares/siembra.middleware.js";
import {
    listarSiembra,
    obtenerSiembraActiva,
    obtenerSiembra,
    crearSiembra,
    crearSiembraConLote,
    actualizarSiembra,
    finalizarSiembra,
    eliminarSiembra
} from "../controllers/siembra.controller.js";

const router = Router();

router.get("/", verificarAuth, listarSiembra);
router.get("/activa", verificarAuth, obtenerSiembraActiva);
router.get("/:id", verificarAuth, obtenerSiembra);
router.post("/", verificarAuth, validarBodySiembra, crearSiembra);
// Crea el lote de larva y la siembra en una sola transaccion atomica
// (evita el "lote huerfano" que dejaban las 2 peticiones separadas).
router.post("/con-lote", verificarAuth, validarBodySiembra, crearSiembraConLote);
router.put("/:id", verificarAuth, validarBodySiembra, actualizarSiembra);
router.post("/:id/finalizar", verificarAuth, finalizarSiembra);
router.delete("/:id", verificarAuth, eliminarSiembra);

export default router;