/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.routes.js
Autor: Marco Vásquez
Fecha: 28/06/2026
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
import { verificarAuth }          from '../middlewares/auth.middleware.js';
import { validarBodyColaborador } from '../middlewares/colaborador.middleware.js';

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

router.get('/',       verificarAuth,                               getColaboradores);
router.get('/:id',    verificarAuth,                               getColaboradorById);
router.post('/',      verificarAuth, validarBodyColaborador,       createColaborador);
router.put('/:id',    verificarAuth, validarBodyColaborador,       updateColaborador);
router.delete('/:id', verificarAuth,                               deleteColaborador);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;