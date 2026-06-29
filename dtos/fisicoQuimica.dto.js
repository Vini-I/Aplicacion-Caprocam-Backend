/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.dto.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Fisico Quimica
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

export const fisicoQuimicaDto = (body) => {

    /*
    Descripcion:
    Recibe el body de la peticion y devuelve
    un objeto con los campos permitidos.

    Parametros:
    - body: Informacion enviada por el cliente.

    Retorna:
    Objeto con los datos de fisico quimica.
    */

    return {
        fincaId: body.fincaId,
        estanqueId: body.estanqueId,
        fecha: body.fecha,
        ph: body.ph,
        salinidad: body.salinidad,
        temperatura: body.temperatura,
        oxigenoDisuelto: body.oxigenoDisuelto
    };
};