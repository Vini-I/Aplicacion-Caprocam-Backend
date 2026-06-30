/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantCrecimiento.controller.js
Autor: Greivin Arguedas
Fecha: 28/06/2026
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
import {
    esEstanqueValido,
    esPesoValido,
    calcularIncremento
} from "../services/mantCrecimiento.service.js";

// Modelos
import * as MantCrecimientoModel from "../models/mantCrecimiento.model.js";

// Common
import { exito, error } from '../common/respuestaJson.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada
ruta del modulo de crecimiento.
*/

export async function obtenerFincas(req, res) {
    /*
    Descripcion:
    Obtiene la lista de fincas desde el modelo y devuelve
    la respuesta al cliente.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de fincas
    - 500 si ocurre un error al obtener las fincas
    */
    try {
        const fincas = MantCrecimientoModel.obtenerFincas();

        return exito(res, "Fincas obtenidas correctamente.", fincas, 200);

    } catch (err) {
        return error(res, "Error al obtener las fincas.", err.message, 500);
    }
}

export async function obtenerEstanques(req, res) {
    /*
    Descripcion:
    Obtiene la lista de estanques para una finca especifica.

    Parametros:
    - req: Objeto request de Express (req.params.fincaId)
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de estanques
    - 500 si ocurre un error al obtener los estanques
    */
    try {
        const { fincaId } = req.params;
        const estanques = MantCrecimientoModel.obtenerEstanquesPorFinca(fincaId);

        return exito(res, "Estanques obtenidos correctamente.", estanques, 200);

    } catch (err) {
        return error(res, "Error al obtener los estanques.", err.message, 500);
    }
}

export async function obtenerEstanque(req, res) {
    /*
    Descripcion:
    Obtiene la informacion de un estanque especifico.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el estanque encontrado
    - 404 si el estanque no existe
    - 500 si ocurre un error inesperado
    */
    try {
        const { id } = req.params;
        const estanque = MantCrecimientoModel.obtenerEstanquePorId(id);

        if (!esEstanqueValido(estanque))
            return error(res, "El estanque no existe.", null, 404);

        return exito(res, "Informacion del estanque obtenida correctamente.", {
            id:           estanque.id,
            codigo:       estanque.codigo,
            nombre:       estanque.nombre,
            diasCultivo:  estanque.diasCultivo,
            pesoAnterior: estanque.pesoActual,
            estado:       estanque.estado
        }, 200);

    } catch (err) {
        return error(res, "Error al obtener la informacion del estanque.", err.message, 500);
    }
}

export async function crearCrecimiento(req, res) {
    /*
    Descripcion:
    Registra un nuevo crecimiento para un estanque especifico
    y actualiza su peso actual.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el crecimiento registrado
    - 404 si el estanque no existe
    - 400 si el peso es invalido
    - 500 si ocurre un error inesperado
    */
    try {
        const dto = new MantCrecimientoDto(req.body);

        const estanque = MantCrecimientoModel.obtenerEstanquePorId(dto.estanqueId);

        if (!esEstanqueValido(estanque))
            return error(res, "El estanque no existe.", null, 404);

        if (!esPesoValido(dto.pesoActual))
            return error(res, "El peso actual debe ser un numero mayor que cero.", null, 400);

        const pesoAnterior = Number(estanque.pesoActual);
        const pesoActual   = Number(dto.pesoActual);
        const incremento   = calcularIncremento(pesoAnterior, pesoActual);

        const crecimiento = {
            estanqueId:    dto.estanqueId,
            pesoAnterior,
            pesoActual,
            incremento,
            fechaRegistro: new Date(),
            observacion:   dto.observacion || null
        };

        const id = MantCrecimientoModel.guardarCrecimiento(crecimiento);
        MantCrecimientoModel.actualizarPesoEstanque(dto.estanqueId, pesoActual);

        return exito(res, "Crecimiento registrado correctamente.", { id, ...crecimiento }, 201);

    } catch (err) {
        return error(res, "Error al registrar el crecimiento.", err.message, 500);
    }
}