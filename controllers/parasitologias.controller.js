/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.controller.js
Autor: Andres Gutierrez
Fecha: 03/07/2026
Modulo: Parasitologias
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

import { ParasitologiaDTO, ParasitoParasitologia } from "../dtos/parasitologias.dto.js";

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
    isNumeroOpcionalMayorCero,
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

import * as ParasitologiaModel from "../models/parasitologias.model.js";

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
    fecha, parasito permitido y relacion entre camarones muestreados
    e infectados.

    Parametros:
    - body: Campos recibidos en el body de la peticion.
    - res: Objeto response de Express.

    Retorna:
    - Respuesta de error si existen datos invalidos.
    - null si todos los datos son validos.
    */

    const errores = [];

    if (isEmpty(body.grupoDatos)) {
        /*
        grupoDatos se deja como opcional porque el DTO puede colocar
        1 como valor temporal para pruebas mientras se implementa
        autenticacion completa.
        */
    } else {
        if (!isNumeroMayorCero(body.grupoDatos)) {
            errores.push("El campo grupoDatos debe ser numerico y mayor que cero.");
        }
    }

    if (isEmpty(body.fincaId)) {
        errores.push("El campo fincaId es requerido.");
    }

    if (isEmpty(body.estanqueId)) {
        errores.push("El campo estanqueId es requerido.");
    }

    if (isEmpty(body.fechaReporte)) {
        errores.push("El campo fechaReporte es requerido.");
    }

    if (isEmpty(body.parasito)) {
        errores.push("El campo parasito es requerido.");
    }

    if (isEmpty(body.camaronesMuestreados)) {
        errores.push("El campo camaronesMuestreados es requerido.");
    }

    if (isEmpty(body.camaronesInfectados)) {
        errores.push("El campo camaronesInfectados es requerido.");
    }

    if (!isNumeroMayorCero(body.fincaId)) {
        errores.push("El campo fincaId debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorCero(body.estanqueId)) {
        errores.push("El campo estanqueId debe ser numerico y mayor que cero.");
    }

    if (!isNumeroOpcionalMayorCero(body.colaboradorId)) {
        errores.push("El campo colaboradorId debe ser numerico y mayor que cero.");
    }

    if (!isEmpty(body.fechaReporte)) {
        if (!isFechaValida(body.fechaReporte)) {
            errores.push("El campo fechaReporte debe tener formato yyyy-mm-dd o dd/mm/aaaa.");
        }
    }

    if (!isEmpty(body.parasito)) {
        if (!isParasitoValido(body.parasito)) {
            errores.push(
                "Parasito invalido. Opciones: " + Object.values(ParasitoParasitologia).join(", ")
            );
        }
    }

    if (!isNumeroMayorCero(body.camaronesMuestreados)) {
        errores.push("El campo camaronesMuestreados debe ser numerico y mayor que cero.");
    }

    if (!isNumeroMayorIgualCero(body.camaronesInfectados)) {
        errores.push("El campo camaronesInfectados debe ser numerico y mayor o igual que cero.");
    }

    if (
        isNumeroMayorCero(body.camaronesMuestreados) &&
        isNumeroMayorIgualCero(body.camaronesInfectados)
    ) {
        if (!isInfectadosValido(body.camaronesMuestreados, body.camaronesInfectados)) {
            errores.push("Los camarones infectados no pueden ser mayores que los muestreados.");
        }
    }

    if (errores.length > 0) {
        return error(res, "Datos invalidos para la parasitologia.", errores, 422);
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

function construirDTO(body) {
    /*
    Descripcion:
    Construye el DTO de parasitologia con los datos recibidos
    y los datos calculados antes de enviarlos al modelo.

    Parametros:
    - body: Campos recibidos en el body.

    Retorna:
    - Objeto ParasitologiaDTO.
    */

    const porcentajeInfeccion = calcularPorcentajeInfeccion(
        body.camaronesMuestreados,
        body.camaronesInfectados
    );

    const gradoInfeccion = calcularGradoInfeccion(porcentajeInfeccion);

    const dto = new ParasitologiaDTO({
        grupoDatos: body.grupoDatos,
        fincaId: body.fincaId,
        estanqueId: body.estanqueId,
        colaboradorId: body.colaboradorId,
        tipoRegistro: "parasitologia",
        fechaReporte: body.fechaReporte,
        responsable: body.responsable,
        parasito: body.parasito,
        camaronesMuestreados: body.camaronesMuestreados,
        camaronesInfectados: body.camaronesInfectados,
        porcentajeInfeccion: porcentajeInfeccion,
        gradoInfeccion: gradoInfeccion,
        observaciones: body.observaciones
    });

    return dto;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada ruta
del modulo de parasitologias.
*/

export async function obtenerParasitologias(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros activos de parasitologias desde MySQL.
    Permite filtrar por fincaId, estanqueId, grupoDatos, parasito
    y fechaReporte mediante query params.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de parasitologias.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const filtros = {
            grupoDatos: req.query.grupoDatos,
            fincaId: req.query.fincaId,
            estanqueId: req.query.estanqueId,
            parasito: req.query.parasito,
            fechaReporte: req.query.fechaReporte
        };

        const data = await ParasitologiaModel.findAll(filtros);

        return exito(res, "Parasitologias obtenidas correctamente.", data);
    } catch (err) {
        return error(res, "Error al obtener las parasitologias.", err, 500);
    }
}

export async function obtenerParasitologiaPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de parasitologia por su ID desde MySQL.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la parasitologia encontrada.
    - 400 si el id recibido no es valido.
    - 404 si no existe la parasitologia.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const parasitologia = await ParasitologiaModel.findById(req.params.id);

        if (!parasitologia) {
            return error(res, "Parasitologia no encontrada.", null, 404);
        }

        return exito(res, "Parasitologia obtenida correctamente.", parasitologia);
    } catch (err) {
        return error(res, "Error al obtener la parasitologia.", err, 500);
    }
}

