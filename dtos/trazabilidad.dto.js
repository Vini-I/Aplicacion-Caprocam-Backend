/*
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
Archivo: trazabilidad.dto.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Trazabilidad
Descripcion:
DTO encargado de recibir la informacion enviada
desde el cliente y devolver solamente los campos
que necesita el modelo.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES DTO
//////////////////////////////////////////////////////////

Descripcion de seccion

Funciones encargadas de transformar la
informacion recibida desde el cliente.

*/

export const trazabilidadDto = (body) => {
    /*
    Descripcion:
    Recibe el body de la peticion y devuelve
    un objeto con los campos permitidos.

    Parametros:
    - body: Informacion enviada por el cliente.

    Retorna:
    Objeto con los datos de trazabilidad.
    */

    return {
        fincaId: body.fincaId,
        estanqueOrigenId: body.estanqueOrigenId,
        estanqueDestinoId: body.estanqueDestinoId,
        fecha: body.fecha,
        colaboradorId: body.colaboradorId,
        tamano: body.tamano,
        dias: body.dias,
        pl: body.pl
    };
};