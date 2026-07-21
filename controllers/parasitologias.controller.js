/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.controller.js
Autor: Andres Gutierrez
Fecha: 18/07/2026
Modulo: Parasitologias
Descripcion:
Recibe las peticiones HTTP, obtiene los datos del usuario
desde el JWT, delega las operaciones al modelo y devuelve
la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import {
    ParasitologiaDTO,
    ParasitoParasitologia
} from "../dtos/parasitologias.dto.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Servicios
*/

import {
    isEmpty,
    isIdValido,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isFechaValida,
    isParasitoValido,
    isInfectadosValido,
    calcularPorcentajeInfeccion,
    calcularGradoInfeccion,
    obtenerCatalogoParasitos as obtenerCatalogoParasitosService,
    construirResumenParasitologias
} from "../services/parasitologias.service.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as ParasitologiaModel
    from "../models/parasitologias.model.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import {
    exito,
    error
} from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos enviados por el frontend.

    grupoDatos, responsable y colaboradorId no se validan
    desde el body porque son datos controlados por el backend.
    */

    const errores = [];

    if (isEmpty(body.fincaId)) {
        errores.push(
            "El campo fincaId es requerido."
        );
    }

    if (isEmpty(body.estanqueId)) {
        errores.push(
            "El campo estanqueId es requerido."
        );
    }

    if (isEmpty(body.fechaReporte)) {
        errores.push(
            "El campo fechaReporte es requerido."
        );
    }

    if (isEmpty(body.parasito)) {
        errores.push(
            "El campo parasito es requerido."
        );
    }

    if (isEmpty(body.camaronesMuestreados)) {
        errores.push(
            "El campo camaronesMuestreados es requerido."
        );
    }

    if (isEmpty(body.camaronesInfectados)) {
        errores.push(
            "El campo camaronesInfectados es requerido."
        );
    }

    if (!isNumeroMayorCero(body.fincaId)) {
        errores.push(
            "El campo fincaId debe ser numerico y mayor que cero."
        );
    }

    if (!isNumeroMayorCero(body.estanqueId)) {
        errores.push(
            "El campo estanqueId debe ser numerico y mayor que cero."
        );
    }

    if (!isEmpty(body.fechaReporte)) {
        if (!isFechaValida(body.fechaReporte)) {
            errores.push(
                "El campo fechaReporte debe tener formato " +
                "yyyy-mm-dd o dd/mm/aaaa."
            );
        }
    }

    if (!isEmpty(body.parasito)) {
        if (!isParasitoValido(body.parasito)) {
            errores.push(
                "Parasito invalido. Opciones: " +
                Object.values(
                    ParasitoParasitologia
                ).join(", ")
            );
        }
    }

    if (!isNumeroMayorCero(
        body.camaronesMuestreados
    )) {
        errores.push(
            "El campo camaronesMuestreados debe ser " +
            "numerico y mayor que cero."
        );
    }

    if (!isNumeroMayorIgualCero(
        body.camaronesInfectados
    )) {
        errores.push(
            "El campo camaronesInfectados debe ser " +
            "numerico y mayor o igual que cero."
        );
    }

    if (
        isNumeroMayorCero(
            body.camaronesMuestreados
        ) &&
        isNumeroMayorIgualCero(
            body.camaronesInfectados
        )
    ) {
        const relacionValida = isInfectadosValido(
            body.camaronesMuestreados,
            body.camaronesInfectados
        );

        if (!relacionValida) {
            errores.push(
                "Los camarones infectados no pueden ser " +
                "mayores que los muestreados."
            );
        }
    }

    if (errores.length > 0) {
        return error(
            res,
            "Datos invalidos para la parasitologia.",
            errores,
            422
        );
    }

    return null;
}

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida el ID recibido mediante la URL.
    */

    if (!isIdValido(id)) {
        return error(
            res,
            "El id debe ser numerico y mayor que cero.",
            null,
            400
        );
    }

    return null;
}

