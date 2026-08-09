/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.controller.js
Autor: Wendy Martinez
Fecha: 06/07/2026
Modulo: Alimentacion
Descripcion:
Recibe las peticiones HTTP, delega al modelo,
y devuelve la respuesta al cliente.
Aplica obtenerContextoPeticion para grupo_datos y creadores
(soporta tanto Usuarios Web como Colaboradores APK).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { AlimentacionDTO, MetodoAlimentacion, HoraAlimentacion } from "../dtos/alimentacion.dto.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Servicios
*/

import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroOpcionalMayorIgualCero,
    isFechaValida,
    isMetodoAlimentacion,
    isHoraAlimentacion,
    isIdValido,
    maxLength
} from "../services/alimentacion.service.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as AlimentacionModel from "../models/alimentacion.model.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { exito, error } from "../common/respuestaJson.js";

// Common
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas por las funciones
principales del controller.
*/

function obtenerIdFinca(body) {
    /*
    Descripcion:
    Obtiene el id de finca recibido en el body, aceptando
    los alias idFinca, fincaId o finca.

    Parametros:
    - body: Campos recibidos en el body de la peticion.

    Retorna:
    - Valor recibido para el id de finca.
    */

    if (!isEmpty(body.idFinca)) {
        return body.idFinca;
    }

    if (!isEmpty(body.fincaId)) {
        return body.fincaId;
    }

    return body.finca;
}

function obtenerIdEstanque(body) {
    /*
    Descripcion:
    Obtiene el id de estanque recibido en el body, aceptando
    los alias idEstanque, estanqueId o estanque.

    Parametros:
    - body: Campos recibidos en el body de la peticion.

    Retorna:
    - Valor recibido para el id de estanque.
    */

    if (!isEmpty(body.idEstanque)) {
        return body.idEstanque;
    }

    if (!isEmpty(body.estanqueId)) {
        return body.estanqueId;
    }

    return body.estanque;
}

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - body: Campos recibidos en el body de la peticion.
    - res: Objeto response de Express.

    Retorna:
    - Respuesta de error si existen datos invalidos.
    - null si todos los datos son validos.
    */

    const errores = [];

    const idFinca = obtenerIdFinca(body);
    const idEstanque = obtenerIdEstanque(body);

    if (isEmpty(idFinca)) {
        errores.push("El campo idFinca es requerido.");
    } else if (!isNumeroMayorCero(idFinca)) {
        errores.push("El campo idFinca debe ser numerico y mayor que cero.");
    }

    if (isEmpty(idEstanque)) {
        errores.push("El campo idEstanque es requerido.");
    } else if (!isNumeroMayorCero(idEstanque)) {
        errores.push("El campo idEstanque debe ser numerico y mayor que cero.");
    }

    if (isEmpty(body.fecha)) {
        errores.push("El campo fecha es requerido.");
    } else if (!isFechaValida(body.fecha)) {
        errores.push("El campo fecha no es una fecha valida.");
    }

    if (isEmpty(body.cantidadKg)) {
        errores.push("El campo cantidadKg es requerido.");
    } else if (!isNumeroMayorCero(body.cantidadKg)) {
        errores.push("El campo cantidadKg debe ser numerico y mayor que cero.");
    }

    if (isEmpty(body.hora)) {
        errores.push("El campo hora es requerido.");
    } else if (!isHoraAlimentacion(body.hora)) {
        errores.push("Hora invalida. Opciones: " + Object.values(HoraAlimentacion).join(", "));
    }

    if (isEmpty(body.metodo)) {
        errores.push("El campo metodo es requerido.");
    } else if (!isMetodoAlimentacion(body.metodo)) {
        errores.push("Metodo invalido. Opciones: " + Object.values(MetodoAlimentacion).join(", "));
    }

    if (!isNumeroOpcionalMayorIgualCero(body.idColaborador)) {
        errores.push("El campo idColaborador debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.idProveedor)) {
        errores.push("El campo idProveedor debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.idProducto)) {
        errores.push("El campo idProducto debe ser numerico y mayor o igual que cero.");
    }

    if (!maxLength(body.observaciones, 1000)) {
        errores.push("El campo observaciones no puede superar los 1000 caracteres.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el registro de alimentacion.", errores, 422);
    }

    return null;
}

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida que el parametro id recibido por la URL sea numerico
    y mayor que cero.

    Parametros:
    - id: ID recibido en req.params.
    - res: Objeto response de Express.

    Retorna:
    - Respuesta de error si el id es invalido.
    - null si el id es valido.
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

Contiene las funciones exportables que manejan cada ruta
del modulo de alimentacion.
*/

export async function getAlimentaciones(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de alimentacion activos desde MySQL.
    Permite filtrar por idFinca, idEstanque y grupoDatos
    mediante query params.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de registros.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const filtros = {
            idFinca: req.query.idFinca,
            idEstanque: req.query.idEstanque,
            grupoDatos: grupoDatos
        };

        const data = await AlimentacionModel.findAll(filtros);

        return exito(res, "Registros de alimentacion obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los registros de alimentacion.", err, 500);
    }
}

