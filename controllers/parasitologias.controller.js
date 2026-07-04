/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.controller.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Recibe las peticiones HTTP, delega al servicio y modelo,
y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { ParasitologiaDTO } from '../dtos/parasitologias.dto.js';

// Servicios
import {
    isEmpty,
    isIdValido,
    isNumeroMayorCero,
    isNumeroMayorIgualCero,
    isFechaValida,
    isParasitoValido,
    isInfectadosValido,
    calcularPorcentajeInfeccion,
    calcularGradoInfeccion,
    obtenerNombreGradoInfeccion,
    obtenerNombreParasito,
    obtenerCatalogoParasitos as obtenerCatalogoParasitosService,
    construirResumenParasitologias,
} from '../services/parasitologias.service.js';

// Modelos
import * as ParasitologiaModel from '../models/parasitologias.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Las funciones crearParasitologia() y actualizarParasitologia()
dependen de estas funciones para trabajar.
*/

function validarCuerpo(body, res) {
    /*
    Descripcion:
    Valida los campos del body antes de construir el DTO.

    Parametros:
    - body: Campos del body.
    - res:  Objeto response de Express.

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    const errores = [];

    if (!body) {
        return error(res, 'El body no puede estar vacio.', null, 400);
    }

    if (isEmpty(body.finca)) {
        errores.push('El campo finca es requerido.');
    }

    if (isEmpty(body.estanque)) {
        errores.push('El campo estanque es requerido.');
    }

    if (isEmpty(body.fechaReporte)) {
        errores.push('El campo fechaReporte es requerido.');
    }

    if (isEmpty(body.parasito)) {
        errores.push('El campo parasito es requerido.');
    }

    if (isEmpty(body.camaronesMuestreados)) {
        errores.push('El campo camaronesMuestreados es requerido.');
    }

    if (isEmpty(body.camaronesInfectados)) {
        errores.push('El campo camaronesInfectados es requerido.');
    }

    if (!isEmpty(body.fechaReporte)) {
        if (!isFechaValida(body.fechaReporte)) {
            errores.push('El campo fechaReporte debe tener formato yyyy-mm-dd o dd/mm/aaaa.');
        }
    }

    if (!isEmpty(body.parasito)) {
        if (!isParasitoValido(body.parasito)) {
            errores.push('El campo parasito no es valido.');
        }
    }

    if (!isEmpty(body.camaronesMuestreados)) {
        if (!isNumeroMayorCero(body.camaronesMuestreados)) {
            errores.push('El campo camaronesMuestreados debe ser numerico y mayor que cero.');
        }
    }

    if (!isEmpty(body.camaronesInfectados)) {
        if (!isNumeroMayorIgualCero(body.camaronesInfectados)) {
            errores.push('El campo camaronesInfectados debe ser numerico y mayor o igual que cero.');
        }
    }

    if (
        isNumeroMayorCero(body.camaronesMuestreados) &&
        isNumeroMayorIgualCero(body.camaronesInfectados)
    ) {
        if (!isInfectadosValido(body.camaronesMuestreados, body.camaronesInfectados)) {
            errores.push('Los camarones infectados no pueden ser mayores que los muestreados.');
        }
    }

    if (errores.length > 0) {
        return error(res, 'Datos invalidos para la parasitologia.', errores, 422);
    }

    return null;
}

function validarIdParametro(id, res) {
    /*
    Descripcion:
    Valida que el parametro id sea numerico y mayor a cero.

    Parametros:
    - id:  ID recibido por params.
    - res: Objeto response de Express.

    Retorna:
    - Una respuesta de error si algo falla, null si todo esta bien.
    */
    if (!isIdValido(id)) {
        return error(res, 'El id debe ser numerico y mayor que cero.', null, 400);
    }

    return null;
}

