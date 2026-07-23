/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.controller.js
Autor: Brayan / Joan
Fecha: 30/06/2026 adaptado a MySQL: 06/07/2026
Modulo: Inventario
Descripcion:
Controlador CRUD (sin cantidad) para inventario. La cantidad
se maneja desde movimientoInventario.controller.js.  
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
  InventarioCreateDTO,
  InventarioUpdateDTO,
} from "../dtos/inventario.dto.js";

// Servicios (Validaciones)
import { isNumeroValido, isEmpty } from "../services/inventario.service.js";

// Modelos
import * as InventarioModel from "../models/inventario.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
  /*
    Descripcion:
    Valida los campos obligatorios y formatos del body para
    crear un registro de inventario. proveedor_id/proveedorId
    es opcional (FK nullable en la DB).
 
    Parametros:
    - body: Objeto body del request.
    - res:  Objeto response de Express.
 
    Retorna:
    - Objeto error de Express si falla, o null si es correcto.
  */

  if (isEmpty(body.producto_id)) {
    return error(res, "El campo producto_id es requerido.", null, 400);
  }
  const productoIdNum = Number(body.producto_id);
  if (
    Number.isNaN(productoIdNum) ||
    !Number.isInteger(productoIdNum) ||
    productoIdNum <= 0
  ) {
    return error(res, "El producto_id debe ser un entero positivo.", null, 422);
  }

  if (!isNumeroValido(body.stock_minimo)) {
    return error(res, "El stock_minimo debe ser mayor o igual a 0.", null, 422);
  }

  if (!isEmpty(body.proveedor_id)) {
    const idNumero = Number(body.proveedor_id);
    if (
      Number.isNaN(idNumero) ||
      !Number.isInteger(idNumero) ||
      idNumero <= 0
    ) {
      return error(
        res,
        "El proveedor_id debe ser un entero positivo.",
        null,
        422,
      );
    }
  }

  return null;
}

function validarIdParametro(id, res) {
  /*
    Descripcion:
    Valida que el ID recibido como parametro de ruta sea correcto.
 
    Parametros:
    - id:  ID del parametro de ruta.
    - res: Objeto response de Express.
 
    Retorna:
    - Objeto error si es invalido, o null si es correcto.
    */
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
  /*
    Descripcion:
    Controlador para obtener todos los registros de inventario
    activos del grupo_datos actual.
 
    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con la lista de registros de inventario.
  */

  try {
    const grupoDatos = req.user.grupoDatos;
    const data = await InventarioModel.findAll(grupoDatos);
    return exito(res, "Inventario obtenido correctamente.", data);
  } catch (err) {
    return error(res, "Error al obtener el inventario.", err, 500);
  }
}

export async function getInventarioById(req, res) {
  /*
    Descripcion:
    Controlador para obtener un registro de inventario activo
    por su ID.
 
    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el registro de inventario, o 404 si no existe.
    */
  const errId = validarIdParametro(req.params.id, res);
  if (errId) return errId;

  try {
    const grupoDatos = req.user.grupoDatos;
    const item = await InventarioModel.findById(req.params.id, grupoDatos);
    if (!item)
      return error(res, "Registro de inventario no encontrado.", null, 404);
    return exito(res, "Registro de inventario obtenido correctamente.", item);
  } catch (err) {
    return error(res, "Error al obtener el registro de inventario.", err, 500);
  }
}

export async function createInventario(req, res) {
  /*
    Descripcion:
    Controlador para crear un registro de inventario para un
    producto existente. La cantidad inicia siempre en 0.
 
    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
 
    Retorna:
    - 201 con el registro de inventario creado.
    */
  const err = validarCuerpo(req.body, res);
  if (err) return err;

  try {
    const grupoDatos = req.user.grupoDatos;

    const productoExiste = await InventarioModel.verificarProductoExiste(
      req.body.producto_id,
      grupoDatos
    );
    if (!productoExiste) {
      return error(res, "El producto indicado no existe.", null, 400);
    }

    const yaExiste = await InventarioModel.findByProductoId(
      req.body.producto_id,
      grupoDatos
    );
    if (yaExiste) {
      return error(
        res,
        "Ya existe un registro de inventario para ese producto.",
        null,
        409,
      );
    }

    if (!isEmpty(req.body.proveedor_id)) {
      const provExiste = await InventarioModel.verificarProveedorExiste(
        req.body.proveedor_id,
        grupoDatos
      );
      if (!provExiste) {
        return error(res, "El proveedor indicado no existe.", null, 400);
      }
    }

    const dto = new InventarioCreateDTO(req.body);
    const nuevo = await InventarioModel.create(dto, grupoDatos);

    return exito(
      res,
      "Registro de inventario creado correctamente.",
      nuevo,
      201,
    );
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return error(
        res,
        "Ya existe un registro de inventario para ese producto.",
        err,
        409,
      );
    }
    return error(res, "Error al crear el registro de inventario.", err, 500);
  }
}

export async function updateInventario(req, res) {
  /*
    Descripcion:
    Controlador para actualizar proveedor_id y stock_minimo de
    un registro de inventario existente. No permite tocar
    cantidad (ver movimientoInventario.controller.js).
 
    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el registro de inventario actualizado.
    */
  const errId = validarIdParametro(req.params.id, res);
  if (errId) return errId;

  if (!isNumeroValido(req.body.stock_minimo)) {
    return error(res, "El stock_minimo debe ser mayor o igual a 0.", null, 422);
  }

  try {
    const grupoDatos = req.user.grupoDatos;
    
    if (!isEmpty(req.body.proveedor_id)) {
      const idNumero = Number(req.body.proveedor_id);
      if (
        Number.isNaN(idNumero) ||
        !Number.isInteger(idNumero) ||
        idNumero <= 0
      ) {
        return error(
          res,
          "El proveedor_id debe ser un entero positivo.",
          null,
          422,
        );
      }
      const provExiste = await InventarioModel.verificarProveedorExiste(
        idNumero, 
        grupoDatos
      );
      if (!provExiste) {
        return error(res, "El proveedor indicado no existe.", null, 400);
      }
    }
    
    const actual = await InventarioModel.findById(req.params.id, grupoDatos);
    if (!actual)
      return error(res, "Registro de inventario no encontrado.", null, 404);

    const dto = new InventarioUpdateDTO(req.body);
    const actualizado = await InventarioModel.update(req.params.id, dto, grupoDatos);

    return exito(
      res,
      "Registro de inventario actualizado correctamente.",
      actualizado,
    );
  } catch (err) {
    return error(
      res,
      "Error al actualizar el registro de inventario.",
      err,
      500,
    );
  }
}

export async function deleteInventario(req, res) {
  /*
    Descripcion:
    Controlador para desactivar (borrado logico) un registro
    de inventario.
 
    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el registro de inventario eliminado.
    */
  const errId = validarIdParametro(req.params.id, res);
  if (errId) return errId;

  try {
    const grupoDatos = req.user.grupoDatos;
    const eliminado = await InventarioModel.remove(req.params.id, grupoDatos);
    if (!eliminado)
      return error(res, "Registro de inventario no encontrado.", null, 404);
    return exito(
      res,
      "Registro de inventario eliminado correctamente.",
      eliminado,
    );
  } catch (err) {
    return error(res, "Error al eliminar el registro de inventario.", err, 500);
  }
}