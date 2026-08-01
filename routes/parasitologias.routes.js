/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.routes.js
Autor: Andres Gutierrez
Fecha: 30/07/2026
Modulo: Parasitologias
Descripcion:
Define las rutas protegidas del modulo de parasitologias.
//////////////////////////////////////////////////////////
*/

import {
    Router
} from "express";

import {
    verificarAuth
} from "../middlewares/auth.middleware.js";

import {
    validarGrupoDatos,
    validarBodyParasitologia
} from "../middlewares/parasitologias.middleware.js";

import {
    obtenerParasitologias,
    obtenerParasitologiaPorId,
    crearParasitologia,
    actualizarParasitologia,
    eliminarParasitologia,
    obtenerResumenParasitologias,
    obtenerCatalogoParasitos
} from "../controllers/parasitologias.controller.js";

const router = Router();

router.use(
    verificarAuth,
    validarGrupoDatos
);

router.get(
    "/",
    obtenerParasitologias
);

router.get(
    "/resumen",
    obtenerResumenParasitologias
);

router.get(
    "/catalogo",
    obtenerCatalogoParasitos
);

router.get(
    "/:id",
    obtenerParasitologiaPorId
);

router.post(
    "/",
    validarBodyParasitologia,
    crearParasitologia
);

router.put(
    "/:id",
    validarBodyParasitologia,
    actualizarParasitologia
);

router.delete(
    "/:id",
    eliminarParasitologia
);

export default router;
