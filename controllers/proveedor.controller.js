/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.controller.js
Autor: Joan
Fecha: 29/06/2026
Modulo: Proveedores
Descripcion:
Recibe las peticiones HTTP de proveedores y delega al servicio.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import * as proveedorService from "../services/proveedor.service.js";
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function listarProveedores(req, res) {
    /*
    Descripcion:
    Controlador para obtener todos los proveedores activos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    */
    const proveedores = proveedorService.listarProveedores();
    return exito(res, "Proveedores obtenidos correctamente.", proveedores, 200);
}

export function obtenerProveedor(req, res) {
    /*
    Descripcion:
    Controlador para obtener un proveedor activo por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    */
    const { id } = req.params;
    const proveedor = proveedorService.obtenerProveedor(id);

    if (!proveedor) {
        return error(res, "Proveedor no encontrado.", null, 404);
    }

    return exito(res, "Proveedor obtenido correctamente.", proveedor, 200);
}

export function crearProveedor(req, res) {
    /*
    Descripcion:
    Controlador para crear un nuevo proveedor.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    */
    try {
        const creado = proveedorService.crearProveedor(req.body);
        return exito(res, "Proveedor creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear el proveedor.", err.message, 400);
    }
}

export function actualizarProveedor(req, res) {
    /*
    Descripcion:
    Controlador para actualizar un proveedor existente.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    */
    try {
        const { id } = req.params;
        const actualizado = proveedorService.actualizarProveedor(id, req.body);
        
        if (!actualizado) {
            return error(res, "Proveedor no encontrado.", null, 404);
        }

        return exito(
            res,
            "Proveedor actualizado correctamente.",
            actualizado,
            200
        );
    } catch (err) {
        return error(res, "Error al actualizar el proveedor.", err.message, 400);
    }
}

export function eliminarProveedor(req, res) {
    /*
    Descripcion:
    Controlador para desactivar (borrado logico) un proveedor.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    */
    try {
        const { id } = req.params;
        const eliminado = proveedorService.eliminarProveedor(id);
        return exito(res, "Proveedor eliminado correctamente.", eliminado, 200);
    } catch (err) {
        return error(res, "Error al eliminar el proveedor.", err.message, 400);
    }
}
