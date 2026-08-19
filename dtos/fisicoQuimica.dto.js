/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.dto.js
Autor: Samuel Cerdas
Fecha: 27/07/2026
Modulo: Fisico Quimica
Descripcion:
Archivo de transferencia de datos para el
modulo de fisico quimica.
Contiene el caparazon de datos requerido
por el backend.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de
fisico quimica.
*/

export class FisicoQuimicaDTO {

    constructor({
        id,
        grupoDatos,
        fincaId,
        estanqueId,
        fecha,
        ph,
        salinidad,
        temperatura,
        oxigenoDisuelto,
        creadoPorUsuarioId,
        creadoPorColaboradorId
    }) {
        /*
        Descripcion:
        Construye un objeto FisicoQuimicaDTO
        con la informacion recibida.

        Parametros:
        - id: Identificador de la lectura.
        - grupoDatos: Grupo de datos.
        - fincaId: Identificador de la finca.
        - estanqueId: Identificador del estanque.
        - fecha: Fecha de la lectura.
        - ph: Arreglo de mediciones de pH.
        - salinidad: Arreglo de mediciones de salinidad.
        - temperatura: Arreglo de mediciones de temperatura.
        - oxigenoDisuelto: Arreglo de mediciones de oxigeno.
        - creadoPorUsuarioId: Usuario web que registro la
        lectura, resuelto por obtenerContextoPeticion.
        - creadoPorColaboradorId: Colaborador movil que
        registro la lectura, resuelto por el contexto.

        Retorna:
        - Instancia de FisicoQuimicaDTO.
        */

        this.id = id;
        this.grupoDatos = grupoDatos;
        this.fincaId = fincaId;
        this.estanqueId = estanqueId;
        this.fecha = fecha;
        this.ph = ph;
        this.salinidad = salinidad;
        this.temperatura = temperatura;
        this.oxigenoDisuelto = oxigenoDisuelto;
        this.creadoPorUsuarioId = creadoPorUsuarioId ?? null;
        this.creadoPorColaboradorId = creadoPorColaboradorId ?? null;
    }
}