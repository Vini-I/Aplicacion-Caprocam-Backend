/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.controller.js
Autor: Joan
Fecha: 29/06/2026
Modulo: Proveedores
Descripcion:
Recibe las peticiones HTTP, delega al modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// DTOs
import {
    proveedorDto,
    tipoProductos,
    proveedorDTO,
    proveedoresDTO
} from "../dtos/proveedor.dto.js";

// Servicios (Validaciones)
import {
    isEmpty,
    isTelefonoValido,
    isCorreoValido,
    isTipoProductoValido,
    isIdValido
} from "../services/proveedor.service.js";

// Modelos
import * as proveedorModel from "../models/proveedor.model.js";

// Common
import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

//const grupoDatos = req.user.grupoDatos;

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos obligatorios y formatos del body de proveedores.

    Parametros:
    - body: Objeto body del request.
    - res: Objeto response de Express.

    Retorna:
    - Objeto error de Express si falla, o null si es correcto.
    */
    const errores = [];

    if (isEmpty(body.nombre)) {
        errores.push("El campo nombre es requerido.");
    }
    if (isEmpty(body.tipoProducto)) {
        errores.push("El campo tipoProducto es requerido.");
    }
    if (isEmpty(body.telefono)) {
        errores.push("El campo telefono es requerido.");
    }
    if (!isEmpty(body.telefono) && !isTelefonoValido(body.telefono)) {
        errores.push("Formato de telefono invalido. Debe ser: +506 XXXX-XXXX");
    }
    if (!isEmpty(body.correo) && !isCorreoValido(body.correo)) {
        errores.push("Formato de correo electronico invalido.");
    }
    if (!isEmpty(body.tipoProducto) && !isTipoProductoValido(body.tipoProducto)) {
        errores.push(
            "Tipo de producto invalido. Opciones: " +
                Object.values(tipoProductos).join(", ")
        );
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el proveedor.", errores, 422);
    }
    return null;
}

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida que el ID recibido como parametro sea correcto.

    Parametros:
    - id: ID del parametro.
    - res: Objeto response de Express.

    Retorna:
    - Objeto error si es invalido, o null si es correcto.
    */
    if (!isIdValido(id)) {
        return error(res, "El id debe ser numerico y mayor que cero.", null, 400);
    }
    return null;
}

function generarIniciales(nombre) {
    /*
    Descripcion:
    Genera iniciales basadas en el nombre del proveedor.

    Parametros:
    - nombre: Nombre completo del proveedor.

    Retorna:
    - String de iniciales de 3 letras en mayusculas.
    */
    if (!nombre) return "";
    return nombre
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 3);
}

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

    Retorna:
    - 200 con la lista de proveedores DTO
    */
    const proveedores = proveedorModel.findAll();
    return exito(
        res,
        "Proveedores obtenidos correctamente.",
        proveedoresDTO(proveedores)
    );
}

export function obtenerProveedor(req, res) {
    /*
    Descripcion:
    Controlador para obtener un proveedor activo por su ID.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el proveedor DTO o 404 si no se encuentra
    */
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    const proveedor = proveedorModel.findById(req.params.id);
    if (!proveedor) {
        return error(res, "Proveedor no encontrado.", null, 404);
    }

    return exito(
        res,
        "Proveedor obtenido correctamente.",
        proveedorDTO(proveedor)
    );
}

export function crearProveedor(req, res) {
    /*
    Descripcion:
    Controlador para crear un nuevo proveedor.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 201 con el proveedor creado en formato DTO
    */
    const err = validarCuerpo(req.body, res);
    if (err) return err;

    const existente = proveedorModel.findByName(req.body.nombre);
    if (existente) {
        return error(
            res,
            "Ya existe un proveedor con ese nombre.",
            null,
            409
        );
    }

    const iniciales = generarIniciales(req.body.nombre);
    const bodyConIniciales = { ...req.body, iniciales };

    const dto = new proveedorDto(bodyConIniciales);
    const nuevo = proveedorModel.create(dto);

    return exito(
        res,
        "Proveedor creado correctamente.",
        proveedorDTO(nuevo),
        201
    );
}

export function actualizarProveedor(req, res) {
    /*
    Descripcion:
    Controlador para actualizar un proveedor existente.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el proveedor actualizado en formato DTO
    */
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    const err = validarCuerpo(req.body, res);
    if (err) return err;

    const proveedorActual = proveedorModel.findById(req.params.id);
    if (!proveedorActual) {
        return error(res, "Proveedor no encontrado.", null, 404);
    }

    const existente = proveedorModel.findByNameIgnorandoId(
        req.body.nombre,
        req.params.id
    );
    if (existente) {
        return error(
            res,
            "Ya existe otro proveedor con ese nombre.",
            null,
            409
        );
    }

    const iniciales = generarIniciales(req.body.nombre);
    const bodyConIniciales = { ...req.body, iniciales };

    const dto = new proveedorDto(bodyConIniciales);
    const actualizado = proveedorModel.update(req.params.id, dto);

    return exito(
        res,
        "Proveedor actualizado correctamente.",
        proveedorDTO(actualizado)
    );
}

export function eliminarProveedor(req, res) {
    /*
    Descripcion:
    Controlador para desactivar (borrado logico) un proveedor.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con el proveedor eliminado en formato DTO
    */
    const errId = validarIdParametro(req.params.id, res);
    if (errId) return errId;

    const eliminado = proveedorModel.remove(req.params.id);
    if (!eliminado) {
        return error(res, "Proveedor no encontrado.", null, 404);
    }

    return exito(
        res,
        "Proveedor eliminado correctamente.",
        proveedorDTO(eliminado)
    );
}