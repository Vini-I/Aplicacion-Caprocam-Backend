/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.routes.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Productos
Descripcion:
Define las rutas HTTP del modulo de productos bajo el nuevo estandar.
//////////////////////////////////////////////////////////
*/

import { Router } from 'express';
import { validarBodyProducto } from '../middlewares/producto.middleware.js';
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} from '../controllers/producto.controller.js';

const router = Router();

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', validarBodyProducto, createProducto);

// Ruta especifica de borrado logico arriba de la generica de actualizacion
router.put('/:id/activo', deleteProducto);
router.put('/:id', validarBodyProducto, updateProducto);

export default router;