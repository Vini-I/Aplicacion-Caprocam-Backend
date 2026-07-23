/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.routes.js
Autor: Andres Gutierrez
Fecha: 18/07/2026
Modulo: Parasitologias
Descripcion:
Define las rutas HTTP protegidas del modulo.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
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

router.get(
    "/",
    verificarAuth,
    validarGrupoDatos,
    obtenerParasitologias
);

router.get(
    "/resumen",
    verificarAuth,
    validarGrupoDatos,
    obtenerResumenParasitologias
);

router.get(
    "/catalogos/parasitos",
    verificarAuth,
    validarGrupoDatos,
    obtenerCatalogoParasitos
);

router.get(
    "/:id",
    verificarAuth,
    validarGrupoDatos,
    obtenerParasitologiaPorId
);

router.post(
    "/",
    verificarAuth,
    validarGrupoDatos,
    validarBodyParasitologia,
    crearParasitologia
);

router.put(
    "/:id",
    verificarAuth,
    validarGrupoDatos,
    validarBodyParasitologia,
    actualizarParasitologia
);

router.delete(
    "/:id",
    verificarAuth,
    validarGrupoDatos,
    eliminarParasitologia
);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;