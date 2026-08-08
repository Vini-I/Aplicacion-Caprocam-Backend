/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.controller.js
Autor: Joan Campos
Fecha: 4/08/2026
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
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";


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

    const nombreFinal = body.nombre_empresa ?? body.nombre;
    const tipoFinal = body.tipo_producto ?? body.tipoProducto;
    const correoFinal = body.correo_electronico ?? body.correo;

    if (isEmpty(nombreFinal)) {
        errores.push("El campo nombre es requerido.");
    }
    if (isEmpty(tipoFinal)) {
        errores.push("El campo tipoProducto es requerido.");
    }
    if (isEmpty(body.telefono)) {
        errores.push("El campo telefono es requerido.");
    }
    if (!isEmpty(body.telefono) && !isTelefonoValido(body.telefono)) {
        errores.push("Formato de telefono invalido. Debe contener 8 digitos.");
    }
    if (!isEmpty(correoFinal) && !isCorreoValido(correoFinal)) {
        errores.push("Formato de correo electronico invalido.");
    }
    if (!isEmpty(tipoFinal) && !isTipoProductoValido(tipoFinal)) {
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

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function listarProveedores(req, res) {
    /*
    Descripcion:
    Controlador para obtener todos los proveedores activos.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con la lista de proveedores DTO
    */
    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const proveedores = await proveedorModel.findAll(grupoDatos);
        return exito(
            res,
            "Proveedores obtenidos correctamente.",
            proveedoresDTO(proveedores)
        );
    } catch (err) {
        return error(
            res, "Error al obtener los proveedores.", err, 500
        );
    }
}

export async function obtenerProveedor(req, res) {
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

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const proveedor = await proveedorModel.findById(req.params.id, grupoDatos);
        if (!proveedor) {
            return error(res, "Proveedor no encontrado.", null, 404);
        }
        return exito(
            res,
            "Proveedor obtenido correctamente.",
            proveedorDTO(proveedor)
        );
    } catch (err) {
        return error(
            res, "Error al obtener el proveedor.", err, 500
        );
    }
}

export async function crearProveedor(req, res) {
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

    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);
        
        const nombreFinal = req.body.nombre_empresa ?? req.body.nombre;
        const tipoFinal = req.body.tipo_producto ?? req.body.tipoProducto;
        const correoFinal = req.body.correo_electronico ?? req.body.correo;
        
        const existente = await proveedorModel.findByName(nombreFinal, grupoDatos);
        if (existente) {
            return error(
                res, "Ya existe un proveedor con ese nombre.", null, 409
            );
        }

        const dto = new proveedorDto({
            nombre: nombreFinal,
            tipoProducto: tipoFinal,
            telefono: req.body.telefono,
            correo: correoFinal,
            direccion: req.body.direccion,
            notas: req.body.notas,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });
        const nuevo = await proveedorModel.create(dto, grupoDatos);

        return exito(
            res,
            "Proveedor creado correctamente.",
            proveedorDTO(nuevo),
            201
        );
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return error(
                res, "Ya existe un proveedor con ese nombre.", err, 409
            );
        }
        return error(
            res, "Error al crear el proveedor.", err, 500
        );
    }
}

export async function actualizarProveedor(req, res) {
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

    const errBody = validarCuerpo(req.body, res);
    if (errBody) return errBody;

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const proveedorActual = await proveedorModel.findById(req.params.id, grupoDatos);
        if (!proveedorActual) {
            return error(res, "Proveedor no encontrado.", null, 404);
        }

        const nombreFinal = req.body.nombre_empresa ?? req.body.nombre;
        const tipoFinal = req.body.tipo_producto ?? req.body.tipoProducto;
        const correoFinal = req.body.correo_electronico ?? req.body.correo;

        const existente = await proveedorModel.findByNameIgnorandoId(
            nombreFinal,
            req.params.id, grupoDatos
        );
        if (existente) {
            return error(
                res, "Ya existe otro proveedor con ese nombre.", null, 409
            );
        }

        const dto = new proveedorDto({
            nombre: nombreFinal,
            tipoProducto: tipoFinal,
            telefono: req.body.telefono,
            correo: correoFinal,
            direccion: req.body.direccion,
            notas: req.body.notas,
            creadoPorUsuarioId: null,
            creadoPorColaboradorId: null,
        });
        const actualizado = await proveedorModel.update(req.params.id, grupoDatos ,dto);

        return exito(
            res,
            "Proveedor actualizado correctamente.",
            proveedorDTO(actualizado)
        );
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return error(
                res, "Ya existe un proveedor con ese nombre.", err, 409
            );
        }
        return error(
            res, "Error al actualizar el proveedor.", err, 500
        );
    }
}

export async function eliminarProveedor(req, res) {
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

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);
        const eliminado = await proveedorModel.remove(req.params.id, grupoDatos);
        if (!eliminado) {
            return error(res, "Proveedor no encontrado.", null, 404);
        }
        return exito(
            res,
            "Proveedor eliminado correctamente.",
            proveedorDTO(eliminado)
        );
    } catch (err) {
        return error(
            res, "Error al eliminar el proveedor.", err, 500
        );
    }
}