/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoTarea.routes.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoTareas
Descripcion:
Define las rutas HTTP del modulo de tareas de mantenimiento.
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
import { verificarAuth }                      from '../middlewares/auth.middleware.js';
import { validarBodyMantenimientoTarea }       from '../middlewares/mantenimientoTarea.middleware.js';

// Controladores
import {
    getTareasByMantenimiento,
    agregarTarea,
    actualizarEstadoTarea,
    eliminarTarea,
} from '../controllers/mantenimientoTarea.controller.js';

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

router.get('/:mantenimientoId/tareas',  verificarAuth,                             getTareasByMantenimiento);
router.post('/tareas',                  verificarAuth, validarBodyMantenimientoTarea, agregarTarea);
router.put('/tareas/:id',               verificarAuth,                             actualizarEstadoTarea);
router.delete('/tareas/:id',            verificarAuth,                             eliminarTarea);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;