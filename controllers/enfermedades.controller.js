/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.controller.js
Autor: Isaac Chaves
Fecha: 30/07/2026
Modulo: Enfermedades
Descripcion:
Controlador del modulo de enfermedades.
Usa obtenerContextoPeticion para resolver grupo y creador
segun una sesion web o una sesion de colaborador movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
    EnfermedadDTO
} from '../dtos/enfermedades.dto.js';

import {
    isEmpty,
    isIdValido,
    normalizarDatosEnfermedad,
    normalizarFiltrosEnfermedad,
    validarDatosEnfermedad,
    validarFiltrosEnfermedad,
    obtenerCatalogoEnfermedades as
        obtenerCatalogoEnfermedadesService,
    obtenerCatalogoSeveridades as
        obtenerCatalogoSeveridadesService,
    construirResumenEnfermedades,
} from '../services/enfermedades.service.js';

import * as EnfermedadModel from
    '../models/enfermedades.model.js';

import {
    exito,
    error
} from '../common/respuestaJson.js';

import {
    obtenerContextoPeticion
} from '../common/contextoPeticion.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Obtiene las enfermedades activas que pertenecen al
grupo de datos resuelto desde el JWT.

Parametros:
- req: Peticion HTTP con filtros opcionales en req.query.
- res: Respuesta HTTP de Express.

Retorna:
- Lista de enfermedades del grupo autenticado.
- Respuesta estandar de error si la consulta falla.
*/

export async function obtenerEnfermedades(
    req,
    res
) {
    try {
        const {
            grupoDatos
        } = obtenerContextoPeticion(
            req
        );

        const filtros = normalizarFiltrosEnfermedad(
            req.query,
            grupoDatos
        );

        const errores = validarFiltrosEnfermedad(
            filtros
        );

        if (errores.length > 0) {
            return error(
                res,
                'Datos invalidos para consultar enfermedades.',
                errores,
                422
            );
        }

        const data = await EnfermedadModel.findAll(
            filtros
        );

        return exito(
            res,
            'Enfermedades obtenidas correctamente.',
            data
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            'No se pudieron obtener las enfermedades.'
        );
    }
}

/*
Descripcion:
Obtiene una enfermedad por id y verifica que el registro
pertenezca al grupo de datos autenticado.

Parametros:
- req: Peticion HTTP con el id en req.params.
- res: Respuesta HTTP de Express.

Retorna:
- Registro encontrado.
- Error 400 si el id es invalido.
- Error 404 si no existe dentro del grupo.
*/

export async function obtenerEnfermedadPorId(
    req,
    res
) {
    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const {
            grupoDatos
        } = obtenerContextoPeticion(
            req
        );

        const registro = await EnfermedadModel.findById(
            req.params.id,
            grupoDatos
        );

        if (!registro) {
            return error(
                res,
                'Enfermedad no encontrada.',
                null,
                404
            );
        }

        return exito(
            res,
            'Enfermedad obtenida correctamente.',
            registro
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            'No se pudo obtener la enfermedad.'
        );
    }
}

/*
Descripcion:
Crea un registro de enfermedad con auditoria obtenida
exclusivamente desde el JWT.

Registro creado con codigo HTTP 201.
Error de validacion, relacion o base de datos.

Parametros:
- La sesion web usa creadoPorUsuarioId.
- La sesion movil usa creadoPorColaboradorId.
- No se utiliza colaboradorId ni se acepta auditoria del body.

Retorna:
- req: Peticion HTTP con los datos funcionales.
- res: Respuesta HTTP de Express.
*/

export async function crearEnfermedad(
    req,
    res
) {
    try {
        const {
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        } = obtenerContextoPeticion(
            req
        );

        const datosEntrada = {
            ...req.body,
            responsable:
                obtenerResponsablePeticion(
                    req
                ),
        };

        const datos = normalizarDatosEnfermedad(
            datosEntrada,
            grupoDatos
        );

        const errores = validarDatosEnfermedad(
            datos
        );

        if (errores.length > 0) {
            return error(
                res,
                'Datos invalidos para la enfermedad.',
                errores,
                422
            );
        }

        const errRelacion =
            await validarRelacionFincaEstanque(
                datos.fincaId,
                datos.estanqueId,
                grupoDatos,
                res
            );

        if (errRelacion) {
            return errRelacion;
        }

        const dto = new EnfermedadDTO({
            ...datos,
            creadoPorUsuarioId,
            creadoPorColaboradorId,
        });

        const nuevo = await EnfermedadModel.create(
            dto
        );

        return exito(
            res,
            'Enfermedad creada correctamente.',
            nuevo,
            201
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            'No se pudo crear la enfermedad.'
        );
    }
}

