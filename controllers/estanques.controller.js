/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.controller.js
Autor: Gerald Alfaro
Fecha: 01/08/2026
Modulo: Estanques
Descripcion:
Recibe las peticiones HTTP, obtiene el grupo de datos y
la identidad del creador desde el JWT, delega las
operaciones a los modelos y devuelve la respuesta.
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

import {
    obtenerContextoPeticion
} from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas por las funciones
principales del controller.
*/

function obtenerGrupoDatosPeticion(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene y valida el grupo de datos incluido en el JWT
    de un usuario web o colaborador movil.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - Numero del grupo de datos si es valido.
    - null si el JWT no contiene un grupo valido.
    */

    const {
        grupoDatos
    } = obtenerContextoPeticion(
        req
    );

    if (
        !isNumeroMayorCero(
            grupoDatos
        )
    ) {
        error(
            res,
            "La sesion no contiene un grupo de datos valido.",
            null,
            403
        );

        return null;
    }

    return Number(
        grupoDatos
    );
}

function validarCuerpo(
    body,
    res
) {
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

    if (
        !isEmpty(body.idFinca) &&
        !isNumeroMayorCero(
            body.idFinca
        )
    ) {
        errores.push(
            "El campo idFinca debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (
        !isEmpty(body.largo) &&
        !isNumeroMayorCero(
            body.largo
        )
    ) {
        errores.push(
            "El campo largo debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (
        !isEmpty(body.ancho) &&
        !isNumeroMayorCero(
            body.ancho
        )
    ) {
        errores.push(
            "El campo ancho debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (
        !isEmpty(body.profundidad) &&
        !isNumeroMayorCero(
            body.profundidad
        )
    ) {
        errores.push(
            "El campo profundidad debe ser numerico " +
            "y mayor que cero."
        );
    }

    if (
        !isEmpty(body.estado) &&
        !isEstadoEstanque(
            body.estado
        )
    ) {
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

function validarIdParametro(
    id,
    res
) {
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
    grupo de datos de la identidad autenticada.

    Parametros:
    - idFinca: Identificador de la finca.
    - grupoDatos: Grupo obtenido desde el JWT.
    - res: Objeto response de Express.

    Retorna:
    - true si la finca es valida.
    - false si la finca no existe o pertenece a otro grupo.
    */

    const fincaValida =
        await EstanqueModel.fincaPerteneceGrupo(
            idFinca,
            grupoDatos
        );

    if (!fincaValida) {
        error(
            res,
            "La finca no existe o no pertenece " +
            "al grupo de datos.",
            null,
            404
        );

        return false;
    }

    return true;
}

function manejarError(
    res,
    err,
    mensaje
) {
    /*
    Descripcion:
    Registra los errores internos del modulo y devuelve
    una respuesta estandar sin exponer el objeto completo
    del error al cliente.

    Parametros:
    - res: Objeto response de Express.
    - err: Error capturado.
    - mensaje: Mensaje general de la operacion.

    Retorna:
    - Respuesta JSON estandar de error.
    */

    console.error(
        "[Estanques]",
        err
    );

    let status = 500;
    let detalle = null;

    if (
        err !== undefined &&
        err !== null
    ) {
        if (
            err.status !== undefined
        ) {
            status =
                err.status;
        }

        if (
            err.message !== undefined
        ) {
            detalle =
                err.message;
        }

        if (
            err.code ===
            "ER_NO_REFERENCED_ROW_2"
        ) {
            status = 409;

            detalle =
                "No existe el grupo, finca o creador indicado.";
        }

        if (
            err.code ===
            "ER_BAD_FIELD_ERROR"
        ) {
            status = 500;

            detalle =
                "La estructura de la tabla estanques " +
                "no coincide con el modelo actualizado.";
        }

        if (
            err.code ===
            "ER_DUP_ENTRY"
        ) {
            status = 409;

            detalle =
                "Ya existe un registro con uno de los " +
                "valores unicos indicados.";
        }

        if (
            err.code ===
            "ER_DATA_TOO_LONG"
        ) {
            status = 400;

            detalle =
                "Uno de los campos excede el tamano permitido.";
        }

        if (
            err.code ===
            "WARN_DATA_TRUNCATED"
        ) {
            status = 400;

            detalle =
                "Uno de los valores no coincide con el " +
                "tipo permitido por la base de datos.";
        }
    }

    return error(
        res,
        mensaje,
        detalle,
        status
    );
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada ruta
del modulo de estanques.
*/

export async function getEstanques(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene los estanques activos que pertenecen al grupo
    de datos de la identidad autenticada.
    Permite filtrar por idFinca mediante query params.
    Esta ruta devuelve el listado basico sin equipos.
    */

    try {
        const grupoDatos =
            obtenerGrupoDatosPeticion(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        if (
            !isEmpty(
                req.query.idFinca
            )
        ) {
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
            idFinca:
                req.query.idFinca,
            grupoDatos
        };

        const data =
            await EstanqueModel.findAll(
                filtros
            );

        return exito(
            res,
            "Estanques obtenidos correctamente.",
            data
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al obtener los estanques."
        );
    }
}

export async function getEstanqueById(
    req,
    res
) {
    /*
    Descripcion:
    Obtiene un estanque por su ID y agrega todos los
    equipos asociados mediante equipos.estanque_id.
    Los equipos son separados por tipo.
    */

    try {
        const errId =
            validarIdParametro(
                req.params.id,
                res
            );

        if (errId) {
            return errId;
        }

        const grupoDatos =
            obtenerGrupoDatosPeticion(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const estanque =
            await EstanqueModel.findById(
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

        const equipos =
            await EquipoModel.findAll({
                grupoDatos,
                estanqueId:
                    req.params.id
            });

        const equiposAgrupados =
            agruparEquiposPorTipo(
                equipos
            );

        const detalleEstanque = {
            ...estanque,
            cantidadEquipos:
                equipos.length,
            equipos:
                equiposAgrupados
        };

        return exito(
            res,
            "Estanque obtenido correctamente.",
            detalleEstanque
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al obtener el estanque."
        );
    }
}

export async function createEstanque(
    req,
    res
) {
    /*
    Descripcion:
    Crea un nuevo estanque utilizando el grupo de datos
    y la identidad del creador obtenidos desde el JWT.
    */

    try {
        const {
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        } = obtenerContextoPeticion(
            req
        );

        if (
            !isNumeroMayorCero(
                grupoDatos
            )
        ) {
            return error(
                res,
                "La sesion no contiene un grupo de datos valido.",
                null,
                403
            );
        }

        const errValidacion =
            validarCuerpo(
                req.body,
                res
            );

        if (errValidacion) {
            return errValidacion;
        }

        const fincaValida =
            await validarFincaGrupo(
                req.body.idFinca,
                grupoDatos,
                res
            );

        if (!fincaValida) {
            return;
        }

        const existente =
            await EstanqueModel
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
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        };

        const dto =
            new EstanqueDTO(
                datosEstanque
            );

        const nuevo =
            await EstanqueModel.create(
                dto
            );

        return exito(
            res,
            "Estanque creado correctamente.",
            nuevo,
            201
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al crear el estanque."
        );
    }
}

export async function updateEstanque(
    req,
    res
) {
    /*
    Descripcion:
    Actualiza un estanque que pertenece al grupo de datos
    autenticado. Conserva la identidad del creador original.
    */

    try {
        const errId =
            validarIdParametro(
                req.params.id,
                res
            );

        if (errId) {
            return errId;
        }

        const grupoDatos =
            obtenerGrupoDatosPeticion(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const errValidacion =
            validarCuerpo(
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

        const fincaValida =
            await validarFincaGrupo(
                req.body.idFinca,
                grupoDatos,
                res
            );

        if (!fincaValida) {
            return;
        }

        const existente =
            await EstanqueModel
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
            grupoDatos,

            creadoPorUsuarioId:
                estanqueActual.creadoPorUsuarioId,

            creadoPorColaboradorId:
                estanqueActual.creadoPorColaboradorId
        };

        const dto =
            new EstanqueDTO(
                datosEstanque
            );

        const actualizado =
            await EstanqueModel.update(
                req.params.id,
                dto,
                grupoDatos
            );

        if (!actualizado) {
            return error(
                res,
                "Estanque no encontrado.",
                null,
                404
            );
        }

        return exito(
            res,
            "Estanque actualizado correctamente.",
            actualizado
        );
    } catch (err) {
        return manejarError(
            res,
            err,
            "Error al actualizar el estanque."
        );
    }
}

export async function deleteEstanque(
    req,
    res
) {
    /*
    Descripcion:
    Elimina logicamente un estanque que pertenece al grupo
    de datos de la identidad autenticada.
    */

    try {
        const errId =
            validarIdParametro(
                req.params.id,
                res
            );

        if (errId) {
            return errId;
        }

        const grupoDatos =
            obtenerGrupoDatosPeticion(
                req,
                res
            );

        if (grupoDatos === null) {
            return;
        }

        const eliminado =
            await EstanqueModel.remove(
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
        return manejarError(
            res,
            err,
            "Error al eliminar el estanque."
        );
    }
}