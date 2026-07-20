/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.routes.js
Autor: Jose Espinoza
Fecha: 17/07/2026
Modulo: Productos
Descripcion:
Define las rutas HTTP del modulo de productos bajo el nuevo estandar.
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
import { validarBodyProducto } from '../middlewares/producto.middleware.js';

// Controladores
import {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
} from '../controllers/producto.controller.js';

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

router.get('/',           verificarAuth,                       getProductos);
router.get('/:id',        verificarAuth,                       getProductoById);
router.post('/',          verificarAuth, validarBodyProducto,  createProducto);

// Ruta especifica de borrado logico arriba de la generica de actualizacion
router.put('/:id/activo', verificarAuth,                       deleteProducto);
router.put('/:id',        verificarAuth, validarBodyProducto,  updateProducto);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;