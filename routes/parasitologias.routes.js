/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.routes.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Define las rutas HTTP del modulo de parasitologias.
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
import { verificarAuth }             from '../middlewares/auth.middleware.js';
import { validarBodyParasitologia }  from '../middlewares/parasitologias.middleware.js';

// Controladores
import {
    obtenerParasitologias,
    obtenerParasitologiaPorId,
    crearParasitologia,
    actualizarParasitologia,
    eliminarParasitologia,
    obtenerResumenParasitologias,
    obtenerCatalogoParasitos,
} from '../controllers/parasitologias.controller.js';

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

router.get('/',                   verificarAuth,                              obtenerParasitologias);
router.get('/resumen',            verificarAuth,                              obtenerResumenParasitologias);
router.get('/catalogos/parasitos',verificarAuth,                              obtenerCatalogoParasitos);
router.get('/:id',                verificarAuth,                              obtenerParasitologiaPorId);
router.post('/',                  verificarAuth, validarBodyParasitologia,    crearParasitologia);
router.put('/:id',                verificarAuth, validarBodyParasitologia,    actualizarParasitologia);
router.delete('/:id',             verificarAuth,                              eliminarParasitologia);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;