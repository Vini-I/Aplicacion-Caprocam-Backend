/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.controller.js
Autor: Eduard Salas
Modulo: Densidad Poblacional
Descripcion:
Recibe las peticiones HTTP, delega al modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { DensidadPoblacionalDTO } from "../dtos/densidadPoblacional.dto.js";

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
    isPercentageOpcional,
    isFechaValida,
    isIdValido,
    maxLength
} from "../services/densidadPoblacional.service.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as DensidadPoblacionalModel from "../models/densidadPoblacional.model.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Common
*/

import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas por las funciones
principales del controller.
*/

function obtenerContextoUsuario(req, res) {
    /*
    Descripcion:
    Arma el contexto de confianza (grupoDatos, creadoPorUsuarioId,
    creadoPorColaboradorId) usando el helper comun
    obtenerContextoPeticion, que ya distingue si la peticion viene
    de un Usuario Web o de un Colaborador APK (req.user / req.colaborador).

    Antes este modulo armaba el contexto a mano leyendo solo
    req.user.id como "usuarioId" generico, sin distinguir si ese id
    pertenecia a la tabla usuarios o a la tabla colaboradores. Esto
    causaba que, cuando la peticion venia de un Usuario Web, su id
    (de la tabla usuarios) se guardara en colaborador_id (FK hacia
    colaboradores), violando la llave foranea o apuntando a otra
    persona.

    Parametros:
    - req: Objeto request de Express (ya pasado por verificarAuth).
    - res: Objeto response de Express.

    Retorna:
    - { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } si
      req trae un grupoDatos valido y al menos uno de los dos
      identificadores de creador.
    - null si falta algo (ya se envio la respuesta de error
      correspondiente).
    */

    if (!req.user) {
        error(res, "No se pudo identificar al usuario autenticado.", null, 401);
        return null;
    }

    const { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId } = obtenerContextoPeticion(req);

    if (isEmpty(grupoDatos) || !isNumeroMayorCero(grupoDatos)) {
        error(res, "El token no contiene un grupo de datos valido.", null, 401);
        return null;
    }

    if (creadoPorUsuarioId === null && creadoPorColaboradorId === null) {
        error(res, "No se pudo determinar quien hizo la peticion (usuario o colaborador autenticado).", null, 401);
        return null;
    }

    return { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId };
}

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
    Se encarga de revisar campos requeridos, campos numericos,
    fecha valida y valores opcionales.

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

    if (!isNumeroOpcionalMayorIgualCero(body.idColaborador)) {
        errores.push("El campo idColaborador debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.cantidadSiembra)) {
        errores.push("El campo cantidadSiembra debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.areaEstanque)) {
        errores.push("El campo areaEstanque debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.numeroCamarones)) {
        errores.push("El campo numeroCamarones debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.tirosAtarraya)) {
        errores.push("El campo tirosAtarraya debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.areaAtarraya)) {
        errores.push("El campo areaAtarraya debe ser numerico y mayor o igual que cero.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.promedioPorTiro)) {
        errores.push("El campo promedioPorTiro debe ser numerico y mayor o igual que cero.");
    }

    if (!isPercentageOpcional(body.sobrevivencia)) {
        errores.push("El campo sobrevivencia debe ser un porcentaje entre 0 y 100.");
    }

    if (!isNumeroOpcionalMayorIgualCero(body.densidad)) {
        errores.push("El campo densidad debe ser numerico y mayor o igual que cero.");
    }

    if (!maxLength(body.notasConteo, 255)) {
        errores.push("El campo notasConteo no puede superar los 255 caracteres.");
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el registro de densidad poblacional.", errores, 422);
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
del modulo de densidad poblacional.
*/

export async function getDensidades(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de densidad poblacional activos
    desde MySQL, dentro del grupo de datos del usuario autenticado.
    Permite filtrar por idFinca, idEstanque y idUsuario (para ver
    solo los registros hechos por un usuario especifico) mediante
    query params.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de registros.
    - 401 si el token no trae un grupoDatos valido.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const contexto = obtenerContextoUsuario(req, res);

        if (!contexto) {
            return;
        }

        const filtros = {
            idFinca: req.query.idFinca,
            idEstanque: req.query.idEstanque,
            idUsuario: req.query.idUsuario,
            grupoDatos: contexto.grupoDatos
        };

        const data = await DensidadPoblacionalModel.findAll(filtros);

        return exito(res, "Registros de densidad poblacional obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los registros de densidad poblacional.", err, 500);
    }
}

export async function getDensidadById(req, res) {
    /*
    Descripcion:
    Obtiene un registro de densidad poblacional por su ID desde MySQL,
    dentro del grupo de datos del usuario autenticado.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro encontrado (incluye usuarioId y usuarioNombre
      de quien lo creo).
    - 400 si el id recibido no es valido.
    - 401 si el token no trae un grupoDatos valido.
    - 404 si no existe el registro.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const contexto = obtenerContextoUsuario(req, res);

        if (!contexto) {
            return;
        }

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const registro = await DensidadPoblacionalModel.findById(req.params.id, contexto.grupoDatos);

        if (!registro) {
            return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
        }

        return exito(res, "Registro de densidad poblacional obtenido correctamente.", registro);
    } catch (err) {
        return error(res, "Error al obtener el registro de densidad poblacional.", err, 500);
    }
}

export async function createDensidad(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de densidad poblacional en la base de datos MySQL.
    El grupoDatos y el usuarioId (quien hizo el registro) SIEMPRE
    se toman del JWT (req.user), nunca del body: aunque el cliente
    mande esos campos en el body, se ignoran por completo.
    Antes de crear, valida el body y verifica que no exista otro
    registro para el mismo estanque en la misma fecha dentro del
    mismo grupo de datos.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con el registro creado (incluye usuarioId: quien lo creo).
    - 401 si el token no trae grupoDatos/usuarioId validos.
    - 409 si ya existe un registro para ese estanque en esa fecha.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const contexto = obtenerContextoUsuario(req, res);

        if (!contexto) {
            return;
        }

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const idEstanque = obtenerIdEstanque(req.body);

        const existente = await DensidadPoblacionalModel.findByFechaAndEstanque(
            req.body.fecha,
            idEstanque,
            null,
            contexto.grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe un registro de densidad poblacional para ese estanque en esa fecha.",
                null,
                409
            );
        }

        const dto = new DensidadPoblacionalDTO(req.body, contexto);

        const nuevo = await DensidadPoblacionalModel.create(dto);

        return exito(res, "Registro de densidad poblacional creado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear el registro de densidad poblacional.", err, 500);
    }
}

export async function updateDensidad(req, res) {
    /*
    Descripcion:
    Actualiza un registro de densidad poblacional existente por su ID,
    dentro del grupo de datos del usuario autenticado.
    Antes de actualizar, valida el id, valida el body,
    confirma que el registro exista y revisa que la fecha no
    pertenezca a otro registro del mismo estanque.

    IMPORTANTE: usuario_id (quien hizo el registro originalmente)
    NUNCA cambia al actualizar, sin importar quien este editando.
    Esto es intencional: es un dato de auditoria de creacion, no
    de la ultima edicion.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro actualizado.
    - 400 si el id recibido no es valido.
    - 401 si el token no trae un grupoDatos valido.
    - 404 si no existe el registro.
    - 409 si ya existe otro registro para ese estanque en esa fecha.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const contexto = obtenerContextoUsuario(req, res);

        if (!contexto) {
            return;
        }

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const registroActual = await DensidadPoblacionalModel.findById(req.params.id, contexto.grupoDatos);

        if (!registroActual) {
            return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
        }

        const idEstanque = obtenerIdEstanque(req.body);

        const existente = await DensidadPoblacionalModel.findByFechaAndEstanque(
            req.body.fecha,
            idEstanque,
            req.params.id,
            contexto.grupoDatos
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro registro de densidad poblacional para ese estanque en esa fecha.",
                null,
                409
            );
        }

        const dto = new DensidadPoblacionalDTO(req.body, contexto);

        const actualizado = await DensidadPoblacionalModel.update(req.params.id, dto, contexto.grupoDatos);

        return exito(res, "Registro de densidad poblacional actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el registro de densidad poblacional.", err, 500);
    }
}

export async function deleteDensidad(req, res) {
    /*
    Descripcion:
    Elimina logicamente un registro de densidad poblacional por su ID,
    dentro del grupo de datos del usuario autenticado.
    No elimina fisicamente el registro de la base de datos.
    El model se encarga de actualizar activo, deleted_at y version.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro eliminado logicamente.
    - 400 si el id recibido no es valido.
    - 401 si el token no trae un grupoDatos valido.
    - 404 si no existe el registro.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const contexto = obtenerContextoUsuario(req, res);

        if (!contexto) {
            return;
        }

        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const eliminado = await DensidadPoblacionalModel.remove(req.params.id, contexto.grupoDatos);

        if (!eliminado) {
            return error(res, "Registro de densidad poblacional no encontrado.", null, 404);
        }

        return exito(res, "Registro de densidad poblacional eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el registro de densidad poblacional.", err, 500);
    }
}