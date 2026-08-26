/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.controller.js
Autor: Joan Campos-Oscar Mario / Marco Vásquez
Fecha: 25/08/2026
Modulo: Proveedor Larva
//////////////////////////////////////////////////////////
*/

import { ProveedorLarvaDTO } from "../dtos/proveedorLarva.dto.js";
import * as ProveedorLarvaModel from "../models/proveedorLarva.model.js";
import pool from "../config/database.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

export async function getProveedoresLarva(req, res) {
    /*
    Descripcion:
    Maneja la peticion GET para obtener todos los proveedores de larva.
    Permite acceso global si el usuario tiene permisos administrativos.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Respuesta HTTP con la lista de proveedores.
    */
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion, activo
                 FROM proveedores_larva WHERE activo = TRUE AND deleted_at IS NULL`
            );
            return exito(res, "Proveedores de larva obtenidos correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const lista = await ProveedorLarvaModel.findAll(grupoDatos);
        return exito(res, "Proveedores de larva obtenidos correctamente.", lista);
    } catch (err) {
        return error(res, "Error al obtener proveedores de larva.", err);
    }
}

export async function getProveedorLarvaById(req, res) {
    /*
    Descripcion:
    Maneja la peticion GET para obtener un proveedor de larva por su ID.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Respuesta HTTP con el proveedor solicitado.
    */
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT id, uuid, grupo_datos AS grupoDatos, nombre, descripcion, activo
                 FROM proveedores_larva WHERE id = ? AND activo = TRUE AND deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Proveedor de larva no encontrado.", null, 404);
            return exito(res, "Proveedor de larva obtenido correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const item = await ProveedorLarvaModel.findById(req.params.id, grupoDatos);
        if (!item) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener proveedor de larva.", err);
    }
}

export async function createProveedorLarva(req, res) {
    /*
    Descripcion:
    Maneja la peticion POST para crear un nuevo proveedor de larva.
    
    Parametros:
    - req: Objeto de peticion Express con los datos en el body.
    - res: Objeto de respuesta Express.

    Retorna:
    - Respuesta HTTP con el proveedor creado.
    */
    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const dto = new ProveedorLarvaDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        const creado = await ProveedorLarvaModel.create(dto, grupoDatos);
        return exito(res, "Proveedor de larva creado correctamente.", creado, 201);
    } catch (err) {
        return error(res, "Error al crear proveedor de larva.", err);
    }
}

export async function updateProveedorLarva(req, res) {
    /*
    Descripcion:
    Maneja la peticion PUT para actualizar un proveedor de larva existente.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Respuesta HTTP con el proveedor actualizado.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const dto = new ProveedorLarvaDTO({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            grupoDatos,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null
        });

        const actualizado = await ProveedorLarvaModel.update(req.params.id, dto, grupoDatos);
        if (!actualizado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar proveedor de larva.", err);
    }
}

export async function deleteProveedorLarva(req, res) {
    /*
    Descripcion:
    Maneja la peticion DELETE para borrar (logico) un proveedor de larva.
    Evita la eliminacion si el proveedor esta en uso en algun lote.
    
    Parametros:
    - req: Objeto de peticion Express.
    - res: Objeto de respuesta Express.

    Retorna:
    - Respuesta HTTP indicando exito o 409 si esta en uso.
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        
        const enUso = await ProveedorLarvaModel.estaEnUso(req.params.id, grupoDatos);
        if (enUso) {
            return error(res, "No se puede eliminar este proveedor porque está asignado a uno o más lotes de larva.", null, 409);
        }

        const eliminado = await ProveedorLarvaModel.remove(req.params.id, grupoDatos);
        if (!eliminado) return error(res, "Proveedor de larva no encontrado.", null, 404);
        return exito(res, "Proveedor de larva eliminado correctamente.", null);
    } catch (err) {
        return error(res, "Error al eliminar proveedor de larva.", err);
    }
}