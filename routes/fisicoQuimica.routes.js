/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.routes.js
Autor: Samuel Cerdas
Fecha: 29/07/2026
Modulo: Fisico Quimica
Descripcion:
Define las rutas HTTP del modulo de fisico quimica.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import { Router } from 'express';

// Middlewares
import { verificarAuth } from '../middlewares/auth.middleware.js';
import {
    validarFisicoQuimica
} from '../middlewares/fisicoQuimica.middleware.js';

// Controladores
import {
    obtenerTodasLasLecturas,
    obtenerLecturaPorEstanqueYFecha,
    obtenerLecturaPorId,
    registrarLectura,
    actualizarLectura,
    desactivarLectura
} from '../controllers/fisicoQuimica.controller.js';

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
    obtenerTodasLasLecturas
);

router.get(
    '/estanque/:estanqueId',
    verificarAuth,
    obtenerLecturaPorEstanqueYFecha
);

router.get(
    '/:id',
    verificarAuth,
    obtenerLecturaPorId
);

router.post(
    '/',
    verificarAuth,
    validarFisicoQuimica,
    registrarLectura
);

router.put(
    '/:id',
    verificarAuth,
    validarFisicoQuimica,
    actualizarLectura
);

router.put(
    '/:id/activo',
    verificarAuth,
    desactivarLectura
);

router.delete(
    '/:id',
    verificarAuth,
    desactivarLectura
);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;