export async function getAlimentacionById(req, res) {
    /*
    Descripcion:
    Obtiene un registro de alimentacion por su ID desde MySQL.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro encontrado.
    - 400 si el id recibido no es valido.
    - 404 si no existe el registro.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const registro = await AlimentacionModel.findById(req.params.id, grupoDatos);

        if (!registro) {
            return error(res, "Registro de alimentacion no encontrado.", null, 404);
        }

        return exito(res, "Registro de alimentacion obtenido correctamente.", registro);
    } catch (err) {
        return error(res, "Error al obtener el registro de alimentacion.", err, 500);
    }
}

export async function createAlimentacion(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de alimentacion en la base de datos MySQL.
    Antes de crear, valida el body y verifica que no exista otro
    registro para el mismo estanque en la misma fecha y hora.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con el registro creado.
    - 409 si ya existe un registro para ese estanque en esa fecha y hora.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } =
            obtenerContextoPeticion(req);

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const idEstanque = obtenerIdEstanque(req.body);

        const existente = await AlimentacionModel.findByFechaHoraEstanque(
            req.body.fecha,
            req.body.hora,
            idEstanque,
            null,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un registro de alimentacion para ese estanque en esa fecha y hora.",
                null,
                409
            );
        }

        const dto = new AlimentacionDTO({
            ...req.body,
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });

        const nuevo = await AlimentacionModel.create(dto);

        return exito(res, "Registro de alimentacion creado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear el registro de alimentacion.", err, 500);
    }
}

export async function updateAlimentacion(req, res) {
    /*
    Descripcion:
    Actualiza un registro de alimentacion existente por su ID.
    Antes de actualizar, valida el id, valida el body,
    confirma que el registro exista y revisa que la fecha/hora no
    pertenezca a otro registro del mismo estanque.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro actualizado.
    - 400 si el id recibido no es valido.
    - 404 si no existe el registro.
    - 409 si ya existe otro registro para ese estanque en esa fecha y hora.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const registroActual = await AlimentacionModel.findById(req.params.id, grupoDatos);

        if (!registroActual) {
            return error(res, "Registro de alimentacion no encontrado.", null, 404);
        }

        const idEstanque = obtenerIdEstanque(req.body);

        const existente = await AlimentacionModel.findByFechaHoraEstanque(
            req.body.fecha,
            req.body.hora,
            idEstanque,
            req.params.id,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro registro de alimentacion para ese estanque en esa fecha y hora.",
                null,
                409
            );
        }

        // El creador original (creadoPorUsuarioId/creadoPorColaboradorId)
        // no se reenvia aqui: AlimentacionModel.update() nunca toca esas
        // columnas, sin importar lo que traiga el dto.
        const dto = new AlimentacionDTO({ ...req.body, grupoDatos });

        const actualizado = await AlimentacionModel.update(req.params.id, dto, grupoDatos);

        return exito(res, "Registro de alimentacion actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el registro de alimentacion.", err, 500);
    }
}

export async function deleteAlimentacion(req, res) {
    /*
    Descripcion:
    Elimina logicamente un registro de alimentacion por su ID.
    No elimina fisicamente el registro de la base de datos.
    El model se encarga de actualizar activo, deleted_at y version.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro eliminado logicamente.
    - 400 si el id recibido no es valido.
    - 404 si no existe el registro.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const { grupoDatos } = obtenerContextoPeticion(req);

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const eliminado = await AlimentacionModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, "Registro de alimentacion no encontrado.", null, 404);
        }

        return exito(res, "Registro de alimentacion eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el registro de alimentacion.", err, 500);
    }
}