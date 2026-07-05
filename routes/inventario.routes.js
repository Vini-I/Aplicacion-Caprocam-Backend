/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.routes.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Define las rutas HTTP del modulo de inventario.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { Router } from 'express';

// Middlewares
import { verificarAuth } from '../middlewares/auth.middleware.js';
import { validarBodyInventario } from '../middlewares/inventario.middleware.js';

// Controladores
import {
    getInventarios,
    getInventarioById,
    createInventario,
    updateInventario,
    deleteInventario,
} from '../controllers/inventario.controller.js';

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

router.get('/', verificarAuth, getInventarios);
router.get('/:id', verificarAuth, getInventarioById);
router.post('/', verificarAuth, validarBodyInventario, createInventario);
router.put('/:id', verificarAuth, validarBodyInventario, updateInventario);
router.delete('/:id', verificarAuth, deleteInventario);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;