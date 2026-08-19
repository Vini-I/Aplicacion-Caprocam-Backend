/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.routes.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Rutas HTTP para inventario (sin cantidad; ver movimientoInventario.routes.js)
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
import { 
    validarBodyInventarioCreate,
    validarBodyInventarioUpdate, 
} from '../middlewares/inventario.middleware.js';

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
router.post('/', verificarAuth, validarBodyInventarioCreate, createInventario);
router.put('/:id', verificarAuth, validarBodyInventarioUpdate, updateInventario);
router.delete('/:id', verificarAuth, deleteInventario);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;