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
//dtos
import { MantCrecimientoDto } from "../dtos/mantCrecimiento.dto.js";

// Servicios
import {
    listarFincas, 
    listarEstanquesPorFinca, 
    obtenerInformacionEstanque, 
    registrarCrecimiento
} from "../services/mantCrecimiento.service.js";

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
    Obtiene la lista de fincas desde el servicio y devuelve
    la respuesta al cliente.

    Parametros:
    - req: Objeto request de Express
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de fincas
    - 500 si ocurre un error al obtener las fincas
    */
    try {
        const fincas = await listarFincas();

        return exito(res, "Fincas obtenidas correctamente.", fincas, 200);

    } catch (err) {
        return error(res, "Error al obtener las fincas.", err.message, 400);
    }
}

export async function obtenerEstanques(req, res) {
    /*
    Descripcion:
    Obtiene la lista de estanques para una finca específica.

    Parametros:
    - req: Objeto request de Express (req.params.fincaId)
    - res: Objeto response de Express

    Retorna:
    - 200 con lista de estanques
    - 500 si ocurre un error al obtener los estanques 
    */
    try {
        const { fincaId } = req.params;
        const estanques = await listarEstanquesPorFinca(fincaId);

        return exito(res, "Estanques obtenidos correctamente.", estanques, 200);

    } catch (err) {
        return error(res, "Error al obtener los estanques.", err.message, 400);
    }
}

export async function obtenerEstanque(req, res) {
    /*
    Descripcion:
    Obtiene la información de un estanque específico.

    Parametros:
    - req: Objeto request de Express (req.params.id)
    - res: Objeto response de Express

    Retorna:
    - 200 con el estanque encontrado
    - 500 si ocurre un error al obtener la información del estanque
    */
    try {
        const { id } = req.params;
        const estanque = await obtenerInformacionEstanque(id);

        return exito(res, "Información del estanque obtenida correctamente.", estanque, 200);

    } catch (err) {
        return error(res, "Error al obtener la información del estanque.", err.message, 400);
    }
}

export async function crearCrecimiento(req, res) {
    /*
    Descripcion:
    Registra un nuevo crecimiento.

    Parametros:
    - req: Objeto request de Express (req.body)
    - res: Objeto response de Express

    Retorna:
    - 201 con el crecimiento registrado
    - 400 si ocurre un error al registrar el crecimiento
    */
    try {
        const dto = new  MantCrecimientoDto(req.body);
        const crecimiento = await registrarCrecimiento(dto);

        return exito(res, "Crecimiento registrado correctamente.", crecimiento, 201);

    } catch (err) {
        return error(res, "Error al registrar el crecimiento.", err.message, 400);
    }
}

/*
export async function obtenerFincas(req, res) {
    try {
        const fincas = await listarFincas();

        return response.exito(res, "Fincas obtenidas correctamente.", fincas, 200);

    } catch (error) {
        console.error(error);
        return response.error(res, "Error al obtener las fincas.", 500);
    }
}

export async function obtenerEstanques(req, res) {
    try {
        const { fincaId } = req.params;
        const estanques = await listarEstanquesPorFinca(fincaId);

        return response.exito(res, "Estanques obtenidos correctamente.", estanques, 200);

    } catch (error) {
        console.error(error);
        return response.error(res, "Error al obtener los estanques.", 500);
    }
}

export async function obtenerEstanque(req, res) {
    try {
        const { id } = req.params;
        const estanque = await obtenerInformacionEstanque(id);

        return response.exito(res, "Información del estanque obtenida correctamente.", estanque, 200);

    } catch (error) {
        console.error(error);
        return response.error(res, "Error al obtener la información del estanque.", 500);
    }
}

export async function crearCrecimiento(req, res) {
    try {
        const crecimientoDto = crearMantCrecimientoDto(req.body);
        const crecimiento = await registrarCrecimiento(crecimientoDto);

        return response.exito(res, "Crecimiento registrado correctamente.", crecimiento, 201);

    } catch (error) {
        console.error(error);
        return response.error(res, "Error al registrar el crecimiento.", 400);
    }
}
*/