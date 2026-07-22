/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.controller.js
Autor: Greivin Arguedas, Ricardo Chaves
Fecha: 04/07/2026
Modulo: Ventas
Descripcion:
Recibe las peticiones HTTP, delega y devuelve respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { mantVentaDTO } from '../dtos/mantVentas.dto.js';
import * as VentaModel from '../models/mantVentas.model.js';
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function getVentas(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de ventas.

    Parametros:
    - Ninguno

    Retorna:
    - Una respuesta JSON con todos los registros de ventas.
    */
    const grupoDatos = req.user.grupoDatos;
    const data = await VentaModel.findAll(grupoDatos);
    return exito(res, 'Ventas obtenidas correctamente.', data);
}

export async function getVentaById(req, res) {
    /*
    Descripcion:
    Obtiene un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a obtener

    Retorna:
    - Una respuesta JSON con el registro de ventas si se encuentra, o un error si no existe.
    */
    const grupoDatos = req.user.grupoDatos;
    const registro = await VentaModel.findById(req.params.id, grupoDatos);
    if (!registro) {
        return error(res, 'Venta no encontrada.', null, 404);
    }
    return exito(res, 'Venta obtenida correctamente.', registro);
}

export async function createVenta(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de venta.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - Una respuesta JSON con el registro de venta creado.
    */

    const grupoDatos = req.user.grupoDatos;

    const { 
        id, 
        finca, 
        estanque, 
        pesoPromedio, 
        tamanoPromedio, 
        cantVendida, 
        precioKilo, 
        fecha, 
        total, 
        colaborador, 
        comprador 
    } = req.body;
    
    const dto = new mantVentaDTO(
        grupoDatos, 
        id, 
        finca, 
        estanque, 
        pesoPromedio, 
        tamanoPromedio, 
        cantVendida, 
        precioKilo, 
        fecha, 
        total, 
        colaborador, 
        comprador
    );

    const nuevoRegistro = await VentaModel.create(dto);

    return exito(res, 'Venta creada correctamente.', nuevoRegistro, 201);
}

export async function updateVenta(req, res) {
    /*
    Descripcion:
    Actualiza un registro de venta existente.

    Parametros:
    - req: Objeto request de Express (req.params.id, req.body)
    - res: Objeto response de Express

    Retorna:
    - Una respuesta JSON con el registro de venta actualizado si se encuentra, o un error si no existe.
    */

    const grupoDatos = req.user.grupoDatos;

    const { 
        id, 
        finca, 
        estanque, 
        pesoPromedio, 
        tamanoPromedio, 
        cantVendida, 
        precioKilo, 
        fecha, 
        total, 
        colaborador, 
        comprador 
    } = req.body;
    
    const dto = new mantVentaDTO( 
        grupoDatos, 
        id, 
        finca, 
        estanque, 
        pesoPromedio, 
        tamanoPromedio, 
        cantVendida, 
        precioKilo, 
        fecha, 
        total, 
        colaborador, 
        comprador
    );
    
    const actualizado = await VentaModel.update(req.params.id, grupoDatos, dto);
    
    if (!actualizado) {
        return error(res, 'Venta no encontrada.', null, 404);
    }

    return exito(res, 'Venta actualizada correctamente.', actualizado);
}

export async function deleteVenta(req, res) {
    /*
    Descripcion:
    Elimina un registro de venta por su ID.
    
    Parametros:
    - id: ID del registro de ventas a eliminar
    
    Retorna:
    - Una respuesta JSON con el registro de venta eliminado si se encuentra, o un error si no existe.
    */
    const grupoDatos = req.user.grupoDatos;
    const eliminado = await VentaModel.remove(req.params.id, grupoDatos);

    if (!eliminado) {
        return error(res, 'Venta no encontrada.', null, 404);
    }

    return exito(res, 'Venta eliminada correctamente.', eliminado);
}