function obtenerResponsableUsuario(req) {
    /*
    Descripcion:
    Obtiene el nombre del usuario desde el JWT.
    */

    if (!req.user) {
        return null;
    }

    if (isEmpty(req.user.nombre)) {
        return null;
    }

    return String(
        req.user.nombre
    ).trim();
}

function obtenerColaboradorIdUsuario(req) {
    /*
    Descripcion:
    Obtiene el colaboradorId desde el JWT cuando exista.

    No utiliza req.user.id porque ese campo puede corresponder
    al identificador de la tabla usuarios.
    */

    if (!req.user) {
        return null;
    }

    if (!isNumeroMayorCero(
        req.user.colaboradorId
    )) {
        return null;
    }

    return Number(
        req.user.colaboradorId
    );
}

function construirDTO(body, datosSistema) {
    /*
    Descripcion:
    Construye el DTO utilizando datos del body y datos
    controlados por el backend.
    */

    const porcentajeInfeccion =
        calcularPorcentajeInfeccion(
            body.camaronesMuestreados,
            body.camaronesInfectados
        );

    const gradoInfeccion =
        calcularGradoInfeccion(
            porcentajeInfeccion
        );

    return new ParasitologiaDTO({
        grupoDatos: datosSistema.grupoDatos,
        fincaId: body.fincaId,
        estanqueId: body.estanqueId,
        colaboradorId:
            datosSistema.colaboradorId,
        tipoRegistro: "parasitologia",
        fechaReporte: body.fechaReporte,
        responsable: datosSistema.responsable,
        parasito: body.parasito,
        camaronesMuestreados:
            body.camaronesMuestreados,
        camaronesInfectados:
            body.camaronesInfectados,
        porcentajeInfeccion:
            porcentajeInfeccion,
        gradoInfeccion:
            gradoInfeccion,
        observaciones:
            body.observaciones
    });
}

async function validarFincaEstanqueGrupo(
    fincaId,
    estanqueId,
    grupoDatos,
    res
) {
    /*
    Descripcion:
    Verifica que la finca y el estanque existan, pertenezcan
    al grupo del JWT y que el estanque pertenezca a la finca.
    */

    const relacionesValidas =
        await ParasitologiaModel
            .fincaEstanquePertenecenGrupo(
                fincaId,
                estanqueId,
                grupoDatos
            );

    if (!relacionesValidas) {
        error(
            res,
            "La finca o el estanque no existen, no pertenecen " +
            "al usuario o no se encuentran relacionados.",
            null,
            404
        );

        return false;
    }

    return true;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function obtenerParasitologias(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene los registros pertenecientes al grupo del JWT.
    */

    try {
        const grupoDatos = Number(
            req.user.grupoDatos
        );

        const filtros = {
            grupoDatos,
            fincaId: req.query.fincaId,
            estanqueId: req.query.estanqueId,
            parasito: req.query.parasito,
            fechaReporte: req.query.fechaReporte
        };

        const data =
            await ParasitologiaModel.findAll(
                filtros
            );

        return exito(
            res,
            "Parasitologias obtenidas correctamente.",
            data
        );
    } catch (err) {
        return error(
            res,
            "Error al obtener las parasitologias.",
            err,
            500
        );
    }
}

export async function obtenerParasitologiaPorId(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene una parasitologia por ID y grupo de datos.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos = Number(
            req.user.grupoDatos
        );

        const parasitologia =
            await ParasitologiaModel.findById(
                req.params.id,
                grupoDatos
            );

        if (!parasitologia) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        return exito(
            res,
            "Parasitologia obtenida correctamente.",
            parasitologia
        );
    } catch (err) {
        return error(
            res,
            "Error al obtener la parasitologia.",
            err,
            500
        );
    }
}

