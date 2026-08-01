/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.routes.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoProductos
Descripcion:
Define las rutas HTTP del modulo de productos de mantenimiento.
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
import { verificarAuth }                                                                        from '../middlewares/auth.middleware.js';
import { validarBodyMantenimientoProductoPost, validarBodyMantenimientoProductoPut }            from '../middlewares/mantenimientoProducto.middleware.js';

// Controladores
import {
    getProductosByMantenimiento,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
} from '../controllers/mantenimientoProducto.controller.js';

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

router.get('/:mantenimientoId/productos',  verificarAuth,                                    getProductosByMantenimiento);
router.post('/productos',                  verificarAuth, validarBodyMantenimientoProductoPost, agregarProducto);
router.put('/productos/:id',               verificarAuth, validarBodyMantenimientoProductoPut,  actualizarProducto);
router.delete('/productos/:id',            verificarAuth,                                    eliminarProducto);

/*
//////////////////////////////////////////////////////////
EXPORT
//////////////////////////////////////////////////////////
*/

export default router;