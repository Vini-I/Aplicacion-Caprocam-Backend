/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.model.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Fisico Quimica
Descripcion:
Model encargado de las operaciones de datos del
modulo de fisico quimica. Actualmente utiliza
datos mock mientras se implementa la base
de datos.
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

const lecturasFisicoQuimicas = [
    {
        id: 1,
        fincaId: 1,
        estanqueId: "E-01",
        fecha: "2026-06-27",

        ph: [
            { valor: 7.8, etiqueta: "mañana" },
            { valor: 7.6, etiqueta: "noche" },
        ],

        salinidad: [
            { valor: 18.0, etiqueta: "mañana" },
            { valor: 18.2, etiqueta: "noche" },
        ],

        temperatura: [
            { valor: 29.0, etiqueta: "mañana" },
            { valor: 28.5, etiqueta: "noche" },
        ],

        oxigenoDisuelto: [
            { valor: 6.2, etiqueta: "1" },
        ],

        activo: true,
        creadoEn: "2026-06-27T00:00:00",
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES DE BASE DE DATOS
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas del acceso a los datos.

*/

export async function obtenerTodasLasLecturas() {

    /*
    Descripcion:
    Obtiene todas las lecturas de fisico quimica.

    Parametros:
    No posee.

    Retorna:
    Lista de lecturas.
    */

    return lecturasFisicoQuimicas;

}

export async function obtenerLecturaPorId(id) {

    /*
    Descripcion:
    Obtiene una lectura por su identificador.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    Lectura encontrada o null.
    */

    return (
        lecturasFisicoQuimicas.find(
            (lectura) => lectura.id === Number(id)
        ) || null
    );

}

export async function guardarLectura(datos) {

    /*
    Descripcion:
    Guarda una nueva lectura de fisico quimica.

    Parametros:
    - datos: Informacion de la lectura.

    Retorna:
    Lectura creada.
    */

    const nuevaLectura = {
        id: lecturasFisicoQuimicas.length + 1,
        ...datos,
        activo: true,
        creadoEn: new Date().toISOString(),
    };

    lecturasFisicoQuimicas.push(nuevaLectura);

    return nuevaLectura;

}

export async function actualizarActivo(id) {

    /*
    Descripcion:
    Realiza el borrado logico de una lectura.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    Lectura actualizada o null.
    */

    const lectura = await obtenerLecturaPorId(id);

    if (!lectura) {
        return null;
    }

    lectura.activo = !lectura.activo;

    return lectura;

}