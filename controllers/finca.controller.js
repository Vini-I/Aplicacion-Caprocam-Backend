/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: Finca.controller.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Recibe las peticiones HTTP, delega y devuelve respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { FincaDTO } from '../dtos/finca.dto.js';
import * as FincaModel from '../models/finca.model.js';
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function getFincas(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de fincas.

    Parametros:
    - Ninguno

    Retorna:
    - Una respuesta JSON con todos los registros de fincas.
    */

    const data = FincaModel.findAll();
    return exito(res, 'Fincas obtenidas correctamente.', data);
}

export function getFincaById(req, res) {
    /*
    Descripcion:
    Obtiene un registro de finca por su ID CBO.

    Parametros:
    - req.params.idCBO: ID CBO de la finca a buscar.

    Retorna:
    - Una respuesta JSON con el registro de finca correspondiente al ID CBO proporcionado.
    */
    const registro = FincaModel.findByIdCBO(req.params.idCBO);

    if (!registro) {
        return error(res, 'Finca no encontrada.', null, 404);
    }

    return exito(res, 'Finca obtenida correctamente.', registro);
}

export function createFinca(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de finca.

    Parametros:
    - req.body: Objeto con los datos de la finca a crear.

    Retorna:
    - Una respuesta JSON con el registro de finca creado.
    */
    const {
        id,
        idCBO,
        nombreFinca,
        provincia,
        canton,
        distrito,
        otrasSenas,
        propietarioResponsable,
        telefono,
        areaTotal,
        espejosAgua
    } = req.body;

    const dto = new FincaDTO(
        id,
        idCBO,
        nombreFinca,
        provincia,
        canton,
        distrito,
        otrasSenas,
        propietarioResponsable,
        telefono,
        areaTotal,
        espejosAgua
    );
    const nuevaFinca = FincaModel.create(dto);
    return exito(res, "Finca creada correctamente.", nuevaFinca, 201);
}

export function updateFinca(req, res) {
    /*
    Descripcion:
    Actualiza un registro de finca existente.

    Parametros:
    - req.params.idCBO: ID CBO de la finca a actualizar.
    - req.body: Objeto con los datos de la finca a actualizar.

    Retorna:
    - Una respuesta JSON con el registro de finca actualizado.
    */
    const {
        id,
        idCBO,
        nombreFinca,
        provincia,
        canton,
        distrito,
        otrasSenas,
        propietarioResponsable,
        telefono,
        areaTotal,
        espejosAgua
    } = req.body;

    const dto = new FincaDTO(
        id,
        idCBO,
        nombreFinca,
        provincia,
        canton,
        distrito,
        otrasSenas,
        propietarioResponsable,
        telefono,
        areaTotal,
        espejosAgua
    );

    const actualizado = FincaModel.update(req.params.idCBO, dto);
    if (!actualizado) {
        return error(res, "Finca no encontrada.", null, 404);
    }
    return exito(res, "Finca actualizada correctamente.", actualizado);
}

export function deleteFinca(req, res) {
    /*
    Descripcion:
    Elimina un registro de finca existente.

    Parametros:
    - req.params.idCBO: ID CBO de la finca a eliminar.

    Retorna:
    - Una respuesta JSON indicando si la eliminación fue exitosa o no.
    */
    const eliminado = FincaModel.remove(req.params.idCBO);
    if (!eliminado) {
        return error(res, "Finca no encontrada.", null, 404);
    }
    return exito(res, "Finca eliminada correctamente.", eliminado);
}