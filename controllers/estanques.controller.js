/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.controller.js
Autor: Gerald Alfaro
Fecha: 03/07/2026
Modulo: Estanques
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

import { EstanqueDTO, EstadoEstanque } from "../dtos/estanques.dto.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Servicios
*/

import {
    isEmpty,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isNumeroOpcionalMayorIgualCero,
    isEstadoEstanque,
    isIdValido
} from "../services/estanques.service.js";

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Modelos
*/

import * as EstanqueModel from "../models/estanques.model.js";

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

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.
    Se encarga de revisar campos requeridos, campos numericos,
    estado permitido y valores opcionales.

    Parametros:
    - body: Campos recibidos en el body de la peticion.
    - res: Objeto response de Express.

    Retorna:
    - Respuesta de error si existen datos invalidos.
    - null si todos los datos son validos.
    */

    const errores = [];

    if (isEmpty(body.idFinca)) {
        errores.push("El campo idFinca es requerido.");
    }

    if (isEmpty(body.codigo)) {
        errores.push("El campo codigo es requerido.");
    }

    if (isEmpty(body.tipoEstanque)) {
        errores.push("El campo tipoEstanque es requerido.");
    }

    if (isEmpty(body.estado)) {
        errores.push("El campo estado es requerido.");
    }

    if (isEmpty(body.largo)) {
        errores.push("El campo largo es requerido.");
    }

    if (isEmpty(body.ancho)) {
        errores.push("El campo ancho es requerido.");
    }

    if (isEmpty(body.profundidad)) {
        errores.push("El campo profundidad es requerido.");
    }

    if (!isNumeroMayorCero(body.idFinca)) {
        errores.push("El campo idFinca debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.largo)) {
        errores.push("El campo largo debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.ancho)) {
        errores.push("El campo ancho debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.profundidad)) {
        errores.push("El campo profundidad debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.grupoDatos)) {
        if (!isNumeroMayorCero(body.grupoDatos)) {
            errores.push("El campo grupoDatos debe ser numerico y mayor que cero.");
        }
    }

    if (!isEmpty(body.densidadSiembra)) {
        if (!isNumeroMayorIgualCero(body.densidadSiembra)) {
            errores.push("El campo densidadSiembra debe ser numerico y mayor o igual que cero.");
        }
    }

    if (!isNumeroOpcionalMayorIgualCero(body.numeroAireadores)) {
        errores.push("El campo numeroAireadores debe ser numerico y mayor o igual que cero.");
    }

    if (!isEstadoEstanque(body.estado)) {
        errores.push(
            "Estado invalido. Opciones: " + Object.values(EstadoEstanque).join(", ")
        );
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para el estanque.", errores, 422);
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
del modulo de estanques.
*/

export async function getEstanques(req, res) {
    /*
    Descripcion:
    Obtiene todos los estanques activos desde MySQL.
    Permite filtrar por idFinca y grupoDatos mediante query params.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de estanques.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const filtros = {
            idFinca: req.query.idFinca,
            grupoDatos: req.query.grupoDatos
        };

        const data = await EstanqueModel.findAll(filtros);

        return exito(res, "Estanques obtenidos correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener los estanques.", err, 500);
    }
}

export async function getEstanqueById(req, res) {
    /*
    Descripcion:
    Obtiene un estanque por su ID desde MySQL.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el estanque encontrado.
    - 400 si el id recibido no es valido.
    - 404 si no existe el estanque.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const estanque = await EstanqueModel.findById(req.params.id);

        if (!estanque) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Estanque obtenido correctamente.", estanque);
    } catch (err) {
        return error(res, "Error al obtener el estanque.", err, 500);
    }
}

export async function createEstanque(req, res) {
    /*
    Descripcion:
    Crea un nuevo estanque en la base de datos MySQL.
    Antes de crear, valida el body y verifica que no exista otro
    estanque con el mismo codigo dentro de la misma finca.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con el estanque creado.
    - 409 si ya existe un estanque con el mismo codigo en la finca.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const existente = await EstanqueModel.findByCodigoAndFinca(
            req.body.codigo,
            req.body.idFinca,
            null
        );

        if (existente) {
            return error(
                res,
                "Ya existe un estanque con ese codigo en la finca.",
                null,
                409
            );
        }

        const dto = new EstanqueDTO(req.body);
        const nuevo = await EstanqueModel.create(dto);

        return exito(res, "Estanque creado correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear el estanque.", err, 500);
    }
}

export async function updateEstanque(req, res) {
    /*
    Descripcion:
    Actualiza un estanque existente por su ID.
    Antes de actualizar, valida el id, valida el body,
    confirma que el estanque exista y revisa que el codigo no
    pertenezca a otro estanque de la misma finca.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el estanque actualizado.
    - 400 si el id recibido no es valido.
    - 404 si no existe el estanque.
    - 409 si ya existe otro estanque con el mismo codigo en la finca.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const estanqueActual = await EstanqueModel.findById(req.params.id);

        if (!estanqueActual) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        const existente = await EstanqueModel.findByCodigoAndFinca(
            req.body.codigo,
            req.body.idFinca,
            req.params.id
        );

        if (existente) {
            return error(
                res,
                "Ya existe otro estanque con ese codigo en la finca.",
                null,
                409
            );
        }

        const dto = new EstanqueDTO(req.body);
        const actualizado = await EstanqueModel.update(req.params.id, dto);

        return exito(res, "Estanque actualizado correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar el estanque.", err, 500);
    }
}

export async function deleteEstanque(req, res) {
    /*
    Descripcion:
    Elimina logicamente un estanque por su ID.
    No elimina fisicamente el registro de la base de datos.
    El model se encarga de actualizar activo, deleted_at y version.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el estanque eliminado logicamente.
    - 400 si el id recibido no es valido.
    - 404 si no existe el estanque.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const eliminado = await EstanqueModel.remove(req.params.id);

        if (!eliminado) {
            return error(res, "Estanque no encontrado.", null, 404);
        }

        return exito(res, "Estanque eliminado correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar el estanque.", err, 500);
    }
}