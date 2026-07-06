/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.dto.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
Archivo de transferencia de datos para el modulo de
equipos. Transforma y normaliza los datos recibidos
antes de enviarlos al modelo o devolverlos al cliente.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para tipo y estado del
equipo. Estos valores coinciden con los catalogos
del frontend (registrarEquipoService.js).
*/

export const TipoEquipo = Object.freeze({
    AIREACION:     "aireacion",
    BOMBEO:        "bombeo",
    ALIMENTACION:  "alimentacion",
    MONITOREO:     "monitoreo",
    MANTENIMIENTO: "mantenimiento",
    OTRO:          "otro"
});

export const EstadoEquipo = Object.freeze({
    ACTIVO:        "activo",
    MANTENIMIENTO: "mantenimiento",
    INACTIVO:      "inactivo"
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de equipos.
Normaliza los campos recibidos desde el body antes de
que sean procesados por el controller y el model.
*/

export class EquipoDTO {
    constructor({
        id,
        codigoInterno,
        descripcion,
        fechaInstalacion,
        tipo,
        estado,
        funcionEquipo
    }) {
        /*
        Descripcion:
        Construye un objeto EquipoDTO con los datos
        recibidos desde el body del request.

        Parametros:
        - id:               ID numerico del equipo (opcional en create).
        - codigoInterno:    Identificador interno del equipo. Ej: EQ-001.
        - descripcion:      Descripcion breve del equipo.
        - fechaInstalacion: Fecha de instalacion en formato dd/mm/aaaa.
        - tipo:             Tipo de equipo segun TipoEquipo.
        - estado:           Estado actual segun EstadoEquipo.
        - funcionEquipo:    Descripcion de la funcion del equipo.

        Retorna:
        - Objeto EquipoDTO con campos normalizados.
        */
        this.id              = id;
        this.codigoInterno   = normalizarTexto(codigoInterno);
        this.descripcion     = normalizarTexto(descripcion);
        this.fechaInstalacion = normalizarTexto(fechaInstalacion);
        this.tipo            = normalizarTexto(tipo);
        this.estado          = normalizarTexto(estado);
        this.funcionEquipo   = normalizarTexto(funcionEquipo);
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas de normalizacion.
La funcion createEquipo() del controller depende
de estas funciones para trabajar.
*/

function normalizarTexto(valor) {
    /*
    Descripcion:
    Convierte un valor obligatorio a texto y elimina
    espacios al inicio y al final.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Texto normalizado.
    */
    if (valor === undefined || valor === null) {
        return null;
    }

    return String(valor).trim();
}