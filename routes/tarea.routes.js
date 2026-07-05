/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.routes.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Tareas
Descripcion:
Define las rutas HTTP del modulo de tareas.
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
import { validarBodyTarea } from '../middlewares/tarea.middleware.js';

// Controladores
import {
    getTareas,
    getTareaById,
    createTarea,
    updateTarea,
    deleteTarea,
    getCatalogoTareas,
} from '../controllers/tarea.controller.js';

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

router.get('/', verificarAuth, getTareas);
router.get('/catalogo', verificarAuth, getCatalogoTareas);
router.get('/:id', verificarAuth, getTareaById);
router.post('/', verificarAuth, validarBodyTarea, createTarea);
router.put('/:id', verificarAuth, validarBodyTarea, updateTarea);
router.delete('/:id', verificarAuth, deleteTarea);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;