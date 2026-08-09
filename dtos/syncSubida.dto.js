/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncSubida.dto.js
Autor: Greivin Eliecer A.G
Fecha: 08/08/2026
Modulo: Sincronizacion
Descripcion:
DTO para la confirmacion de subida de cambios offline.
Define la respuesta del servidor con los nuevos IDs 
generados tras impactar los cambios en la base de datos central.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO DE CONFIRMACION DE SUBIDA
//////////////////////////////////////////////////////////
*/
export class SubidaCambiosDTO {
    constructor({ resultado, colaboradorId, grupoDatos }) {
        /*
        Descripcion:
        Encapsula el resumen de cambios aplicados en la DB.

        Parametros:
        - resultado:     Objeto con conteos y IDs nuevos por modulo.
        - colaboradorId: ID del colaborador que subio los cambios.
        - grupoDatos:    Grupo de datos del colaborador.

        Retorna:
        Objeto con resultado detallado y metadatos de la subida.
        */
        this.resultado = resultado;
        this._meta = {
            grupoDatos,
            colaboradorId,
            fechaSubida: new Date().toISOString(),
        };
    }
}