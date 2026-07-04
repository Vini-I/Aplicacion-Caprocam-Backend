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

let lecturasFisicoQuimicas = [
    {
        id: 1,
        fincaId: 1,
        estanqueId: "E-01",
        fecha: "2026-06-27",

        ph: [
            { valor: 7.8, etiqueta: "mañana" },
            { valor: 7.6, etiqueta: "noche" }
        ],

        salinidad: [
            { valor: 18.0, etiqueta: "mañana" },
            { valor: 18.2, etiqueta: "noche" }
        ],

        temperatura: [
            { valor: 29.0, etiqueta: "mañana" },
            { valor: 28.5, etiqueta: "noche" }
        ],

        oxigeno: [
            { valor: 6.2, etiqueta: "1" }
        ],

        activo: true,
        creadoEn: "2026-06-27T00:00:00"
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de Fisico Quimica.
*/

export async function findAll() {

   /*
    Descripcion:
    Obtiene todas las lecturas registradas.

    Parametros:
    No posee.

    Retorna:
    Lista de lecturas.
    */

    return lecturasFisicoQuimicas;
  
}

export async function findById(id) {


    /*
    Descripcion:
    Busca una lectura por su identificador.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    La lectura encontrada o null.
    */

  return (
    lecturasFisicoQuimicas.find(
      lectura => lectura.id === Number(id)
    ) || null
  )
}

export async function create(dto){

    /*
    Descripcion:
    Agrega una nueva lectura.

    Parametros:
    - dto: Objeto FisicoQuimicaDTO.

    Retorna:
    La nueva lectura creada.
    */

    const nuevaLectura = {
      id: lecturasFisicoQuimicas.length + 1,
      ...dto,
      activo: true,
      creadoEn: new Date().toISOString()
    };

    lecturasFisicoQuimicas.push(nuevaLectura);

    return nuevaLectura;
}

export async function update(id, dto) {

  /*
    Descripcion:
    Actualiza una lectura existente.

    Parametros:
    - id: Identificador de la lectura.
    - dto: Datos a actualizar.

    Retorna:
    La lectura actualizada o null.
    */

    const indice = lecturasFisicoQuimicas.findIndex(
      lectura => lectura.id === Number(id)
    );

    if(indice === -1){
      return null;
    };

    lecturasFisicoQuimicas[indice] = {
      ...lecturasFisicoQuimicas[indice],
      ...dto
    };

    return lecturasFisicoQuimicas[indice];
}

export async function remove(id){

  /*
    Descripcion:
    Realiza el borrado logico de una lectura.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    La lectura actualizada o null.
    */

    const lectura = await findById(id);

    if(!lectura){
      return null
    };

    lectura.activo = !lectura.activo;

    return lectura;
}