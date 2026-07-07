/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.controller.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Crecimiento
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/
// DTOs
import { MantCrecimientoDto } from "../dtos/mantCrecimiento.dto.js";

// Servicios
import { isEmpty, isNumeroMayorIgualCero } 
from '../services/mantCrecimiento.service.js';

// Modelos
import * as MantCrecimientoModel from "../models/mantCrecimiento.model.js";

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
La funcion createCrecimiento() y updateCrecimiento()
dependen de esta funcion para trabajar.
*/
function validarCuerpo({ finca, estanque, pesoActual }, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.
    Parametros:
    - finca, estanque, pesoActual: Campos del body
    - res: Objeto response de Express
    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (isEmpty(finca) || isEmpty(estanque)) {
        return error(res, 'Finca y estanque son requeridos.', null, 400);
    }
    if (isEmpty(pesoActual) || !isNumeroMayorIgualCero(pesoActual)) {
        return error(res, 'El peso actual es requerido y debe ser un numero mayor o igual a cero.', null, 422);
    }
    return null;
}
/*

//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de crecimiento.
*/
export async function getCrecimientos(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de crecimiento.
    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express
    Retorna:
    - 200 con lista de registros de crecimiento
    */
    const data = await MantCrecimientoModel.findAll();
    return exito(res, 'Registros de crecimiento obtenidos correctamente.', data);
}

export async function getCrecimientoById(req, res) {
    /*
    Descripcion:
    Obtiene un registro de crecimiento por su ID.
    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express
    Retorna:
    - 200 con el registro encontrado
    - 404 si no existe
    */
    const registro = await MantCrecimientoModel.findById(req.params.id);
    if (!registro) {
        return error(res, 'Registro no encontrado.', null, 404);
    }
    return exito(res, 'Registro obtenido correctamente.', registro);
}

export async function updateCrecimiento(req, res) {
    /*
    Descripcion:
    Actualiza un registro de crecimiento existente.
    Delega la validacion al controller (validarCuerpo) y la
    actualizacion al modelo.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro actualizado
    - 404 si no existe
    - 400/422 si falla la validacion
    */
    const validacionErr = validarCuerpo(req.body, res);
    if (validacionErr) return validacionErr;
    const { grupoDatos, finca, estanque, colaborador, fechaRegistro, pesoActual } = req.body;
    const dto = new MantCrecimientoDto(grupoDatos, finca, estanque, colaborador, fechaRegistro, pesoActual);
    const actualizado = await MantCrecimientoModel.update(req.params.id, dto);
    if (!actualizado) {
        return error(res, "Registro no encontrado", null, 404);
    }
    return exito(res, "Registro de crecimiento actualizado correctamente.", actualizado);
}

export async function createCrecimiento(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de crecimiento.
    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express
    Retorna:
    - 201 con el registro creado
    - 400/422 si falla la validacion
    */
    const validacionErr = validarCuerpo(req.body, res);
    if (validacionErr) return validacionErr;
    const { grupoDatos, finca, estanque, colaborador, fechaRegistro, pesoActual } = req.body;
    const dto = new MantCrecimientoDto(grupoDatos, finca, estanque, colaborador, fechaRegistro, pesoActual);
    const nuevoRegistro = await MantCrecimientoModel.create(dto);
    return exito(res, "Registro de crecimiento creado correctamente.", nuevoRegistro, 201);
}

export async function deleteCrecimiento(req, res) {
    /*
    Descripcion:
    Elimina un registro de crecimiento por su ID.
    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express
    Retorna:
    - 200 con el registro eliminado
    - 404 si no existe
    */
    const eliminado = await MantCrecimientoModel.remove(req.params.id);
    if (!eliminado) {
        return error(res, "Registro no encontrado", null, 404);
    }
    return exito(res, "Registro eliminado correctamente", eliminado);
}
