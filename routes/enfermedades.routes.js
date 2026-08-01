/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.routes.js
Autor: Isaac Chaves
Fecha: 30/07/2026
Modulo: Enfermedades
Descripcion:
Define las rutas protegidas del modulo de enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
    Router
} from 'express';

import {
    verificarAuth
} from '../middlewares/auth.middleware.js';

import {
    validarGrupoDatosEnfermedad,
    validarBodyEnfermedad,
} from '../middlewares/enfermedades.middleware.js';

import {
    obtenerEnfermedades,
    obtenerEnfermedadPorId,
    crearEnfermedad,
    actualizarEnfermedad,
    eliminarEnfermedad,
    obtenerResumenEnfermedades,
    obtenerCatalogoEnfermedades,
    obtenerCatalogoSeveridades,
} from '../controllers/enfermedades.controller.js';

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

router.use(
    verificarAuth,
    validarGrupoDatosEnfermedad
);

router.get(
    '/',
    obtenerEnfermedades
);

router.get(
    '/resumen',
    obtenerResumenEnfermedades
);

router.get(
    '/catalogos/enfermedades',
    obtenerCatalogoEnfermedades
);

router.get(
    '/catalogos/severidades',
    obtenerCatalogoSeveridades
);

router.get(
    '/:id',
    obtenerEnfermedadPorId
);

router.post(
    '/',
    validarBodyEnfermedad,
    crearEnfermedad
);

router.put(
    '/:id',
    validarBodyEnfermedad,
    actualizarEnfermedad
);

router.delete(
    '/:id',
    eliminarEnfermedad
);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;
