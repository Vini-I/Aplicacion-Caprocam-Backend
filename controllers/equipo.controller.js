/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.controller.js
Autor: Rodolfo Chaves
Fecha: 20/07/2026
Modulo: Equipo
Descripcion:
Recibe las peticiones HTTP, obtiene el grupo de datos
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
    EquipoDTO,
    TipoEquipo,
    EstadoOperativoEquipo,
    EstadoEquipo
} from "../dtos/equipo.dto.js";

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
    isTipoEquipo,
    isEstadoOperativoEquipo,
    isEstadoEquipo,
    isIdValido,
    isFechaValida
} from "../services/equipo.service.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as EquipoModel from "../models/equipo.model.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { exito, error } from "../common/respuestaJson.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas por las funciones
principales del controller.
*/

function obtenerGrupoDatosUsuario(req, res) {
    /*
    Descripcion:
    Obtiene y valida el grupo de datos incluido en el JWT.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - Numero del grupo de datos si es valido.
    - null si el JWT no contiene un grupo valido.
    */

    if (!req.user) {
        error(res, "No fue posible obtener el usuario autenticado.", null, 403);
        return null;
    }

    if (!isNumeroMayorCero(req.user.grupoDatos)) {
        error(res, "El usuario no tiene un grupo de datos valido.", null, 403);
        return null;
    }

    return Number(req.user.grupoDatos);
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

    if (isEmpty(body.identificador)) {
        errores.push("El campo identificador es requerido.");
    }

    if (isEmpty(body.nombreEquipo)) {
        errores.push("El campo nombreEquipo es requerido.");
    }

    if (isEmpty(body.descripcion)) {
        errores.push("El campo descripcion es requerido.");
    }

    if (isEmpty(body.funcionEquipo)) {
        errores.push("El campo funcionEquipo es requerido.");
    }

    if (!isFechaValida(body.fechaInstalacion)) {
        errores.push(
            "El campo fechaInstalacion debe tener formato dd/mm/aaaa."
        );
    }

    if (!isTipoEquipo(body.tipoEquipo)) {
        errores.push(
            "Tipo invalido. Opciones: " + Object.values(TipoEquipo).join(", ")
        );
    }

    if (!isEstadoOperativoEquipo(body.estadoOperativo)) {
        errores.push(
            "Estado operativo invalido. Opciones: " +
            Object.values(EstadoOperativoEquipo).join(", ")
        );
    }

    if (!isEmpty(body.estado)) {
        if (!isEstadoEquipo(body.estado)) {
            errores.push(
                "Estado invalido. Opciones: " + Object.values(EstadoEquipo).join(", ")
            );
        }
    }

    if (!isEmpty(body.estanqueId)) {
        if (!isNumeroMayorCero(body.estanqueId)) {
            errores.push("El campo estanqueId debe ser numerico y mayor que cero.");
        }
    }

    if (!isNumeroOpcionalMayorIgualCero(body.horasMantenimiento)) {
        errores.push(
            "El campo horasMantenimiento debe ser numerico y mayor o igual que cero."
        );
    }

    if (!isNumeroOpcionalMayorIgualCero(body.horasActuales)) {
        errores.push(
            "El campo horasActuales debe ser numerico y mayor o igual que cero."
        );
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el equipo.", errores, 422);
    }

    return null;
}

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida que el parametro id recibido por la URL sea
    numerico y mayor que cero.

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
del modulo de equipos.
*/

export async function getEquipos(req, res) {
    /*
    Descripcion:
    Obtiene los equipos activos que pertenecen al grupo
    de datos del usuario autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de equipos.
    - 403 si el usuario no tiene grupo de datos valido.
    */

    try {
        const grupoDatos = obtenerGrupoDatosUsuario(req, res);

        if (grupoDatos === null) {
            return;
        }

        const data = await EquipoModel.findAll({
            grupoDatos,
            estanqueId: req.query.estanqueId
        });

        return exito(res, "Equipos obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener equipos.", null, 500);
    }
}

