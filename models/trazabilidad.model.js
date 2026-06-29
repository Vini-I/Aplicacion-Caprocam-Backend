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

const registrosTrazabilidad = [
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
        activo: true,
        creadoEn: "2026-06-28T00:00:00",
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES DE BASE DE DATOS
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas del acceso a los datos.

*/

export async function obtenerTodosRegistros() {

    /*
    Descripcion:
    Obtiene todos los registros de trazabilidad.

    Parametros:
    No posee.

    Retorna:
    Lista de registros.
    */

    return registrosTrazabilidad;

}

export async function obtenerRegistroPorId(id) {

    /*
    Descripcion:
    Obtiene un registro por su identificador.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    Registro encontrado o null.
    */

    return (
        registrosTrazabilidad.find(
            (registro) => registro.id === Number(id)
        ) || null
    );

}

export async function guardarRegistro(datos) {

    /*
    Descripcion:
    Crea un nuevo registro de trazabilidad.

    Parametros:
    - datos: Informacion del registro.

    Retorna:
    Registro creado.
    */

    const nuevoRegistro = {
        id: registrosTrazabilidad.length + 1,
        ...datos,
        activo: true,
        creadoEn: new Date().toISOString(),
    };

    registrosTrazabilidad.push(nuevoRegistro);

    return nuevoRegistro;

}

export async function actualizarActivo(id) {

    /*
    Descripcion:
    Realiza el borrado logico de un registro.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    Registro actualizado o null.
    */

    const registro = await obtenerRegistroPorId(id);

    if (!registro) {
        return null;
    }

    registro.activo = !registro.activo;

    return registro;

}