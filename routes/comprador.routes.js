/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.routes.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Compradores
Descripcion:
Define las rutas HTTP del modulo de compradores.
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
import { verificarAuth }       from '../middlewares/auth.middleware.js';
import { validarBodyComprador } from '../middlewares/comprador.middleware.js';

// Controladores
import {
    getCompradores,
    getCompradorById,
    createComprador,
    updateComprador,
    deleteComprador,
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

router.get('/',       verificarAuth,                        getCompradores);
router.get('/:id',    verificarAuth,                        getCompradorById);
router.post('/',      verificarAuth, validarBodyComprador,  createComprador);
router.put('/:id',    verificarAuth, validarBodyComprador,  updateComprador);
router.delete('/:id', verificarAuth,                        deleteComprador);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;