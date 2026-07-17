/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.controller.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Recibe las peticiones HTTP, usa el modelo conectado a MySQL,
aplica reglas del servicio y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { EnfermedadDTO } from '../dtos/enfermedades.dto.js';

// Servicios
import {
    isEmpty,
    isIdValido,
    normalizarDatosEnfermedad,
    normalizarFiltrosEnfermedad,
    validarDatosEnfermedad,
    validarFiltrosEnfermedad,
    obtenerCatalogoEnfermedades as obtenerCatalogoEnfermedadesService,
    obtenerCatalogoSeveridades as obtenerCatalogoSeveridadesService,
    construirResumenEnfermedades,
} from '../services/enfermedades.service.js';

// Modelos
import * as EnfermedadModel from '../models/enfermedades.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

//const grupoDatos = req.user.grupoDatos;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de enfermedades.
*/

export async function obtenerEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de enfermedades.
    Filtra por grupoDatos y filtros opcionales.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de registros.
    */

    try {
        const grupoDatos = obtenerGrupoDatos(req);
        const filtros = normalizarFiltrosEnfermedad(req.query, grupoDatos);
        const errores = validarFiltrosEnfermedad(filtros);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para consultar enfermedades.', errores, 422);
        }

        const data = await EnfermedadModel.findAll(filtros);

        return exito(res, 'Enfermedades obtenidas correctamente.', data);
    } catch (err) {
        return manejarError(res, err, 'No se pudieron obtener las enfermedades.');
    }
}

export async function obtenerEnfermedadPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de enfermedad por su ID.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro encontrado.
    - 400 si el id es invalido.
    - 404 si no existe.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const grupoDatos = obtenerGrupoDatos(req);

        if (isEmpty(grupoDatos)) {
            return error(res, 'El campo grupoDatos es requerido.', null, 400);
        }

        const registro = await EnfermedadModel.findById(req.params.id, grupoDatos);

        if (!registro) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        return exito(res, 'Enfermedad obtenida correctamente.', registro);
    } catch (err) {
        return manejarError(res, err, 'No se pudo obtener la enfermedad.');
    }
}

export async function crearEnfermedad(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de enfermedad en MySQL.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con el registro creado.
    - 400/422 si hay errores de validacion.
    */

    try {
        const grupoDatos = obtenerGrupoDatos(req);
        const datos = normalizarDatosEnfermedad(req.body, grupoDatos);
        const errores = validarDatosEnfermedad(datos);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para la enfermedad.', errores, 422);
        }

        const dto = new EnfermedadDTO(datos);
        const nuevo = await EnfermedadModel.create(dto);

        return exito(res, 'Enfermedad creada correctamente.', nuevo, 201);
    } catch (err) {
        return manejarError(res, err, 'No se pudo crear la enfermedad.');
    }
}

export async function actualizarEnfermedad(req, res) {
    /*
    Descripcion:
    Actualiza un registro de enfermedad existente por su ID.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro actualizado.
    - 400/422 si hay errores de validacion.
    - 404 si no existe.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const grupoDatos = obtenerGrupoDatos(req);
        const datos = normalizarDatosEnfermedad(req.body, grupoDatos);
        const errores = validarDatosEnfermedad(datos);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para la enfermedad.', errores, 422);
        }

        const dto = new EnfermedadDTO(datos);
        const actualizado = await EnfermedadModel.update(req.params.id, grupoDatos, dto);

        if (!actualizado) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        return exito(res, 'Enfermedad actualizada correctamente.', actualizado);
    } catch (err) {
        return manejarError(res, err, 'No se pudo actualizar la enfermedad.');
    }
}

export async function eliminarEnfermedad(req, res) {
    /*
    Descripcion:
    Elimina logicamente un registro de enfermedad por su ID.
    No realiza DELETE fisico.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro eliminado.
    - 400 si el id es invalido.
    - 404 si no existe.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const grupoDatos = obtenerGrupoDatos(req);

        if (isEmpty(grupoDatos)) {
            return error(res, 'El campo grupoDatos es requerido.', null, 400);
        }

        const eliminado = await EnfermedadModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, 'Enfermedad no encontrada.', null, 404);
        }

        return exito(res, 'Enfermedad eliminada correctamente.', eliminado);
    } catch (err) {
        return manejarError(res, err, 'No se pudo eliminar la enfermedad.');
    }
}

export async function obtenerResumenEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene un resumen general de los registros de enfermedades.
    Permite filtrar por grupoDatos, fincaId, estanqueId,
    enfermedad, severidad y fechaReporte.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con resumen de enfermedades.
    */

    try {
        const grupoDatos = obtenerGrupoDatos(req);
        const filtros = normalizarFiltrosEnfermedad(req.query, grupoDatos);
        const errores = validarFiltrosEnfermedad(filtros);

        if (errores.length > 0) {
            return error(res, 'Datos invalidos para consultar el resumen.', errores, 422);
        }

        const registros = await EnfermedadModel.findAll(filtros);
        const resumen = construirResumenEnfermedades(registros);

        return exito(res, 'Resumen de enfermedades obtenido correctamente.', resumen);
    } catch (err) {
        return manejarError(res, err, 'No se pudo obtener el resumen de enfermedades.');
    }
}

