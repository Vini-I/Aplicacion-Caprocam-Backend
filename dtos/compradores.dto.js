/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.dto.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
DTO encargado de controlar la informacion que
es enviada al frontend desde el modulo de
compradores.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Descripcion de seccion

Este archivo no requiere imports.

*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function compradorDTO(comprador) {

    /*
    Descripcion:
    Convierte un comprador al formato que sera
    enviado al frontend.

    Parametros:
    - comprador: Comprador obtenido desde el model.

    Retorna:
    Objeto con los campos permitidos.
    */

    return {
        id: comprador.id,
        nombre: comprador.nombre,
        contacto: comprador.contacto,
        telefono: comprador.telefono,
        correo: comprador.correo,
        estado: comprador.estado
    };

}

export function listaCompradoresDTO(compradores) {

    /*
    Descripcion:
    Convierte una lista de compradores utilizando
    el DTO del comprador.

    Parametros:
    - compradores: Lista de compradores.

    Retorna:
    Lista de compradores transformados.
    */

    return compradores.map(
        (comprador) => compradorDTO(comprador)
    );

}

/*
//////////////////////////////////////////////////////////
PRUEBAS
//////////////////////////////////////////////////////////

GET /api/v1/compradores

200 OK

*/