export async function crearParasitologia(
    req,
    res
) {
    /*
    Descripcion:
    Crea una parasitologia utilizando el grupo y nombre
    obtenidos desde el JWT.
    */

    try {
        const errValidacion = validarCuerpo(
            req.body,
            res
        );

        if (errValidacion) {
            return errValidacion;
        }

        const grupoDatos = Number(
            req.user.grupoDatos
        );

        const relacionesValidas =
            await validarFincaEstanqueGrupo(
                req.body.fincaId,
                req.body.estanqueId,
                grupoDatos,
                res
            );

        if (!relacionesValidas) {
            return;
        }

        const datosSistema = {
            grupoDatos,
            responsable:
                obtenerResponsableUsuario(req),
            colaboradorId:
                obtenerColaboradorIdUsuario(req)
        };

        const dto = construirDTO(
            req.body,
            datosSistema
        );

        const nuevo =
            await ParasitologiaModel.create(
                dto
            );

        return exito(
            res,
            "Parasitologia creada correctamente.",
            nuevo,
            201
        );
    } catch (err) {
        return error(
            res,
            "Error al crear la parasitologia.",
            err,
            500
        );
    }
}

export async function actualizarParasitologia(
    req,
    res
) {
    /*
    Descripcion:
    Actualiza una parasitologia perteneciente al grupo
    del usuario autenticado.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const errValidacion = validarCuerpo(
            req.body,
            res
        );

        if (errValidacion) {
            return errValidacion;
        }

        const grupoDatos = Number(
            req.user.grupoDatos
        );

        const parasitologiaActual =
            await ParasitologiaModel.findById(
                req.params.id,
                grupoDatos
            );

        if (!parasitologiaActual) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        const relacionesValidas =
            await validarFincaEstanqueGrupo(
                req.body.fincaId,
                req.body.estanqueId,
                grupoDatos,
                res
            );

        if (!relacionesValidas) {
            return;
        }

        /*
        Los datos del responsable original se conservan.
        El frontend no puede modificarlos mediante el body.
        */
        const datosSistema = {
            grupoDatos,
            responsable:
                parasitologiaActual.responsable,
            colaboradorId:
                parasitologiaActual.colaboradorId
        };

        const dto = construirDTO(
            req.body,
            datosSistema
        );

        const actualizado =
            await ParasitologiaModel.update(
                req.params.id,
                dto,
                grupoDatos
            );

        return exito(
            res,
            "Parasitologia actualizada correctamente.",
            actualizado
        );
    } catch (err) {
        return error(
            res,
            "Error al actualizar la parasitologia.",
            err,
            500
        );
    }
}

export async function eliminarParasitologia(
    req,
    res
) {
    /*
    Descripcion:
    Elimina logicamente una parasitologia del grupo del JWT.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos = Number(
            req.user.grupoDatos
        );

        const eliminado =
            await ParasitologiaModel.remove(
                req.params.id,
                grupoDatos
            );

        if (!eliminado) {
            return error(
                res,
                "Parasitologia no encontrada.",
                null,
                404
            );
        }

        return exito(
            res,
            "Parasitologia eliminada correctamente.",
            eliminado
        );
    } catch (err) {
        return error(
            res,
            "Error al eliminar la parasitologia.",
            err,
            500
        );
    }
}

export async function obtenerResumenParasitologias(
    req,
    res
) {
    /*
    Descripcion:
    Construye un resumen utilizando solamente registros
    del grupo de datos del JWT.
    */

    try {
        const grupoDatos = Number(
            req.user.grupoDatos
        );

        const filtros = {
            grupoDatos,
            fincaId: req.query.fincaId,
            estanqueId: req.query.estanqueId,
            parasito: req.query.parasito,
            fechaReporte: req.query.fechaReporte
        };

        const registros =
            await ParasitologiaModel.findAll(
                filtros
            );

        const resumen =
            construirResumenParasitologias(
                registros
            );

        return exito(
            res,
            "Resumen de parasitologias obtenido correctamente.",
            resumen
        );
    } catch (err) {
        return error(
            res,
            "Error al obtener el resumen de parasitologias.",
            err,
            500
        );
    }
}

export function obtenerCatalogoParasitos(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene el catalogo de parasitos.
    */

    const data =
        obtenerCatalogoParasitosService();

    return exito(
        res,
        "Catalogo de parasitos obtenido correctamente.",
        data
    );
}