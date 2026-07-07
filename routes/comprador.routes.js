/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.routes.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Compradores
Descripcion:
Define las rutas HTTP del modulo de compradores bajo el nuevo estandar.
//////////////////////////////////////////////////////////
*/

import { Router } from 'express';
import { validarBodyComprador } from '../middlewares/comprador.middleware.js';
import {
    getCompradores,
    getCompradorById,
    createComprador,
    updateComprador,
    deleteComprador
} from '../controllers/comprador.controller.js';

const router = Router();

router.get('/', getCompradores);
router.get('/:id', getCompradorById);
router.post('/', validarBodyComprador, createComprador);

// Ruta especifica de borrado logico arriba de la generica de actualizacion
router.put('/:id/activo', deleteComprador);
router.put('/:id', validarBodyComprador, updateComprador);

export default router;