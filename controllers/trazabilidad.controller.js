/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.controller.js
Autor: Brandon
Fecha: 03/07/2026
Modulo: Trazabilidad
Descripcion:
Recibe las peticiones HTTP, delega al model y
devuelve la respuesta al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/
import { TrazabilidadDTO } from '../dtos/trazabilidad.dto.js';

// Servicios
import { isIdValido } from '../services/trazabilidad.service.js';

// Modelos
import * as TrazabilidadModel from '../models/trazabilidad.model.js';

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene los endpoints del modulo de trazabilidad.
La validacion de presencia y formato del body ya la
resuelve trazabilidad.middleware.js (validarTrazabilidad)
antes de llegar aqui. Este archivo solo se encarga de
reglas de negocio que requieren consultar la base de
datos (colaborador desde el JWT, estanque ocupado).
*/

export async function obtenerTodosLosRegistros(req, res) {
    /*
    Descripcion:
    Obtiene todos los registros de trazabilidad.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de registros
    - 500 si ocurre un error inesperado
    */
    try {
        const grupoDatos = req.user.grupoDatos;

        const data = await TrazabilidadModel.findAll(grupoDatos);
        return exito(res, 'Registros obtenidos correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener los registros.', err);
    }
}

export async function obtenerRegistroPorId(req, res) {
    /*
    Descripcion:
    Obtiene un registro de trazabilidad por su ID.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el registro encontrado
    - 404 si no existe
    - 500 si ocurre un error inesperado
    */
    try {
        const grupoDatos = req.user.grupoDatos;

        const data = await TrazabilidadModel.findById(req.params.id, grupoDatos);

        if (!data)
            return error(res, 'Registro no encontrado.', null, 404);

        return exito(res, 'Registro obtenido correctamente.', data);
    } catch (err) {
        return error(res, 'Error al obtener el registro.', err);
    }
}

export async function registrarRegistro(req, res) {
    /*
    Descripcion:
    Registra un nuevo movimiento de trazabilidad. El
    colaborador responsable se toma del JWT (quien esta
    autenticado), no del body, para que quede registrado
    automaticamente quien hizo el movimiento.

    IMPORTANTE: esto depende de que el token incluya
    colaboradorId en su payload. Mientras el login de
    operarios (verificar-pin) no emita ese JWT con
    colaboradorId, esta ruta va a fallar con 401/400
    para ese flujo -- es un pendiente confirmado con
    el lider de backend (Marco), no un bug de este modulo.

    Parametros:
    - req: Objeto request de Express (req.body, req.user)
    - res: Objeto response de Express

    Retorna:
    - 201 con el registro creado
    - 400 si hay errores de validacion
    - 401 si el token no trae colaboradorId
    - 500 si ocurre un error inesperado
    */
    const {
        fincaId,
        estanqueOrigenId,
        estanqueDestinoId,
        fecha,
        tamano,
        dias,
        pl,
    } = req.body;

    const colaboradorId = req.user?.colaboradorId;

    if (!isIdValido(colaboradorId))
        return error(
            res,
            'No se pudo identificar al colaborador desde la ' +
            'sesion (token sin colaboradorId).',
            null,
            401
        );

    try {
        const grupoDatos = req.user.grupoDatos;

        const estanqueOcupado = await TrazabilidadModel.estanqueDestinoOcupado(
            estanqueDestinoId,
            grupoDatos
        );

        if (estanqueOcupado)
            return error(
                res,
                'El estanque destino ya tiene un movimiento activo. Debe ' +
                'liberarse antes de recibir un nuevo movimiento.',
                null,
                400
            );

        const dto = new TrazabilidadDTO({
            grupoDatos,
            fincaId,
            estanqueOrigenId,
            estanqueDestinoId,
            colaboradorId,
            fecha,
            tamano,
            dias,
            pl,
        });
        const data = await TrazabilidadModel.create(dto);
        return exito(res, 'Registro guardado correctamente.', data, 201);
    } catch (err) {
        return error(res, 'Error al guardar el registro.', err);
    }
}

/*
Trazabilidad es un historico de movimientos: no existe
desactivarRegistro ni borrado logico. Si se necesita corregir
un registro capturado mal, se hace un registro correctivo
nuevo, no se oculta el original. (Se quito el 19/07 -- no
estaba en lo que pidio la companera: Registrar, GetAll,
GetPorId)
*/