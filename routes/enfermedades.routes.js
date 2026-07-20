/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.routes.js
Autor: Isaac Chaves
Fecha: 18/07/2026
Modulo: Enfermedades
Descripcion:
Define las rutas HTTP del modulo de enfermedades.
Protege las rutas mediante JWT y valida el grupo de datos
del usuario autenticado.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import { Router } from 'express';

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Middlewares
*/

import { verificarAuth } from '../middlewares/auth.middleware.js';

import {
    validarBodyEnfermedad,
    validarGrupoDatosEnfermedad,
} from '../middlewares/enfermedades.middleware.js';

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Controladores
*/

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

router.get(
    '/',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    obtenerEnfermedades
);

router.get(
    '/resumen',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    obtenerResumenEnfermedades
);

router.get(
    '/catalogos/enfermedades',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    obtenerCatalogoEnfermedades
);

router.get(
    '/catalogos/severidades',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    obtenerCatalogoSeveridades
);

router.get(
    '/:id',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    obtenerEnfermedadPorId
);

router.post(
    '/',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    validarBodyEnfermedad,
    crearEnfermedad
);

router.put(
    '/:id',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    validarBodyEnfermedad,
    actualizarEnfermedad
);

router.delete(
    '/:id',
    verificarAuth,
    validarGrupoDatosEnfermedad,
    eliminarEnfermedad
);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;
