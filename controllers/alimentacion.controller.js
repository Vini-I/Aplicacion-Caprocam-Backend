/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     alimentacion.controller.js
Autor:       Felipe Salas
Fecha:       29/06/2026
Modulo:      Alimentacion
Descripcion:
Controlador del modulo de alimentacion. Recibe la
peticion HTTP, delega la validacion al servicio,
delega el acceso a datos al modelo, y devuelve la
respuesta estandarizada al cliente.
No realiza validaciones de negocio ni accede a la BD.
//////////////////////////////////////////////////////////
*/
 
/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
 
Servicios
*/
 
import { validarRegistro }
    from '../services/alimentacion.service.js';
 
// Modelos
import * as AlimentacionModel
    from '../models/alimentacion.model.js';
 
// DTOs
import { AlimentacionDTO }
    from '../dtos/alimentacion.dto.js';
 
// Common
import { exito, error } from '../../../common/respuestaJson.js';
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
 
Una funcion por cada endpoint del modulo.
Cada funcion: recibe req/res → delega → responde.
*/
 
export function getAlimentaciones(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de alimentacion.
 
    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el array de registros.
    */
    const data = AlimentacionModel.findAll();
    return exito(res, 'Registros obtenidos correctamente.', data);
}
 
export function getAlimentacionById(req, res) {
    /*
    Descripcion:
    Obtiene un registro de alimentacion por su ID.
 
    Parametros:
    - req: Objeto request de Express (req.params.id).
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el registro encontrado.
    - 404 si el registro no existe.
    */
    const registro = AlimentacionModel.findById(req.params.id);
 
    if (!registro)
        return error(res, 'Registro no encontrado.', null, 404);
 
    return exito(res, 'Registro obtenido correctamente.', registro);
}
 
export function createAlimentacion(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de alimentacion.
    Delega la validacion al servicio y la persistencia
    al modelo.
 
    Parametros:
    - req: Objeto request de Express (req.body).
    - res: Objeto response de Express.
 
    Retorna:
    - 201 con el registro creado.
    - 422 si los datos no pasan la validacion de negocio.
    */
    const {
        finca, estanque, fecha, hora, metodo,
        cantidadKg, presentacion, proveedor,
        tipoAlimento, observaciones,
    } = req.body;
 
    const errores = validarRegistro({
        finca, estanque, fecha, hora, metodo, cantidadKg,
    });
 
    if (errores.length > 0)
        return error(res, errores[0], null, 422);
 
    const dto = new AlimentacionDTO({
        finca,
        estanque,
        fecha,
        hora,
        metodo,
        cantidadKg:   Number(cantidadKg),
        presentacion: presentacion  ?? '',
        proveedor:    proveedor     ?? '',
        tipoAlimento: tipoAlimento  ?? '',
        observaciones: observaciones ?? '',
    });
 
    const nuevo = AlimentacionModel.create({ ...dto });
 
    return exito(res, 'Registro creado correctamente.', nuevo, 201);
}
 
export function updateAlimentacion(req, res) {
    /*
    Descripcion:
    Actualiza un registro existente de alimentacion.
    Delega la validacion al servicio y la actualizacion
    al modelo.
 
    Parametros:
    - req: Objeto request de Express (req.params.id, req.body).
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el registro actualizado.
    - 422 si los datos no pasan la validacion de negocio.
    - 404 si el registro no existe.
    */
    const {
        finca, estanque, fecha, hora, metodo,
        cantidadKg, presentacion, proveedor,
        tipoAlimento, observaciones,
    } = req.body;
 
    const errores = validarRegistro({
        finca, estanque, fecha, hora, metodo, cantidadKg,
    });
 
    if (errores.length > 0)
        return error(res, errores[0], null, 422);
 
    const dto = new AlimentacionDTO({
        finca,
        estanque,
        fecha,
        hora,
        metodo,
        cantidadKg:    Number(cantidadKg),
        presentacion:  presentacion  ?? '',
        proveedor:     proveedor     ?? '',
        tipoAlimento:  tipoAlimento  ?? '',
        observaciones: observaciones ?? '',
    });
 
    const actualizado = AlimentacionModel.update(
        req.params.id,
        { ...dto }
    );
 
    if (!actualizado)
        return error(res, 'Registro no encontrado.', null, 404);
 
    return exito(
        res,
        'Registro actualizado correctamente.',
        actualizado
    );
}
 
export function deleteAlimentacion(req, res) {
    /*
    Descripcion:
    Elimina un registro de alimentacion por su ID.
 
    Parametros:
    - req: Objeto request de Express (req.params.id).
    - res: Objeto response de Express.
 
    Retorna:
    - 200 con el registro eliminado.
    - 404 si el registro no existe.
    */
    const eliminado = AlimentacionModel.remove(req.params.id);
 
    if (!eliminado)
        return error(res, 'Registro no encontrado.', null, 404);
 
    return exito(
        res,
        'Registro eliminado correctamente.',
        eliminado
    );
}