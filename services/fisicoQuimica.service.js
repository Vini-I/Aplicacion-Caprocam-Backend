/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.service.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Fisico Quimica
Descripcion:
Service encargado de contener la logica de
negocio del modulo de fisico quimica.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene los imports necesarios para el archivo.

*/

import { fisicoQuimicaDto } from "../dtos/fisicoQuimica.dto.js";

import {
    obtenerTodasLasLecturas,
    obtenerLecturaPorId,
    guardarLectura,
    actualizarActivo,
} from "../models/fisicoQuimica.model.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES DE NEGOCIO
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas de aplicar la logica
de negocio del modulo de fisico quimica.

*/

export async function getAllLecturas() {

    /*
    Descripcion:
    Obtiene todas las lecturas registradas.

    Parametros:
    No posee.

    Retorna:
    Lista de lecturas.
    */

    return await obtenerTodasLasLecturas();

}

export async function getById(id) {

    /*
    Descripcion:
    Obtiene una lectura por su identificador.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    Lectura encontrada o null.
    */

    if (!id) {
        return null;
    }

    return await obtenerLecturaPorId(id);

}

export async function crearLectura(body) {

    /*
    Descripcion:
    Valida la informacion recibida y crea
    una nueva lectura.

    Parametros:
    - body: Informacion enviada por el cliente.

    Retorna:
    Lectura creada.
    */

    const datos = fisicoQuimicaDto(body);

    validarDatos(datos);

    return await guardarLectura(datos);

}

export async function actualizarActivoService(id) {

    /*
    Descripcion:
    Actualiza el estado activo de una lectura.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    Lectura actualizada o null.
    */

    if (!id) {
        return null;
    }

    return await actualizarActivo(id);

}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRIVADAS
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones auxiliares utilizadas por el service.

*/

function validarDatos(datos) {

    /*
    Descripcion:
    Verifica que la informacion recibida
    cumpla las reglas del negocio.

    Parametros:
    - datos: Informacion de la lectura.

    Retorna:
    No retorna informacion. Lanza un error
    cuando alguna validacion falla.
    */

    if (!datos.fincaId) {
        throw new Error("La finca es obligatoria.");
    }

    if (!datos.estanqueId || datos.estanqueId.trim() === "") {
        throw new Error("El estanque es obligatorio.");
    }

    if (!datos.fecha || datos.fecha.trim() === "") {
        throw new Error("La fecha es obligatoria.");
    }

    if (!Array.isArray(datos.ph) || datos.ph.length === 0) {
        throw new Error("El pH es obligatorio.");
    }

    if (!Array.isArray(datos.salinidad) || datos.salinidad.length === 0) {
        throw new Error("La salinidad es obligatoria.");
    }

    if (!Array.isArray(datos.temperatura) || datos.temperatura.length === 0) {
        throw new Error("La temperatura es obligatoria.");
    }

    if (!Array.isArray(datos.oxigenoDisuelto) || datos.oxigenoDisuelto.length === 0) {
        throw new Error("El oxigeno disuelto es obligatorio.");
    }

}