export async function crearParasitologia(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de parasitologia en la base de datos MySQL.
    Antes de crear, valida el body y calcula automaticamente el
    porcentaje y grado de infeccion.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con la parasitologia creada.
    - 422 si hay errores de validacion.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const err = validarCuerpo(req.body, res);

        if (err) {
            return err;
        }

        const dto = construirDTO(req.body);
        const nuevo = await ParasitologiaModel.create(dto);

        return exito(res, "Parasitologia creada correctamente.", nuevo, 201);
    } catch (err) {
        return error(res, "Error al crear la parasitologia.", err, 500);
    }
}

export async function actualizarParasitologia(req, res) {
    /*
    Descripcion:
    Actualiza un registro de parasitologia existente por su ID.
    Antes de actualizar, valida el id, valida el body y confirma
    que el registro exista.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la parasitologia actualizada.
    - 400 si el id recibido no es valido.
    - 404 si no existe la parasitologia.
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

        const parasitologiaActual = await ParasitologiaModel.findById(req.params.id);

        if (!parasitologiaActual) {
            return error(res, "Parasitologia no encontrada.", null, 404);
        }

        const dto = construirDTO(req.body);
        const actualizado = await ParasitologiaModel.update(req.params.id, dto);

        return exito(res, "Parasitologia actualizada correctamente.", actualizado);
    } catch (err) {
        return error(res, "Error al actualizar la parasitologia.", err, 500);
    }
}

export async function eliminarParasitologia(req, res) {
    /*
    Descripcion:
    Elimina logicamente un registro de parasitologia por su ID.
    No elimina fisicamente el registro de la base de datos.
    El model se encarga de actualizar activo, deleted_at y version.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con la parasitologia eliminada logicamente.
    - 400 si el id recibido no es valido.
    - 404 si no existe la parasitologia.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const errId = validarIdParametro(req.params.id, res);

        if (errId) {
            return errId;
        }

        const eliminado = await ParasitologiaModel.remove(req.params.id);

        if (!eliminado) {
            return error(res, "Parasitologia no encontrada.", null, 404);
        }

        return exito(res, "Parasitologia eliminada correctamente.", eliminado);
    } catch (err) {
        return error(res, "Error al eliminar la parasitologia.", err, 500);
    }
}

export async function obtenerResumenParasitologias(req, res) {
    /*
    Descripcion:
    Obtiene un resumen general de los registros de parasitologias.
    Permite filtrar por fincaId, estanqueId, grupoDatos, parasito
    y fechaReporte.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con resumen de parasitologias.
    - 500 si ocurre un error en la base de datos.
    */

    try {
        const filtros = {
            grupoDatos: req.query.grupoDatos,
            fincaId: req.query.fincaId,
            estanqueId: req.query.estanqueId,
            parasito: req.query.parasito,
            fechaReporte: req.query.fechaReporte
        };

        const registros = await ParasitologiaModel.findAll(filtros);
        const resumen = construirResumenParasitologias(registros);

        return exito(res, "Resumen de parasitologias obtenido correctamente.", resumen);
    } catch (err) {
        return error(res, "Error al obtener el resumen de parasitologias.", err, 500);
    }
}

export function obtenerCatalogoParasitos(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de parasitos disponibles para el modulo.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con catalogo de parasitos.
    */

    const data = obtenerCatalogoParasitosService();

    return exito(res, "Catalogo de parasitos obtenido correctamente.", data);
}