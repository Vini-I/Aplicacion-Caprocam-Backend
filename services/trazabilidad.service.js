/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.service.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Trazabilidad
Descripcion:
Service encargado de contener la logica de
negocio del modulo de trazabilidad.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene los imports necesarios para el archivo.

*/

import { trazabilidadDto } from "../dtos/trazabilidad.dto.js";

import {
    obtenerTodosRegistros,
    obtenerRegistroPorId,
    guardarRegistro,
    actualizarActivo
} from "../models/trazabilidad.model.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES DE NEGOCIO
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas de aplicar la logica
de negocio del modulo de trazabilidad.

*/

export async function getAllRegistros() {

    /*
    Descripcion:
    Obtiene todos los registros de trazabilidad.

    Parametros:
    No posee.

    Retorna:
    Lista de registros.
    */

    return await obtenerTodosRegistros();

}

export async function getById(id) {

    /*
    Descripcion:
    Obtiene un registro por su identificador.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    Registro encontrado o null.
    */

    if (!id) {
        return null;
    }

    return await obtenerRegistroPorId(id);

}

export async function crearRegistro(body) {

    /*
    Descripcion:
    Valida la informacion recibida y crea
    un nuevo registro.

    Parametros:
    - body: Informacion enviada por el cliente.

    Retorna:
    Registro creado.
    */

    const datos = trazabilidadDto(body);

    validarDatos(datos);

    return await guardarRegistro(datos);

}

export async function actualizarActivoService(id) {

    /*
    Descripcion:
    Actualiza el estado activo del registro.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    Registro actualizado o null.
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
    Valida las reglas de negocio del registro
    de trazabilidad.

    Parametros:
    - datos: Informacion del registro.

    Retorna:
    No retorna informacion. Lanza un error
    cuando alguna validacion falla.
    */

    if (!datos.fincaId) {
        throw new Error("La finca es obligatoria.");
    }

    if (!datos.estanqueOrigenId || datos.estanqueOrigenId.trim() === "") {
        throw new Error("El estanque de origen es obligatorio.");
    }

    if (!datos.estanqueDestinoId || datos.estanqueDestinoId.trim() === "") {
        throw new Error("El estanque de destino es obligatorio.");
    }

    if (datos.estanqueOrigenId === datos.estanqueDestinoId) {
        throw new Error("El estanque de origen no puede ser igual al estanque de destino.");
    }

    if (!datos.fecha || datos.fecha.trim() === "") {
        throw new Error("La fecha es obligatoria.");
    }

    if (!datos.colaboradorId) {
        throw new Error("El colaborador es obligatorio.");
    }

    if (Number(datos.tamano) <= 0) {
        throw new Error("El tamaño debe ser mayor a 0.");
    }

    if (Number(datos.dias) <= 0) {
        throw new Error("Los dias deben ser mayores a 0.");
    }

    if (Number(datos.pl) <= 0) {
        throw new Error("El PL debe ser mayor a 0.");
    }

}