export async function getEquipoById(req, res) {
    /*
    Descripcion:
    Obtiene un equipo por su ID dentro del grupo de datos
    del usuario autenticado.

    Parametros:
    - req: Objeto request de Express (req.params.id).
    - res: Objeto response de Express.

    Retorna:
    - 200 con el equipo encontrado.
    - 400 si el id es invalido.
    - 403 si el usuario no tiene grupo de datos valido.
    - 404 si no existe o pertenece a otro grupo.
    */

    try {
        const idError = validarIdParametro(req.params.id, res);
        if (idError) return idError;

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const equipo = await EquipoModel.findById(req.params.id, grupoDatos);

        if (!equipo) {
            return error(res, "Equipo no encontrado.", null, 404);
        }

        return exito(res, "Equipo obtenido correctamente.", equipo);
    } catch (err) {
        return error(res, "Error al obtener el equipo.", null, 500);
    }
}

export async function createEquipo(req, res) {
    /*
    Descripcion:
    Registra un nuevo equipo dentro del grupo de datos
    del usuario autenticado.

    Parametros:
    - req: Objeto request de Express (req.body).
    - res: Objeto response de Express.

    Retorna:
    - 201 con el equipo creado.
    - 403 si el usuario no tiene grupo de datos valido.
    - 409 si el identificador ya existe en el grupo.
    - 422 si algun campo es invalido.
    */

    try {
        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const cuerpoError = validarCuerpo(req.body, res);
        if (cuerpoError) return cuerpoError;

        const existente = await EquipoModel.findByIdentificador(
            req.body.identificador,
            null,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un equipo con ese identificador.",
                null,
                409
            );
        }

        const dto = new EquipoDTO({
            ...req.body,
            grupoDatos
        });

        const nuevo = await EquipoModel.create(dto);

        return exito(res, "Equipo registrado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al registrar el equipo.", null, 500);
    }
}

export async function updateEquipo(req, res) {
    /*
    Descripcion:
    Actualiza un equipo existente dentro del grupo de datos
    del usuario autenticado.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body).
    - res: Objeto response de Express.

    Retorna:
    - 200 con el equipo actualizado.
    - 400 si el id es invalido.
    - 403 si el usuario no tiene grupo de datos valido.
    - 404 si no existe o pertenece a otro grupo.
    - 409 si el identificador ya pertenece a otro equipo.
    - 422 si algun campo es invalido.
    */

    try {
        const idError = validarIdParametro(req.params.id, res);
        if (idError) return idError;

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const cuerpoError = validarCuerpo(req.body, res);
        if (cuerpoError) return cuerpoError;

        const existente = await EquipoModel.findByIdentificador(
            req.body.identificador,
            req.params.id,
            grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un equipo con ese identificador.",
                null,
                409
            );
        }

        const dto = new EquipoDTO({
            ...req.body,
            grupoDatos
        });

        const actualizado = await EquipoModel.update(req.params.id, dto, grupoDatos);

        if (!actualizado) {
            return error(res, "Equipo no encontrado.", null, 404);
        }

        return exito(res, "Equipo actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el equipo.", null, 500);
    }
}

export async function deleteEquipo(req, res) {
    /*
    Descripcion:
    Elimina un equipo por su ID (borrado logico) dentro
    del grupo de datos del usuario autenticado.

    Parametros:
    - req: Objeto request de Express (req.params.id).
    - res: Objeto response de Express.

    Retorna:
    - 200 con el equipo eliminado.
    - 400 si el id es invalido.
    - 403 si el usuario no tiene grupo de datos valido.
    - 404 si no existe o pertenece a otro grupo.
    */

    try {
        const idError = validarIdParametro(req.params.id, res);
        if (idError) return idError;

        const grupoDatos = obtenerGrupoDatosUsuario(req, res);
        if (grupoDatos === null) return;

        const eliminado = await EquipoModel.remove(req.params.id, grupoDatos);

        if (!eliminado) {
            return error(res, "Equipo no encontrado.", null, 404);
        }

        return exito(res, "Equipo eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el equipo.", null, 500);
    }
}