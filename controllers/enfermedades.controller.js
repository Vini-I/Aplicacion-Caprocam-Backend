/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.controller.js
Autor: Isaac Chaves
Fecha: 18/07/2026
Modulo: Enfermedades
Descripcion:
Recibe las peticiones HTTP del modulo de enfermedades.
Obtiene el grupo de datos y la informacion del responsable
desde el JWT antes de ejecutar las operaciones del modelo.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import {
    EnfermedadDTO
} from '../dtos/enfermedades.dto.js';

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Servicios
*/

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

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as EnfermedadModel from
    '../models/enfermedades.model.js';

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import {
    exito,
    error
} from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerEnfermedades(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene los registros de enfermedades pertenecientes
    al grupo de datos del usuario autenticado.
    */

    try {
        const grupoDatos = obtenerGrupoDatosJwt(
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

export async function obtenerEnfermedadPorId(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene una enfermedad por ID y verifica que pertenezca
    al grupo de datos del usuario autenticado.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos = obtenerGrupoDatosJwt(
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

export async function crearEnfermedad(
    req,
    res
) {
    /*
    Descripcion:
    Crea un registro de enfermedad utilizando el grupo de
    datos y el responsable obtenidos desde el JWT.

    El frontend no controla grupoDatos, responsable,
    colaboradorId ni tipoRegistro.
    */

    try {
        const grupoDatos = obtenerGrupoDatosJwt(
            req
        );

        const datosEntrada = {
            ...req.body,
            responsable: obtenerResponsableJwt(req),
            colaboradorId: obtenerColaboradorIdJwt(req),
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

        const dto = new EnfermedadDTO(
            datos
        );

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

export async function actualizarEnfermedad(
    req,
    res
) {
    /*
    Descripcion:
    Actualiza una enfermedad perteneciente al grupo del
    usuario autenticado.

    Conserva el responsable y colaborador del registro
    original para no cambiar quien realizo el reporte.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos = obtenerGrupoDatosJwt(
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
            responsable: registroActual.responsable,
            colaboradorId: registroActual.colaboradorId,
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

        const dto = new EnfermedadDTO(
            datos
        );

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

export async function eliminarEnfermedad(
    req,
    res
) {
    /*
    Descripcion:
    Elimina logicamente una enfermedad perteneciente al
    grupo de datos del usuario autenticado.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos = obtenerGrupoDatosJwt(
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

export async function obtenerResumenEnfermedades(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene el resumen de enfermedades del grupo de datos
    del usuario autenticado.
    */

    try {
        const grupoDatos = obtenerGrupoDatosJwt(
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

export function obtenerCatalogoEnfermedades(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene el catalogo de enfermedades disponibles.
    */

    const data =
        obtenerCatalogoEnfermedadesService();

    return exito(
        res,
        'Catalogo de enfermedades obtenido correctamente.',
        data
    );
}

export function obtenerCatalogoSeveridades(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene el catalogo de severidades disponibles.
    */

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

function obtenerGrupoDatosJwt(req) {
    /*
    Descripcion:
    Obtiene el grupo de datos exclusivamente desde el JWT.
    */

    return Number(
        req.user.grupoDatos
    );
}

function obtenerResponsableJwt(req) {
    /*
    Descripcion:
    Obtiene el nombre del usuario autenticado para guardarlo
    como responsable del reporte.

    Retorna:
    - Nombre del usuario.
    - null si el token no contiene nombre.
    */

    if (
        req.user === undefined ||
        req.user === null
    ) {
        return null;
    }

    if (isEmpty(req.user.nombre)) {
        return null;
    }

    return String(
        req.user.nombre
    ).trim();
}

function obtenerColaboradorIdJwt(req) {
    /*
    Descripcion:
    Obtiene colaboradorId solamente cuando el JWT lo contiene
    expresamente.

    No utiliza req.user.id porque ese valor puede pertenecer
    a la tabla usuarios y no a la tabla colaboradores.
    */

    if (
        req.user === undefined ||
        req.user === null
    ) {
        return null;
    }

    let colaboradorId = null;

    if (
        req.user.colaboradorId !== undefined &&
        req.user.colaboradorId !== null
    ) {
        colaboradorId = req.user.colaboradorId;
    } else if (
        req.user.colaborador_id !== undefined &&
        req.user.colaborador_id !== null
    ) {
        colaboradorId = req.user.colaborador_id;
    }

    if (colaboradorId === null) {
        return null;
    }

    if (!isIdValido(colaboradorId)) {
        return null;
    }

    return Number(
        colaboradorId
    );
}

async function validarRelacionFincaEstanque(
    fincaId,
    estanqueId,
    grupoDatos,
    res
) {
    /*
    Descripcion:
    Verifica que la finca y el estanque existan, pertenezcan
    al grupo autenticado y tengan relacion entre si.
    */

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

function validarIdParametro(
    id,
    res
) {
    /*
    Descripcion:
    Valida que el ID recibido sea numerico y mayor que cero.
    */

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

function manejarError(
    res,
    err,
    mensaje
) {
    /*
    Descripcion:
    Convierte errores del backend o MySQL en respuestas JSON.
    */

    let status = 500;
    let detalle = null;

    if (
        err !== undefined &&
        err !== null
    ) {
        if (err.status !== undefined) {
            status = err.status;
        }

        if (err.message !== undefined) {
            detalle = err.message;
        }

        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            status = 409;
            detalle =
                'No existe el grupoDatos, fincaId, ' +
                'estanqueId o colaboradorId indicado.';
        }

        if (err.code === 'ER_DATA_TOO_LONG') {
            status = 400;
            detalle =
                'Uno de los campos excede el tamano permitido.';
        }

        if (err.code === 'WARN_DATA_TRUNCATED') {
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
