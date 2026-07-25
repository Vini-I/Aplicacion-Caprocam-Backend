/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.routes.js
Autor: Brandon
Fecha: 03/07/2026
Modulo: Fisico Quimica
Descripcion:
Define las rutas HTTP del modulo de fisico quimica.
//////////////////////////////////////////////////////////
*/

import { Router } from 'express';

// Middlewares
import { verificarAuth }        from '../middlewares/auth.middleware.js';
import { validarFisicoQuimica } from '../middlewares/fisicoQuimica.middleware.js';

// Controladores
import {
    obtenerTodasLasLecturas,
    obtenerLecturaPorId,
    obtenerLecturaPorEstanqueYFecha,
    registrarLectura,
    actualizarLectura,
} from '../controllers/fisicoQuimica.controller.js';

const router = Router();

router.get('/',                            verificarAuth, obtenerTodasLasLecturas);
router.get('/estanque/:estanqueId',        verificarAuth, obtenerLecturaPorEstanqueYFecha);
router.get('/:id',                         verificarAuth, obtenerLecturaPorId);
router.post('/',                    verificarAuth, validarFisicoQuimica, registrarLectura);
router.put('/:id',                  verificarAuth, validarFisicoQuimica, actualizarLectura);

export default router;