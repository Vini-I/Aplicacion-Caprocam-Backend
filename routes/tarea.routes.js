/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: tarea.routes.js
Autor: Marco Vásquez
Fecha: 22/07/2026
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
import { verificarAuth }                                from '../middlewares/auth.middleware.js';
import { validarBodyTareaPost, validarBodyTareaPut }    from '../middlewares/tarea.middleware.js';

// Controladores
import {
    getTareas,
    getTareaById,
    getCatalogoTareas,
    createTarea,
    updateTarea,
    deleteTarea,
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

router.get('/catalogo', verificarAuth,                      getCatalogoTareas);
router.get('/',         verificarAuth,                      getTareas);
router.get('/:id',      verificarAuth,                      getTareaById);
router.post('/',        verificarAuth, validarBodyTareaPost, createTarea);
router.put('/:id',      verificarAuth, validarBodyTareaPut,  updateTarea);
router.delete('/:id',   verificarAuth,                      deleteTarea);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;