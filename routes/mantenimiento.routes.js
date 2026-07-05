/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.routes.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
Descripcion:
Define las rutas HTTP del modulo de mantenimientos.
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
import { validarBodyMantenimiento } from '../middlewares/mantenimiento.middleware.js';

// Controladores
import {
    getMantenimientos,
    getMantenimientoById,
    createMantenimiento,
    updateMantenimiento,
    deleteMantenimiento,
} from '../controllers/mantenimiento.controller.js';

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

router.get('/', verificarAuth, getMantenimientos);
router.get('/:id', verificarAuth, getMantenimientoById);
router.post('/', verificarAuth, validarBodyMantenimiento, createMantenimiento);
router.put('/:id', verificarAuth, validarBodyMantenimiento, updateMantenimiento);
router.delete('/:id', verificarAuth, deleteMantenimiento);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;