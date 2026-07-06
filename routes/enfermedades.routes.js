/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.routes.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Define las rutas HTTP del modulo de enfermedades.
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
import { validarBodyEnfermedad } from '../middlewares/enfermedades.middleware.js';

// Controladores
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

Las rutas especiales van antes de /:id para evitar
conflictos con parametros dinamicos.
*/

router.get('/',                         verificarAuth,                         obtenerEnfermedades);
router.get('/resumen',                  verificarAuth,                         obtenerResumenEnfermedades);
router.get('/catalogos/enfermedades',   verificarAuth,                         obtenerCatalogoEnfermedades);
router.get('/catalogos/severidades',    verificarAuth,                         obtenerCatalogoSeveridades);
router.get('/:id',                      verificarAuth,                         obtenerEnfermedadPorId);
router.post('/',                        verificarAuth, validarBodyEnfermedad,  crearEnfermedad);
router.put('/:id',                      verificarAuth, validarBodyEnfermedad,  actualizarEnfermedad);
router.delete('/:id',                   verificarAuth,                         eliminarEnfermedad);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;