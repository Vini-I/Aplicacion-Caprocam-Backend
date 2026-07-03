/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     alimentacion.routes.js
Autor:       Felipe Salas
Fecha:       29/06/2026
Modulo:      Alimentacion
Descripcion:
Define los endpoints HTTP del modulo de alimentacion
y asigna sus middlewares y controladores.
//////////////////////////////////////////////////////////
*/
 
/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
 
Librerias externas
*/
 
import { Router } from 'express';
 
// Middlewares globales
import { verificarAuth }
    from '../../../middlewares/auth.middleware.js';
 
// Middlewares del modulo
import { validarBodyAlimentacion }
    from '../middlewares/alimentacion.middleware.js';
 
// Controladores
import {
    getAlimentaciones,
    getAlimentacionById,
    createAlimentacion,
    updateAlimentacion,
    deleteAlimentacion,
} from '../controllers/alimentacion.controller.js';
 
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
 
router.get(
    '/',
    verificarAuth,
    getAlimentaciones
);
 
router.get(
    '/:id',
    verificarAuth,
    getAlimentacionById
);
 
router.post(
    '/',
    verificarAuth,
    validarBodyAlimentacion,
    createAlimentacion
);
 
router.put(
    '/:id',
    verificarAuth,
    validarBodyAlimentacion,
    updateAlimentacion
);
 
router.delete(
    '/:id',
    verificarAuth,
    deleteAlimentacion
);
 
/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/
 
export default router;