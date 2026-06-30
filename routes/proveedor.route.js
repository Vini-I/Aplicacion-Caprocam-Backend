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

// imports librerias externas
import { Router } from "express";

// imports de validacion de middlewares
import { validarBodyProveedor } from "../middleware/proveedor.middleware.js";

// imports de controladores
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

router.get("/", listarProveedores);
router.get("/:id", obtenerProveedor);
router.post("/", validarBodyProveedor, crearProveedor);
router.put("/:id", validarBodyProveedor, actualizarProveedor);
router.delete("/:id", eliminarProveedor);

/*
//////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////
*/

export default router;