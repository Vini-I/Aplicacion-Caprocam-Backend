/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.routes.js
Autor: Brandon
Fecha: 03/07/2026
Modulo: Trazabilidad
Descripcion:
Define las rutas HTTP del modulo de trazabilidad.
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
import { verificarAuth }      from '../middlewares/auth.middleware.js';
import { validarTrazabilidad } from '../middlewares/trazabilidad.middleware.js';

// Controladores
import {
    obtenerTodosLosRegistros,
    obtenerRegistroPorId,
    registrarRegistro,
    desactivarRegistro,
} from '../controllers/trazabilidad.controller.js';

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

router.get('/',           verificarAuth,                       obtenerTodosLosRegistros);
router.get('/:id',        verificarAuth,                       obtenerRegistroPorId);
router.post('/',          verificarAuth, validarTrazabilidad,  registrarRegistro);
router.put('/:id/activo', verificarAuth,                       desactivarRegistro);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;