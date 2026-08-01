/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.controller.js
Autor: Gerald Alfaro
Fecha: 31/07/2026
Modulo: Estanques
Descripcion:
Recibe las peticiones HTTP, obtiene el grupo de datos
desde el JWT, delega las operaciones a los modelos y
devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import {
    EstanqueDTO,
    EstadoEstanque
} from "../dtos/estanques.dto.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Servicios
*/

import {
    isEmpty,
    isNumeroMayorCero,
    isEstadoEstanque,
    isIdValido,
    isFechaOpcionalValida,
    isBooleanoOpcionalValido,
    agruparEquiposPorTipo
} from "../services/estanques.service.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as EstanqueModel
    from "../models/estanques.model.js";

import * as EquipoModel
    from "../models/equipo.model.js";

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
        error(
            res,
            "No fue posible obtener el usuario autenticado.",
            null,
            403
        );

        return null;
    }

    if (
        !isNumeroMayorCero(
            req.user.grupoDatos
        )
    ) {
        error(
            res,
            "El usuario no tiene un grupo de datos valido.",
            null,
            403
        );

        return null;
    }

    return Number(
        req.user.grupoDatos
    );
}

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.
    Revisa campos requeridos, campos numericos, estado,
    fecha de mantenimiento y precria.

    Parametros:
    - body: Campos recibidos en el body de la peticion.
    - res: Objeto response de Express.

    Retorna:
    - Respuesta de error si existen datos invalidos.
    - null si todos los datos son validos.
    */

    const errores = [];

    if (isEmpty(body.idFinca)) {
        errores.push(
            "El campo idFinca es requerido."
        );
    }

    if (isEmpty(body.codigo)) {
        errores.push(
            "El campo codigo es requerido."
        );
    }

    if (isEmpty(body.tipoEstanque)) {
        errores.push(
            "El campo tipoEstanque es requerido."
        );
    }

    if (isEmpty(body.estado)) {
        errores.push(
            "El campo estado es requerido."
        );
    }

    if (isEmpty(body.largo)) {
        errores.push(
            "El campo largo es requerido."
        );
    }

    if (isEmpty(body.ancho)) {
        errores.push(
            "El campo ancho es requerido."
        );
    }

    if (isEmpty(body.profundidad)) {
        errores.push(
            "El campo profundidad es requerido."
        );
    }

    if (!isNumeroMayorCero(body.idFinca)) {
        errores.push(
            "El campo idFinca debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (!isNumeroMayorCero(body.largo)) {
        errores.push(
            "El campo largo debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (!isNumeroMayorCero(body.ancho)) {
        errores.push(
            "El campo ancho debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (!isNumeroMayorCero(body.profundidad)) {
        errores.push(
            "El campo profundidad debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (!isEstadoEstanque(body.estado)) {
        errores.push(
            "Estado invalido. Opciones: " +
            Object.values(
                EstadoEstanque
            ).join(", ")
        );
    }

    if (
        !isFechaOpcionalValida(
            body.fechaMantenimiento
        )
    ) {
        errores.push(
            "El campo fechaMantenimiento debe tener " +
            "formato DD/MM/YYYY o YYYY-MM-DD."
        );
    }

    if (
        !isBooleanoOpcionalValido(
            body.precria
        )
    ) {
        errores.push(
            "El campo precria debe ser booleano."
        );
    }

    if (errores.length > 0) {
        return error(
            res,
            "Datos invalidos para el estanque.",
            errores,
            422
        );
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
        return error(
            res,
            "El id debe ser numerico y mayor que cero.",
            null,
            400
        );
    }

    return null;
}

async function validarFincaGrupo(
    idFinca,
    grupoDatos,
    res
) {
    /*
    Descripcion:
    Verifica que la finca exista y pertenezca al mismo
    grupo de datos del usuario autenticado.

    Parametros:
    - idFinca: Identificador de la finca.
    - grupoDatos: Grupo obtenido desde el JWT.
    - res: Objeto response de Express.

    Retorna:
    - true si la finca es valida.
    - false si la finca no existe o pertenece a otro grupo.
    */

    const fincaValida = await EstanqueModel
        .fincaPerteneceGrupo(
            idFinca,
            grupoDatos
        );

    if (!fincaValida) {
        error(
            res,
            "La finca no existe o no pertenece al usuario.",
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

Contiene las funciones exportables que manejan cada ruta
del modulo de estanques.
*/

export async function getEstanques(req, res) {
    /*
    Descripcion:
    Obtiene los estanques activos que pertenecen al grupo
    de datos del usuario autenticado.
    Permite filtrar por idFinca mediante query params.
    Esta ruta devuelve el listado basico sin equipos.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de estanques.
    - 400 si el filtro de finca es invalido.
    - 403 si el JWT no contiene un grupo valido.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const grupoDatos =
            obtenerGrupoDatosUsuario(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        if (!isEmpty(req.query.idFinca)) {
            if (
                !isNumeroMayorCero(
                    req.query.idFinca
                )
            ) {
                return error(
                    res,
                    "El filtro idFinca debe ser numerico " +
                    "y mayor que cero.",
                    null,
                    400
                );
            }
        }

        const filtros = {
            idFinca: req.query.idFinca,
            grupoDatos
        };

        const data = await EstanqueModel.findAll(
            filtros
        );

        return exito(
            res,
            "Estanques obtenidos correctamente.",
            data
        );
    } catch (err) {
        return error(
            res,
            "Error al obtener los estanques.",
            err,
            500
        );
    }
}

export async function getEstanqueById(req, res) {
    /*
    Descripcion:
    Obtiene un estanque por su ID y agrega todos los
    equipos asociados mediante equipos.estanque_id.
    Los equipos son separados por tipo.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el estanque y sus equipos.
    - 400 si el id recibido no es valido.
    - 403 si el JWT no contiene un grupo valido.
    - 404 si no existe o pertenece a otro grupo.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos =
            obtenerGrupoDatosUsuario(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const estanque = await EstanqueModel.findById(
            req.params.id,
            grupoDatos
        );

        if (!estanque) {
            return error(
                res,
                "Estanque no encontrado.",
                null,
                404
            );
        }

        const equipos = await EquipoModel.findAll({
            grupoDatos,
            estanqueId: req.params.id
        });

        const equiposAgrupados =
            agruparEquiposPorTipo(
                equipos
            );

        const detalleEstanque = {
            ...estanque,
            cantidadEquipos: equipos.length,
            equipos: equiposAgrupados
        };

        return exito(
            res,
            "Estanque obtenido correctamente.",
            detalleEstanque
        );
    } catch (err) {
        return error(
            res,
            "Error al obtener el estanque.",
            err,
            500
        );
    }
}

export async function createEstanque(req, res) {
    /*
    Descripcion:
    Crea un nuevo estanque utilizando el grupo de datos
    obtenido desde el JWT.
    Verifica que la finca pertenezca al mismo grupo y que
    no exista un codigo duplicado dentro de la finca.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con el estanque creado.
    - 403 si el JWT no contiene un grupo valido.
    - 404 si la finca no pertenece al grupo.
    - 409 si el codigo ya existe en la finca.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const grupoDatos =
            obtenerGrupoDatosUsuario(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const errValidacion = validarCuerpo(
            req.body,
            res
        );

        if (errValidacion) {
            return errValidacion;
        }

        const fincaValida = await validarFincaGrupo(
            req.body.idFinca,
            grupoDatos,
            res
        );

        if (!fincaValida) {
            return;
        }

        const existente = await EstanqueModel
            .findByCodigoAndFinca(
                req.body.codigo,
                req.body.idFinca,
                null,
                grupoDatos
            );

        if (existente) {
            return error(
                res,
                "Ya existe un estanque con ese codigo " +
                "en la finca.",
                null,
                409
            );
        }

        const datosEstanque = {
            ...req.body,
            grupoDatos
        };

        const dto = new EstanqueDTO(
            datosEstanque
        );

        const nuevo = await EstanqueModel.create(
            dto
        );

        return exito(
            res,
            "Estanque creado correctamente.",
            nuevo,
            201
        );
    } catch (err) {
        return error(
            res,
            "Error al crear el estanque.",
            err,
            500
        );
    }
}

export async function updateEstanque(req, res) {
    /*
    Descripcion:
    Actualiza un estanque que pertenece al grupo de datos
    del usuario autenticado.
    El grupo de datos no puede ser cambiado mediante el body.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el estanque actualizado.
    - 400 si el id recibido no es valido.
    - 403 si el JWT no contiene un grupo valido.
    - 404 si el estanque o la finca no pertenecen al grupo.
    - 409 si existe un codigo duplicado en la finca.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos =
            obtenerGrupoDatosUsuario(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const errValidacion = validarCuerpo(
            req.body,
            res
        );

        if (errValidacion) {
            return errValidacion;
        }

        const estanqueActual =
            await EstanqueModel.findById(
                req.params.id,
                grupoDatos
            );

        if (!estanqueActual) {
            return error(
                res,
                "Estanque no encontrado.",
                null,
                404
            );
        }

        const fincaValida = await validarFincaGrupo(
            req.body.idFinca,
            grupoDatos,
            res
        );

        if (!fincaValida) {
            return;
        }

        const existente = await EstanqueModel
            .findByCodigoAndFinca(
                req.body.codigo,
                req.body.idFinca,
                req.params.id,
                grupoDatos
            );

        if (existente) {
            return error(
                res,
                "Ya existe otro estanque con ese codigo " +
                "en la finca.",
                null,
                409
            );
        }

        const datosEstanque = {
            ...req.body,
            grupoDatos
        };

        const dto = new EstanqueDTO(
            datosEstanque
        );

        const actualizado =
            await EstanqueModel.update(
                req.params.id,
                dto,
                grupoDatos
            );

        return exito(
            res,
            "Estanque actualizado correctamente.",
            actualizado
        );
    } catch (err) {
        return error(
            res,
            "Error al actualizar el estanque.",
            err,
            500
        );
    }
}

export async function deleteEstanque(req, res) {
    /*
    Descripcion:
    Elimina logicamente un estanque que pertenece al grupo
    de datos del usuario autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el estanque eliminado logicamente.
    - 400 si el id recibido no es valido.
    - 403 si el JWT no contiene un grupo valido.
    - 404 si el estanque no existe o pertenece a otro grupo.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(
            req.params.id,
            res
        );

        if (errId) {
            return errId;
        }

        const grupoDatos =
            obtenerGrupoDatosUsuario(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const eliminado = await EstanqueModel.remove(
            req.params.id,
            grupoDatos
        );

        if (!eliminado) {
            return error(
                res,
                "Estanque no encontrado.",
                null,
                404
            );
        }

        return exito(
            res,
            "Estanque eliminado correctamente.",
            eliminado
        );
    } catch (err) {
        return error(
            res,
            "Error al eliminar el estanque.",
            err,
            500
        );
    }
}