/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.model.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Trazabilidad
Descripcion:
Model encargado de las operaciones de datos del
modulo de trazabilidad. Actualmente utiliza datos
mock mientras se implementa la base de datos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Contiene los imports necesarios para el archivo.

*/

// Configuraciones
// import pool from "../config/db.js";

/*
//////////////////////////////////////////////////////////
VARIABLES DE ENTORNO
//////////////////////////////////////////////////////////

Descripcion de seccion

Este archivo actualmente no utiliza variables
de entorno.

*/

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Descripcion de seccion

Datos temporales mientras se implementa la
base de datos.

*/

let registrosTrazabilidad = [
    {
        id: 1,
        fincaId: 1,
        estanqueOrigenId: "E-01",
        estanqueDestinoId: "E-05",
        fecha: "2026-06-28",
        colaboradorId: 3,
        tamano: 8.5,
        dias: 45,
        pl: 5000,
        tipoMovimiento: "SIEMBRA",
        activo: true,
        creadoEn: "2026-06-28T00:00:00"
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de trazabilidad.
*/

export async function findAll() {

    /*
    Descripcion:
    Obtiene todos los registros de trazabilidad.

    Parametros:
    No posee.

    Retorna:
    Lista con todos los registros.
    */

    return registrosTrazabilidad;

}

export async function findById(id) {

    /*
    Descripcion:
    Busca un registro por su ID.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    El registro encontrado o null si no existe.
    */

    return (
        registrosTrazabilidad.find(
            registro => registro.id === Number(id)
        ) || null
    );

}

export async function create(dto) {

    /*
    Descripcion:
    Agrega un nuevo registro de trazabilidad.

    Parametros:
    - dto: Objeto TrazabilidadDTO.

    Retorna:
    El nuevo registro creado.
    */

    const nuevoRegistro = {
        id: registrosTrazabilidad.length + 1,
        ...dto,
        tipoMovimiento: "SIEMBRA",
        activo: true,
        creadoEn: new Date().toISOString()
    };

    registrosTrazabilidad.push(nuevoRegistro);

    return nuevoRegistro;

}

export async function update(id, dto) {

    /*
    Descripcion:
    Actualiza un registro existente.

    Parametros:
    - id: Identificador del registro.
    - dto: Datos actualizados.

    Retorna:
    El registro actualizado o null si no existe.
    */

    const indice = registrosTrazabilidad.findIndex(
        registro => registro.id === Number(id)
    );

    if (indice === -1) {
        return null;
    }

    registrosTrazabilidad[indice] = {
        ...registrosTrazabilidad[indice],
        ...dto
    };

    return registrosTrazabilidad[indice];

}

export async function remove(id) {

    /*
    Descripcion:
    Realiza el borrado logico de un registro.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    El registro actualizado o null si no existe.
    */

    const registro = await findById(id);

    if (!registro) {
        return null;
    }

    registro.activo = !registro.activo;

    return registro;

}