/*
Descripcion:
Actualiza los datos funcionales de una enfermedad.

Registro actualizado o error 404.

Parametros:
- El creador original se conserva y los campos de auditoria
  no forman parte del UPDATE del model.

Retorna:
- req: Peticion HTTP con id y nuevos datos.
- res: Respuesta HTTP de Express.
*/

export async function actualizarEnfermedad(
    req,
    res
) {
    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const {
            grupoDatos
        } = obtenerContextoPeticion(
            req
        );

        const registroActual =
            await EnfermedadModel.findById(
                req.params.id,
                grupoDatos
            );

        if (!registroActual) {
            return error(
                res,
                'Enfermedad no encontrada.',
                null,
                404
            );
        }

        const datosEntrada = {
            ...req.body,
            responsable:
                registroActual.responsable,
        };

        const datos = normalizarDatosEnfermedad(
            datosEntrada,
            grupoDatos
        );

        const errores = validarDatosEnfermedad(
            datos
        );

        if (errores.length > 0) {
            return error(
                res,
                'Datos invalidos para la enfermedad.',
                errores,
                422
            );
        }

        const errRelacion =
            await validarRelacionFincaEstanque(
                datos.fincaId,
                datos.estanqueId,
                grupoDatos,
                res
            );

        if (errRelacion) {
            return errRelacion;
        }

        const dto = new EnfermedadDTO({
            ...datos,
            creadoPorUsuarioId:
                registroActual.creadoPorUsuarioId,
            creadoPorColaboradorId:
                registroActual.creadoPorColaboradorId,
        });

        const actualizado =
            await EnfermedadModel.update(
                req.params.id,
                grupoDatos,
                dto
            );

        if (!actualizado) {
            return error(
                res,
                'Enfermedad no encontrada.',
                null,
                404
            );
        }

        return exito(
            res,
            'Enfermedad actualizada correctamente.',
            actualizado
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            'No se pudo actualizar la enfermedad.'
        );
    }
}

/*
Descripcion:
Realiza la eliminacion logica de una enfermedad protegida
por id y grupo de datos.

Parametros:
- req: Peticion HTTP con el id.
- res: Respuesta HTTP de Express.

Retorna:
- Registro eliminado logicamente o error 404.
*/

export async function eliminarEnfermedad(
    req,
    res
) {
    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const {
            grupoDatos
        } = obtenerContextoPeticion(
            req
        );

        const eliminado = await EnfermedadModel.remove(
            req.params.id,
            grupoDatos
        );

        if (!eliminado) {
            return error(
                res,
                'Enfermedad no encontrada.',
                null,
                404
            );
        }

        return exito(
            res,
            'Enfermedad eliminada correctamente.',
            eliminado
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            'No se pudo eliminar la enfermedad.'
        );
    }
}

/*
Descripcion:
Construye el resumen sanitario de las enfermedades del
grupo autenticado.

Parametros:
- req: Peticion HTTP con filtros opcionales.
- res: Respuesta HTTP de Express.

Retorna:
- Objeto con total de registros y frecuencias.
*/

export async function obtenerResumenEnfermedades(
    req,
    res
) {
    try {
        const {
            grupoDatos
        } = obtenerContextoPeticion(
            req
        );

        const filtros = normalizarFiltrosEnfermedad(
            req.query,
            grupoDatos
        );

        const errores = validarFiltrosEnfermedad(
            filtros
        );

        if (errores.length > 0) {
            return error(
                res,
                'Datos invalidos para consultar el resumen.',
                errores,
                422
            );
        }

        const registros = await EnfermedadModel.findAll(
            filtros
        );

        const resumen = construirResumenEnfermedades(
            registros
        );

        return exito(
            res,
            'Resumen de enfermedades obtenido correctamente.',
            resumen
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            'No se pudo obtener el resumen de enfermedades.'
        );
    }
}