function construirDTO(body) {
    /*
    Descripcion:
    Construye el DTO de parasitologia con los datos recibidos
    y los datos calculados.

    Parametros:
    - body: Campos del body.

    Retorna:
    - Objeto ParasitologiaDTO.
    */
    const parasitoLimpio = String(body.parasito).trim();

    const porcentajeInfeccion = calcularPorcentajeInfeccion(
        body.camaronesMuestreados,
        body.camaronesInfectados
    );

    const gradoInfeccion = calcularGradoInfeccion(porcentajeInfeccion);

    const dto = new ParasitologiaDTO({
        tipoRegistro:         'parasitologia',
        finca:                String(body.finca).trim(),
        fincaNombre:          limpiarTextoOpcional(body.fincaNombre),
        estanque:             String(body.estanque).trim(),
        fechaReporte:         String(body.fechaReporte).trim(),
        responsable:          limpiarTextoOpcional(body.responsable),
        parasito:             parasitoLimpio,
        parasitoNombre:       obtenerNombreParasito(parasitoLimpio),
        camaronesMuestreados: Number(body.camaronesMuestreados),
        camaronesInfectados:  Number(body.camaronesInfectados),
        porcentajeInfeccion:  porcentajeInfeccion,
        gradoInfeccion:       gradoInfeccion,
        gradoInfeccionNombre: obtenerNombreGradoInfeccion(gradoInfeccion),
        observaciones:        limpiarTextoOpcional(body.observaciones),
    });

    return dto;
}

function limpiarTextoOpcional(valor) {
    /*
    Descripcion:
    Limpia un texto opcional recibido en el body.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Texto limpio o string vacio.
    */
    if (valor === undefined) {
        return '';
    }

    if (valor === null) {
        return '';
    }

    return String(valor).trim();
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de parasitologias.
*/

export function obtenerParasitologias(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de parasitologias.
    Permite filtrar por finca, estanque, parasito y fechaReporte.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de registros.
    */
    const filtros = {
        finca:        req.query.finca,
        estanque:     req.query.estanque,
        parasito:     req.query.parasito,
        fechaReporte: req.query.fechaReporte,
    };

    const data = ParasitologiaModel.findAll(filtros);

    return exito(res, 'Parasitologias obtenidas correctamente.', data);
}

export function obtenerParasitologiaPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de parasitologia por su ID.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro encontrado.
    - 400 si el id es invalido.
    - 404 si no existe.
    */
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const registro = ParasitologiaModel.findById(req.params.id);

    if (!registro) {
        return error(res, 'Parasitologia no encontrada.', null, 404);
    }

    return exito(res, 'Parasitologia obtenida correctamente.', registro);
}

export function crearParasitologia(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de parasitologia.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 201 con el registro creado.
    - 400/422 si hay errores de validacion.
    */
    const err = validarCuerpo(req.body, res);

    if (err) {
        return err;
    }

    const dto = construirDTO(req.body);
    const nuevo = ParasitologiaModel.create(dto);

    return exito(res, 'Parasitologia creada correctamente.', nuevo, 201);
}

export function actualizarParasitologia(req, res) {
    /*
    Descripcion:
    Actualiza un registro de parasitologia existente por su ID.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro actualizado.
    - 400/422 si hay errores de validacion.
    - 404 si no existe.
    */
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const err = validarCuerpo(req.body, res);

    if (err) {
        return err;
    }

    const dto = construirDTO(req.body);
    const actualizado = ParasitologiaModel.update(req.params.id, dto);

    if (!actualizado) {
        return error(res, 'Parasitologia no encontrada.', null, 404);
    }

    return exito(res, 'Parasitologia actualizada correctamente.', actualizado);
}

export function eliminarParasitologia(req, res) {
    /*
    Descripcion:
    Elimina logicamente un registro de parasitologia por su ID.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con el registro eliminado.
    - 400 si el id es invalido.
    - 404 si no existe.
    */
    const errId = validarIdParametro(req.params.id, res);

    if (errId) {
        return errId;
    }

    const eliminado = ParasitologiaModel.remove(req.params.id);

    if (!eliminado) {
        return error(res, 'Parasitologia no encontrada.', null, 404);
    }

    return exito(res, 'Parasitologia eliminada correctamente.', eliminado);
}

export function obtenerResumenParasitologias(req, res) {
    /*
    Descripcion:
    Obtiene un resumen general de los registros de parasitologias.
    Permite filtrar por finca, estanque, parasito y fechaReporte.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con resumen de parasitologias.
    */
    const filtros = {
        finca:        req.query.finca,
        estanque:     req.query.estanque,
        parasito:     req.query.parasito,
        fechaReporte: req.query.fechaReporte,
    };

    const registros = ParasitologiaModel.findAll(filtros);
    const resumen = construirResumenParasitologias(registros);

    return exito(res, 'Resumen de parasitologias obtenido correctamente.', resumen);
}

export function obtenerCatalogoParasitos(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de parasitos disponibles.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con catalogo de parasitos.
    */
    const data = obtenerCatalogoParasitosService();

    return exito(res, 'Catalogo de parasitos obtenido correctamente.', data);
}