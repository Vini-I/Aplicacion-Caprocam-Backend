/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.controller.js
Autor: Oscar Mario / Marco Vásquez
Fecha: 18/08/2026
Modulo: Inventario
Descripcion:
Controlador CRUD para inventario.
Soporta GETs globales para Administrador Caprocam (22776226).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { InventarioCreateDTO, InventarioUpdateDTO } from "../dtos/inventario.dto.js";

// Servicios y Modelos
import { isNumeroValido, isEmpty } from "../services/inventario.service.js";
import * as InventarioModel from "../models/inventario.model.js";
import pool from "../config/database.js";

// Common
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
    if (isEmpty(body.producto_id) && isEmpty(body.productoId)) {
        return error(res, "El campo producto_id es requerido.", null, 400);
    }
    const productoIdNum = Number(body.producto_id ?? body.productoId);
    if (Number.isNaN(productoIdNum) || !Number.isInteger(productoIdNum) || productoIdNum <= 0) {
        return error(res, "El producto_id debe ser un entero positivo.", null, 422);
    }

    const stockMinimoValor = body.stock_minimo ?? body.stockMinimo;
    if (!isNumeroValido(stockMinimoValor)) {
        return error(res, "El stock_minimo debe ser mayor o igual a 0.", null, 422);
    }

    const proveedorIdValor = body.proveedor_id ?? body.proveedorId;
    if (!isEmpty(proveedorIdValor)) {
        const idNumero = Number(proveedorIdValor);
        if (Number.isNaN(idNumero) || !Number.isInteger(idNumero) || idNumero <= 0) {
            return error(res, "El proveedor_id debe ser un entero positivo.", null, 422);
        }
    }

    return null;
}

function validarIdParametro(id, res) {
    const numero = Number(id);
    if (Number.isNaN(numero) || numero <= 0) {
        return error(res, "El id debe ser numerico y mayor que cero.", null, 400);
    }
    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getInventarios(req, res) {
    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT i.id, i.uuid, i.grupo_datos AS grupoDatos,
                        i.producto_id AS productoId, p.nombre AS nombreProducto,
                        i.proveedor_id AS proveedorId, pr.nombre_empresa AS nombreProveedor,
                        i.cantidad, i.stock_minimo AS stockMinimo, i.activo
                 FROM inventario i
                 LEFT JOIN productos p ON i.producto_id = p.id
                 LEFT JOIN proveedores pr ON i.proveedor_id = pr.id
                 WHERE i.activo = TRUE AND i.deleted_at IS NULL`
            );
            return exito(res, "Inventario obtenido correctamente.", rows);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const data = await InventarioModel.findAll(grupoDatos);
        return exito(res, "Inventario obtenido correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener el inventario.", err, 500);
    }
}

export async function getInventarioById(req, res) {
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    try {
        const user = req.user ?? null;
        const esGlobal = Boolean(user?.accesoGlobal || Number(user?.grupoDatos) === 22776226);

        if (esGlobal && !req.query.grupoDatos) {
            const [rows] = await pool.query(
                `SELECT i.id, i.uuid, i.grupo_datos AS grupoDatos,
                        i.producto_id AS productoId, p.nombre AS nombreProducto,
                        i.proveedor_id AS proveedorId, pr.nombre_empresa AS nombreProveedor,
                        i.cantidad, i.stock_minimo AS stockMinimo, i.activo
                 FROM inventario i
                 LEFT JOIN productos p ON i.producto_id = p.id
                 LEFT JOIN proveedores pr ON i.proveedor_id = pr.id
                 WHERE i.id = ? AND i.activo = TRUE AND i.deleted_at IS NULL`,
                [req.params.id]
            );
            if (rows.length === 0)
                return error(res, "Registro de inventario no encontrado.", null, 404);
            return exito(res, "Registro de inventario obtenido correctamente.", rows[0]);
        }

        const { grupoDatos } = obtenerContextoPeticion(req);
        const item = await InventarioModel.findById(req.params.id, grupoDatos);

        if (!item)
            return error(res, "Registro de inventario no encontrado.", null, 404);

        return exito(res, "Registro de inventario obtenido correctamente.", item);
    } catch (err) {
        return error(res, "Error al obtener el registro de inventario.", err, 500);
    }
}

export async function createInventario(req, res) {
    const err = validarCuerpo(req.body, res);
    if (err) return err;

    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const productoIdFinal = req.body.productoId ?? req.body.producto_id;
        const proveedorIdFinal = req.body.proveedorId ?? req.body.proveedor_id;
        const stockMinimoFinal = req.body.stockMinimo ?? req.body.stock_minimo;

        const productoExiste = await InventarioModel.verificarProductoExiste(
            productoIdFinal,
            grupoDatos
        );
        if (!productoExiste) {
            return error(res, "El producto indicado no existe.", null, 400);
        }

        const yaExiste = await InventarioModel.findByProductoId(productoIdFinal, grupoDatos);
        if (yaExiste) {
            return error(res, "Ya existe un registro de inventario para ese producto.", null, 409);
        }

        if (!isEmpty(proveedorIdFinal)) {
            const provExiste = await InventarioModel.verificarProveedorExiste(
                proveedorIdFinal,
                grupoDatos
            );
            if (!provExiste) {
                return error(res, "El proveedor indicado no existe.", null, 400);
            }
        }

        const dto = new InventarioCreateDTO({
            productoId: productoIdFinal,
            proveedorId: proveedorIdFinal,
            stockMinimo: stockMinimoFinal,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });

        const nuevo = await InventarioModel.create(dto, grupoDatos);
        return exito(res, "Registro de inventario creado correctamente.", nuevo, 201);
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return error(res, "Ya existe un registro de inventario para ese producto.", err, 409);
        }
        return error(res, "Error al crear el registro de inventario.", err, 500);
    }
}

export async function updateInventario(req, res) {
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    const stockMinimoValor = req.body.stockMinimo ?? req.body.stock_minimo;
    if (!isNumeroValido(stockMinimoValor)) {
        return error(res, "El stock_minimo debe ser mayor o igual a 0.", null, 422);
    }

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const proveedorIdFinal = req.body.proveedorId ?? req.body.proveedor_id;

        if (!isEmpty(proveedorIdFinal)) {
            const idNumero = Number(proveedorIdFinal);
            if (Number.isNaN(idNumero) || !Number.isInteger(idNumero) || idNumero <= 0) {
                return error(res, "El proveedor_id debe ser un entero positivo.", null, 422);
            }
            const provExiste = await InventarioModel.verificarProveedorExiste(idNumero, grupoDatos);
            if (!provExiste) {
                return error(res, "El proveedor indicado no existe.", null, 400);
            }
        }

        const actual = await InventarioModel.findById(req.params.id, grupoDatos);
        if (!actual)
            return error(res, "Registro de inventario no encontrado.", null, 404);

        const dto = new InventarioUpdateDTO({
            proveedorId: proveedorIdFinal,
            stockMinimo: stockMinimoValor
        });
        const actualizado = await InventarioModel.update(req.params.id, dto, grupoDatos);

        return exito(res, "Registro de inventario actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el registro de inventario.", err, 500);
    }
}

export async function deleteInventario(req, res) {
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await InventarioModel.remove(req.params.id, grupoDatos);
        if (!eliminado)
            return error(res, "Registro de inventario no encontrado.", null, 404);
        return exito(res, "Registro de inventario eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el registro de inventario.", err, 500);
    }
}