export function obtenerCatalogoEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de enfermedades disponibles.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con catalogo de enfermedades.
    */

    const data = obtenerCatalogoEnfermedadesService();

    return exito(res, 'Catalogo de enfermedades obtenido correctamente.', data);
}

export function obtenerCatalogoSeveridades(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de severidades disponibles.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con catalogo de severidades.
    */

    const data = obtenerCatalogoSeveridadesService();

    return exito(res, 'Catalogo de severidades obtenido correctamente.', data);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas del controller.
*/

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida que el parametro id sea numerico y mayor a cero.

    Parametros:
    - id:  ID recibido por params.
    - res: Objeto response de Express.

    Retorna:
    - Una respuesta de error si algo falla.
    - null si todo esta bien.
    */

    if (!isIdValido(id)) {
        return error(res, 'El id debe ser numerico y mayor que cero.', null, 400);
    }

    return null;
}

function obtenerGrupoDatos(req) {
    /*
    Descripcion:
    Obtiene grupoDatos desde el usuario autenticado, query o body.
    El orden prioriza la informacion del usuario autenticado.

    Parametros:
    - req: Objeto request de Express.

    Retorna:
    - grupoDatos encontrado.
    - null si no existe.
    */

    if (req.usuario !== undefined && req.usuario !== null) {
        if (req.usuario.grupoDatos !== undefined) {
            return req.usuario.grupoDatos;
        }

        if (req.usuario.grupo_datos !== undefined) {
            return req.usuario.grupo_datos;
        }
    }

    if (req.user !== undefined && req.user !== null) {
        if (req.user.grupoDatos !== undefined) {
            return req.user.grupoDatos;
        }

        if (req.user.grupo_datos !== undefined) {
            return req.user.grupo_datos;
        }
    }

    if (req.query !== undefined && req.query !== null) {
        if (req.query.grupoDatos !== undefined) {
            return req.query.grupoDatos;
        }

        if (req.query.grupo_datos !== undefined) {
            return req.query.grupo_datos;
        }
    }

    if (req.body !== undefined && req.body !== null) {
        if (req.body.grupoDatos !== undefined) {
            return req.body.grupoDatos;
        }

        if (req.body.grupo_datos !== undefined) {
            return req.body.grupo_datos;
        }
    }

    return null;
}

function manejarError(res, err, mensaje) {
    /*
    Descripcion:
    Maneja errores del controller y errores comunes de MySQL.

    Parametros:
    - res: Objeto response de Express.
    - err: Error capturado.
    - mensaje: Mensaje general.

    Retorna:
    - JSON estandar de error.
    */

    let status = 500;
    let detalle = null;

    if (err !== undefined && err !== null) {
        if (err.status !== undefined) {
            status = err.status;
        }

        if (err.message !== undefined) {
            detalle = err.message;
        }

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            status = 409;
            detalle = 'No existe el grupoDatos, fincaId, estanqueId o colaboradorId indicado.';
        }

        if (err.code === 'ER_DATA_TOO_LONG') {
            status = 400;
            detalle = 'Uno de los campos excede el tamano permitido.';
        }

        if (err.code === 'WARN_DATA_TRUNCATED') {
            status = 400;
            detalle = 'Uno de los valores no coincide con el tipo permitido por la base de datos.';
        }
    }

    return error(res, mensaje, detalle, status);
}