/*
Descripcion:
Devuelve el catalogo permitido de enfermedades.

Parametros:
- req: Peticion HTTP.
- res: Respuesta HTTP de Express.

Retorna:
- Lista de opciones compatibles con la base de datos.
*/

export function obtenerCatalogoEnfermedades(
    req,
    res
) {
    const data =
        obtenerCatalogoEnfermedadesService();

    return exito(
        res,
        'Catalogo de enfermedades obtenido correctamente.',
        data
    );
}

/*
Descripcion:
Devuelve el catalogo permitido de severidades.

Parametros:
- req: Peticion HTTP.
- res: Respuesta HTTP de Express.

Retorna:
- Lista de opciones de severidad.
*/

export function obtenerCatalogoSeveridades(
    req,
    res
) {
    const data =
        obtenerCatalogoSeveridadesService();

    return exito(
        res,
        'Catalogo de severidades obtenido correctamente.',
        data
    );
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Obtiene el nombre visible del usuario o colaborador
autenticado.

Nombre del responsable o null.

Parametros:
- El valor se obtiene del JWT y nunca del body.

Retorna:
- req: Peticion HTTP autenticada.
*/

function obtenerResponsablePeticion(req) {
    const identidad =
        req.colaborador ??
        req.user;

    if (!identidad) {
        return null;
    }

    const nombre =
        identidad.nombre ??
        "";

    const apellidos =
        identidad.apellidos ??
        identidad.apellido ??
        "";

    const responsable =
        `${String(nombre).trim()} ${String(apellidos).trim()}`.trim();

    return isEmpty(responsable)
        ? null
        : responsable;
}

/*
Descripcion:
Verifica que finca y estanque existan, esten activos,
pertenezcan al grupo y mantengan relacion entre si.

Retorna:
- null si la relacion es valida.
- Respuesta HTTP de error si la relacion es invalida.
*/

async function validarRelacionFincaEstanque(
    fincaId,
    estanqueId,
    grupoDatos,
    res
) {
    const relacionValida =
        await EnfermedadModel
            .existeRelacionFincaEstanqueGrupo(
                fincaId,
                estanqueId,
                grupoDatos
            );

    if (!relacionValida) {
        return error(
            res,
            'La finca o el estanque no existe, no pertenece ' +
            'al grupo de datos o no existe relacion entre ambos.',
            null,
            404
        );
    }

    return null;
}

/*
Descripcion:
Valida que el id recibido sea numerico y mayor que cero.

Parametros:
- id: Identificador recibido.
- res: Respuesta HTTP de Express.

Retorna:
- null si es valido o respuesta de error.
*/

function validarIdParametro(
    id,
    res
) {
    if (!isIdValido(id)) {
        return error(
            res,
            'El id debe ser numerico y mayor que cero.',
            null,
            400
        );
    }

    return null;
}

/*
Descripcion:
Centraliza el formato de errores inesperados del controller
y registra el error en el servidor para facilitar su
diagnostico.

Parametros:
- res: Respuesta HTTP.
- err: Error capturado.
- mensaje: Mensaje general de la operacion.

Retorna:
- Respuesta JSON estandar.
*/

function manejarError(
    res,
    err,
    mensaje
) {
    console.error(
        '[Enfermedades]',
        err
    );

    let status = 500;
    let detalle = null;

    if (
        err !== undefined &&
        err !== null
    ) {
        status =
            err.status ??
            status;

        detalle =
            err.message ??
            detalle;

        if (
            err.code ===
            'ER_NO_REFERENCED_ROW_2'
        ) {
            status = 409;
            detalle =
                'No existe el grupo, finca, estanque ' +
                'o creador indicado.';
        }

        if (
            err.code ===
            'ER_BAD_FIELD_ERROR'
        ) {
            status = 500;
            detalle =
                'La estructura de la tabla enfermedades ' +
                'no coincide con el modelo actualizado.';
        }

        if (
            err.code ===
            'ER_DATA_TOO_LONG'
        ) {
            status = 400;
            detalle =
                'Uno de los campos excede el tamano permitido.';
        }

        if (
            err.code ===
            'WARN_DATA_TRUNCATED'
        ) {
            status = 400;
            detalle =
                'Uno de los valores no coincide con el ' +
                'tipo permitido por la base de datos.';
        }
    }

    return error(
        res,
        mensaje,
        detalle,
        status
    );
}