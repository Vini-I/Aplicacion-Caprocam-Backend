/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.controller.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Recibe las peticiones HTTP, usa el modelo mock,
aplica reglas del servicio y devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { EnfermedadDTO } from '../dtos/enfermedades.dto.js';

// Servicios
import {
    isEmpty,
    isIdValido,
    isNumeroMayorIgualCero,
    isFechaValida,
    isEnfermedadesValidas,
    isSeveridadValida,
    obtenerNombresEnfermedades,
    obtenerNombreSeveridad,
    obtenerCatalogoEnfermedades as obtenerCatalogoEnfermedadesService,
    obtenerCatalogoSeveridades as obtenerCatalogoSeveridadesService,
    construirResumenEnfermedades,
} from '../services/enfermedades.service.js';

// Modelos
import * as EnfermedadModel from '../models/enfermedades.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Las funciones crearEnfermedad() y actualizarEnfermedad()
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
    - Una respuesta de error si algo falla.
    - null si todo esta bien.
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

    if (isEmpty(body.enfermedades)) {
        errores.push('El campo enfermedades es requerido.');
    }

    if (isEmpty(body.severidad)) {
        errores.push('El campo severidad es requerido.');
    }

    if (isEmpty(body.reporte)) {
        errores.push('El campo reporte es requerido.');
    }

    if (!isEmpty(body.fechaReporte)) {
        if (!isFechaValida(body.fechaReporte)) {
            errores.push('El campo fechaReporte debe tener formato yyyy-mm-dd.');
        }
    }

    if (!isEmpty(body.enfermedades)) {
        if (!isEnfermedadesValidas(body.enfermedades)) {
            errores.push('El campo enfermedades debe ser una lista con valores validos.');
        }
    }

    if (!isEmpty(body.severidad)) {
        if (!isSeveridadValida(body.severidad)) {
            errores.push('El campo severidad no es valido.');
        }
    }

    if (!isEmpty(body.mortalidad)) {
        if (!isNumeroMayorIgualCero(body.mortalidad)) {
            errores.push('El campo mortalidad debe ser numerico y mayor o igual que cero.');
        }
    }

    if (errores.length > 0) {
        return error(res, 'Datos invalidos para la enfermedad.', errores, 422);
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
    - Una respuesta de error si algo falla.
    - null si todo esta bien.
    */

    if (!isIdValido(id)) {
        return error(res, 'El id debe ser numerico y mayor que cero.', null, 400);
    }

    return null;
}

function construirDTO(body) {
    /*
    Descripcion:
    Construye el DTO de enfermedad con los datos recibidos
    y los nombres visibles calculados.

    Parametros:
    - body: Campos del body.

    Retorna:
    - Objeto EnfermedadDTO.
    */

    const enfermedadesLimpias = limpiarListaEnfermedades(body.enfermedades);
    const severidadLimpia = String(body.severidad).trim();

    const dto = new EnfermedadDTO({
        tipoRegistro:       'enfermedad',
        finca:              String(body.finca).trim(),
        fincaNombre:        limpiarTextoOpcional(body.fincaNombre),
        estanque:           String(body.estanque).trim(),
        fechaReporte:       String(body.fechaReporte).trim(),
        responsable:        limpiarTextoOpcional(body.responsable),
        enfermedades:       enfermedadesLimpias,
        enfermedadesNombre: obtenerNombresEnfermedades(enfermedadesLimpias),
        severidad:          severidadLimpia,
        severidadNombre:    obtenerNombreSeveridad(severidadLimpia),
        mortalidad:         normalizarMortalidad(body.mortalidad),
        reporte:            String(body.reporte).trim(),
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

function limpiarListaEnfermedades(enfermedades) {
    /*
    Descripcion:
    Limpia la lista de enfermedades recibida en el body.

    Parametros:
    - enfermedades: Lista recibida.

    Retorna:
    - Lista de enfermedades limpias.
    */

    const lista = [];

    if (Array.isArray(enfermedades) === false) {
        return lista;
    }

    for (let i = 0; i < enfermedades.length; i++) {
        lista.push(String(enfermedades[i]).trim());
    }

    return lista;
}

function normalizarMortalidad(valor) {
    /*
    Descripcion:
    Normaliza el valor de mortalidad. Si no viene,
    se toma como cero.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero de mortalidad.
    */

    if (valor === undefined) {
        return 0;
    }

    if (valor === null) {
        return 0;
    }

    if (String(valor).trim().length === 0) {
        return 0;
    }

    return Number(valor);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de enfermedades.
*/

export function obtenerEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de enfermedades.
    Permite filtrar por finca, estanque, severidad y fechaReporte.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con lista de registros.
    */

    const filtros = {
        finca:        req.query.finca,
        estanque:     req.query.estanque,
        severidad:    req.query.severidad,
        fechaReporte: req.query.fechaReporte,
    };

    const data = EnfermedadModel.findAll(filtros);

    return exito(res, 'Enfermedades obtenidas correctamente.', data);
}

export function obtenerEnfermedadPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de enfermedad por su ID.

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

    const registro = EnfermedadModel.findById(req.params.id);

    if (!registro) {
        return error(res, 'Enfermedad no encontrada.', null, 404);
    }

    return exito(res, 'Enfermedad obtenida correctamente.', registro);
}

export function crearEnfermedad(req, res) {
    /*
    Descripcion:
    Crea un nuevo registro de enfermedad.

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
    const nuevo = EnfermedadModel.create(dto);

    return exito(res, 'Enfermedad creada correctamente.', nuevo, 201);
}

export function actualizarEnfermedad(req, res) {
    /*
    Descripcion:
    Actualiza un registro de enfermedad existente por su ID.

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
    const actualizado = EnfermedadModel.update(req.params.id, dto);

    if (!actualizado) {
        return error(res, 'Enfermedad no encontrada.', null, 404);
    }

    return exito(res, 'Enfermedad actualizada correctamente.', actualizado);
}

export function eliminarEnfermedad(req, res) {
    /*
    Descripcion:
    Elimina logicamente un registro de enfermedad por su ID.

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

    const eliminado = EnfermedadModel.remove(req.params.id);

    if (!eliminado) {
        return error(res, 'Enfermedad no encontrada.', null, 404);
    }

    return exito(res, 'Enfermedad eliminada correctamente.', eliminado);
}

export function obtenerResumenEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene un resumen general de los registros de enfermedades.
    Permite filtrar por finca, estanque, severidad y fechaReporte.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con resumen de enfermedades.
    */

    const filtros = {
        finca:        req.query.finca,
        estanque:     req.query.estanque,
        severidad:    req.query.severidad,
        fechaReporte: req.query.fechaReporte,
    };

    const registros = EnfermedadModel.findAll(filtros);
    const resumen = construirResumenEnfermedades(registros);

    return exito(res, 'Resumen de enfermedades obtenido correctamente.', resumen);
}

export function obtenerCatalogoEnfermedades(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de enfermedades disponibles.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con catalogo de enfermedades.
    */

    const data = obtenerCatalogoEnfermedadesService();

    return exito(res, 'Catalogo de enfermedades obtenido correctamente.', data);
}

export function obtenerCatalogoSeveridades(req, res) {
    /*
    Descripcion:
    Obtiene el catalogo de severidades disponibles.

    Parametros:
    - req: Objeto request de Express.
    - res: Objeto response de Express.

    Retorna:
    - 200 con catalogo de severidades.
    */

    const data = obtenerCatalogoSeveridadesService();

    return exito(res, 'Catalogo de severidades obtenido correctamente.', data);
}