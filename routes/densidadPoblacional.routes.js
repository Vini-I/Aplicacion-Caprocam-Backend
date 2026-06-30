/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.routes.js
Autor: Eduard Salas
Fecha: 29/06/2026
Modulo: Densidad Poblacional
Descripcion:
Define las rutas HTTP del modulo de Densidad Poblacional.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { Router } from 'express';

// Middlewares
import { verificarAuth } from
    '../middlewares/auth.middleware.js';

import { validarBodyDensidadPoblacional } from
    '../middlewares/densidadPoblacional.middleware.js';

// Controladores
import {
    getDensidades,
    getDensidadById,
    createDensidad,
    updateDensidad,
    deleteDensidad,
} from '../controllers/densidadPoblacional.controller.js';

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

// Obtener todos
router.get(
    '/',
    verificarAuth,
    getDensidades
);

// Obtener por ID
router.get(
    '/:id',
    verificarAuth,
    getDensidadById
);

// Crear
router.post(
    '/',
    verificarAuth,
    validarBodyDensidadPoblacional,
    createDensidad
);

// Actualizar
router.put(
    '/:id',
    verificarAuth,
    validarBodyDensidadPoblacional,
    updateDensidad
);

// Eliminar
router.delete(
    '/:id',
    verificarAuth,
    deleteDensidad
);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;