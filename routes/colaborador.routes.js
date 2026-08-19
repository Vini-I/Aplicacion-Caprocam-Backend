/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.routes.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Colaboradores
Descripcion:
Define las rutas HTTP del modulo de colaboradores.
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
import { verificarAuth }                                        from '../middlewares/auth.middleware.js';
import { validarBodyColaboradorPost, validarBodyColaboradorPut } from '../middlewares/colaborador.middleware.js';

// Controladores
import {
    getColaboradores,
    getColaboradorById,
    createColaborador,
    updateColaborador,
    deleteColaborador,
} from '../controllers/colaborador.controller.js';

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

router.get('/',       verificarAuth,                                  getColaboradores);
router.get('/:id',    verificarAuth,                                  getColaboradorById);
router.post('/',      verificarAuth, validarBodyColaboradorPost,      createColaborador);
router.put('/:id',    verificarAuth, validarBodyColaboradorPut,       updateColaborador);
router.delete('/:id', verificarAuth,                                  deleteColaborador);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;