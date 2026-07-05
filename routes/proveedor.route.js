/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.route.js
Autor: Oscar Mario Alvarez / Joan
Fecha: 29/6/2026
Modulo: proveedores
Descripcion:
Route encargado de los endpoints en donde se conecta
y valida las peticiones HTTP de proveedores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { Router } from "express";

// Importar en PLURAL (carpeta oficial del proyecto)
import { verificarAuth } from "../middlewares/auth.middleware.js";

// Importar en SINGULAR (carpeta local de proveedores)
import { validarBodyProveedor } from "../middleware/proveedor.middleware.js";

import {
    listarProveedores,
    obtenerProveedor,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
} from "../controllers/proveedor.controller.js";

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

router.get("/", verificarAuth, listarProveedores);
router.get("/:id", verificarAuth, obtenerProveedor);
router.post("/", verificarAuth, validarBodyProveedor, crearProveedor);
router.put("/:id", verificarAuth, validarBodyProveedor, actualizarProveedor);
router.delete("/:id", verificarAuth, eliminarProveedor);

/*
//////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////
*/

export default router;