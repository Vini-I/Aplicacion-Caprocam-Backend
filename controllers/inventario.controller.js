/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.controller.js
Autor: Brayan / Joan
Fecha: 30/06/2026 adaptado a MySQL: 06/07/2026
Modulo: Inventario
Descripcion:
Recibe las peticiones HTTP, delega al modelo directamente
y valida usando el servicio. adaptada para DB:
- Se elimina validacion de codigo (no existe en schema).
- 'proveedor' (string) -> 'proveedorId' (int, opcional).
- Todos los handlers son async/await con try/catch.  
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { InventarioDTO, UnidadInventario } from '../dtos/inventario.dto.js';

// Servicios (Validaciones)
import {
    isNumeroValido,
    isEmpty,
    conStockBajo,
    listaConStockBajo,
} from '../services/inventario.service.js';

// Modelos
import * as InventarioModel from '../models/inventario.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos obligatorios y formatos del body de inventario.
    es sincrona (sin DB).
    - 'codigo' eliminado: no existe en el schema DB.
    - 'proveedorId' es opcional (FK nullable).

    Parametros:
    - body: Objeto body del request.
    - res: Objeto response de Express.

    Retorna:
    - Objeto error si falla, o null si es correcto.
    */
    if (isEmpty(body.nombre) || isEmpty(body.categoria) || isEmpty(body.proveedor)) {
        return error(res, 'Nombre, categoría y proveedor son requeridos.', null, 400);
    }

    if (body.codigo && !isCodigo(body.codigo)) {
        return error(res, 'El código no puede estar vacío.', null, 422);
    }

    if (!Object.values(UnidadInventario).includes(body.unidad)) {
        const opciones = Object.values(UnidadInventario).join(', ');
        return error(res, `Unidad inválida. Opciones: ${opciones}`, null, 422);
    }

    if (!isNumeroValido(body.cantidad)) {
        return error(res, 'La cantidad debe ser mayor o igual a 0.', null, 422);
    }

    if (!isNumeroValido(body.stockMinimo)) {
        return error(res, 'El stock mínimo debe ser mayor o igual a 0.', null, 422);
    }

    if (!isNumeroValido(body.precioUnidad)) {
        return error(res, 'El precio por unidad debe ser mayor o igual a 0.', null, 422);
    }

    if (!isEmpty(body.proveedorId)) {
            const proveedorId = Number(body.proveedorId);
            if (
                Number.isNaN(proveedorId) ||
                !Number.isInteger(proveedorId) ||
                proveedorId <= 0
            ) {
                return error(
                    res,
                    'El proveedorId debe ser un entero positivo.',
                    null,
                    422
                );
            }
    }

    return null;
}

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida que el ID del parametro sea numerico y correcto.

    Parametros:
    - id: ID del parametro.
    - res: Objeto response de Express.

    Retorna:
    - Objeto error si falla, o null si es correcto.
    */
    const numero = Number(id);
    if (Number.isNaN(numero) || numero <= 0) {
        return error(res, 'El id debe ser numerico y mayor que cero.', null, 400);
    }
    return null;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export  function getInventarios(req, res) {
    /*
    Descripcion:
    Obtiene todos los productos activos del inventario con stockBajo.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con la lista de productos
    */
    try {
        const data = listaConStockBajo(await InventarioModel.findAll());
        return exito(
            res, 'Productos de inventario obtenidos correctamente.', data
        );
    } catch (err) {
        return error(
            res, 'Error al obtener el inventario.', err, 500
        );
    }
}

export function getInventarioById(req, res) {
    /*
    Descripcion:
    Obtiene un producto activo por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el producto o 404 si no existe
    - 400 si el ID es invalido
    - 500 si ocurre un error en la DB
    - 404 si el producto no existe
    */
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    try {
        const producto = await InventarioModel.findById(req.params.id);
        if (!producto) {
            return error(res, 'Producto no encontrado.', null, 404);
        }
        return exito(
            res, 'Producto obtenido correctamente.', conStockBajo(producto)
        );
    } catch (err) {
        return error(
            res, 'Error al obtener el producto.', err, 500
        );
    }
}

export  function createInventario(req, res) {
    /*
    Descripcion:
    Crea un nuevo producto de inventario validando codigo unico.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 201 con el producto creado
    */
    const err = validarCuerpo(req.body, res);
    if (err) return err;

try {
        const existente = await InventarioModel.findByNombre(req.body.nombre);
        if (existente) {
            return error(
                res, 'Ya existe un producto con ese nombre.', null, 409
            );
        }

        if (!isEmpty(req.body.proveedorId)) {
            const provExiste = await InventarioModel.verificarProveedorExiste(
                req.body.proveedorId
            );
            if (!provExiste) {
                return error(
                    res, 'El proveedor indicado no existe.', null, 400
                );
            }
        }

        const dto   = new InventarioDTO(req.body);
        const nuevo = await InventarioModel.create(dto);

        return exito(
            res, 'Producto creado correctamente.', conStockBajo(nuevo), 201
        );
    } catch (err) {
        return error(
            res, 'Error al crear el producto.', err, 500
        );
    }
}

export  function updateInventario(req, res) {
    /*
    Descripcion:
    Actualiza un producto existente validando codigo unico.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el producto actualizado
    */
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;

    try {
        const productoActual = await InventarioModel.findById(req.params.id);
        if (!productoActual) {
            return error(res, 'Producto no encontrado.', null, 404);
        }

        const existente = await InventarioModel.findByNombreIgnorandoId(
            req.body.nombre,
            req.params.id
        );
        if (existente) {
            return error(
                res, 'Ya existe otro producto con ese nombre.', null, 409
            );
        }

        if (!isEmpty(req.body.proveedorId)) {
            const provExiste = await InventarioModel.verificarProveedorExiste(
                req.body.proveedorId
            );
            if (!provExiste) {
                return error(
                    res, 'El proveedor indicado no existe.', null, 400
                );
            }
        }

        const dto        = new InventarioDTO(req.body);
        const actualizado = await InventarioModel.update(req.params.id, dto);

        return exito(
            res, 'Producto actualizado correctamente.', conStockBajo(actualizado)
        );
    } catch (err) {
        return error(
            res, 'Error al actualizar el producto.', err, 500
        );
    }
}

export  function deleteInventario(req, res) {
    /*
    Descripcion:
    Desactiva (borrado logico) un producto por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el producto desactivado
    */
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    try {
        const eliminado = await InventarioModel.remove(req.params.id);
        if (!eliminado) {
            return error(res, 'Producto no encontrado.', null, 404);
        }
        return exito(res, 'Producto eliminado correctamente.', eliminado);
    } catch (err) {
        return error(
            res, 'Error al eliminar el producto.', err, 500
        );
    }
}