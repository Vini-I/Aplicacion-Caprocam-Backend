/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.service.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Servicio encargado de la logica de negocio del
modulo de compradores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Modelos
import {
    obtenerTodosLosCompradores,
    obtenerCompradorPorId,
    crearComprador,
    actualizarComprador,
    eliminarComprador
} from "../models/compradores.model.js";

// DTOs
import {
    compradorDTO,
    listaCompradoresDTO
} from "../dtos/compradores.dto.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function listarCompradores() {

    try {

        const compradores =
            await obtenerTodosLosCompradores();

        return listaCompradoresDTO(compradores);

    } catch (error) {

        throw error;

    }

}

export async function obtenerComprador(id) {

    try {

        validarId(id);

        const comprador =
            await obtenerCompradorPorId(id);

        if (!comprador) {

            return null;

        }

        return compradorDTO(comprador);

    } catch (error) {

        throw error;

    }

}

export async function registrarComprador(datos) {

    try {

        validarComprador(datos);

        const nuevoComprador =
            await crearComprador(datos);

        return compradorDTO(nuevoComprador);

    } catch (error) {

        throw error;

    }

}

export async function editarComprador(id, datos) {

    try {

        validarId(id);

        validarComprador(datos);

        const comprador =
            await actualizarComprador(
                id,
                datos
            );

        if (!comprador) {

            return null;

        }

        return compradorDTO(comprador);

    } catch (error) {

        throw error;

    }

}

export async function desactivarComprador(id) {

    try {

        validarId(id);

        return await eliminarComprador(id);

    } catch (error) {

        throw error;

    }

}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function validarComprador(datos) {

    /*
    Descripcion:
    Valida la informacion del comprador antes de
    realizar cualquier operacion.

    Parametros:
    - datos: Informacion del comprador.

    Retorna:
    No posee.

    */

    if (!datos.nombre?.trim()) {

        throw new Error(
            "El nombre del comprador es obligatorio."
        );

    }

    if (!datos.contacto?.trim()) {

        throw new Error(
            "El contacto es obligatorio."
        );

    }

    if (!datos.telefono?.trim()) {

        throw new Error(
            "El telefono es obligatorio."
        );

    }

}

// La obtenerComprador(), editarComprador() y
// desactivarComprador() dependen de esta funcion
function validarId(id) {

    /*
    Descripcion:
    Valida que el identificador recibido sea
    valido.

    Parametros:
    - id: Identificador del comprador.

    Retorna:
    No posee.

    */

    if (!id || Number(id) <= 0) {

        throw new Error(
            "El identificador del comprador no es valido."
        );

    }

}

/*
//////////////////////////////////////////////////////////
PRUEBAS
//////////////////////////////////////////////////////////

GET /api/v1/compradores

200 OK

*/