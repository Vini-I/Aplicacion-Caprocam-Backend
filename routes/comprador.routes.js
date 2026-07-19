/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.routes.js
Autor: Jose Espinoza
Fecha: 17/07/2026
Modulo: Compradores
Descripcion:
Define las rutas HTTP del modulo de compradores bajo el nuevo estandar.
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
import { validarBodyComprador } from '../middlewares/comprador.middleware.js';

// Controladores
import {
    getCompradores,
    getCompradorById,
    createComprador,
    updateComprador,
    deleteComprador
} from '../controllers/comprador.controller.js';

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

router.get('/',           verificarAuth,                        getCompradores);
router.get('/:id',        verificarAuth,                        getCompradorById);
router.post('/',          verificarAuth, validarBodyComprador,  createComprador);

// Ruta especifica de borrado logico arriba de la generica de actualizacion
router.put('/:id/activo', verificarAuth,                        deleteComprador);
router.put('/:id',        verificarAuth, validarBodyComprador,  updateComprador);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;