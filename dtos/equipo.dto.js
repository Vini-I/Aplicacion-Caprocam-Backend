/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.dto.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
DTO y constantes de dominio para el modulo de equipos.
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


export const TipoEquipo = {
    AIREACION: "Aireación",
    BOMBEO: "Bombeo",
    ALIMENTACION: "Alimentación",
    MONITOREO: "Monitoreo"
};

export const EstadoEquipo = {
    ACTIVO: "Activo",
    MANTENIMIENTO: "Mantenimiento",
    INACTIVO: "Inactivo"
};

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
 
Caparazon de datos para el modulo de equipos.
Normaliza los campos recibidos desde el body antes de
que sean procesados por el controller y el model.
 
Mapeo frontend → columna MySQL:
  grupoDatos      → grupo_datos
  nombre          → nombre o identificador
  descripcion     → descripcion
  fechaInstalacion → fecha_instalacion (DATE)
  tipo            → tipo
  estado          → estado
  funcionEquipo   → funcion
*/

export class EquipoDTO {
            /*
        Descripcion:
        Construye un objeto EquipoDTO con los datos
        recibidos desde el body del request.
 
        Parametros:
        - nombre:           Nombre del equipo. Ej: Aireador principal.
        - descripcion:      Descripcion breve del equipo.
        - fechaInstalacion: Fecha de instalacion en formato dd/mm/aaaa.
        - tipo:             Tipo de equipo segun TipoEquipo.
        - estado:           Estado actual segun EstadoEquipo.
        - funcionEquipo:    Descripcion de la funcion del equipo.
        - grupoDatos:       Grupo de datos al que pertenece el equipo.
 
        Retorna:
        - Objeto EquipoDTO con campos normalizados.
        */

    constructor(equipo = {}) {
        this.grupoDatos = normalizarGrupoDatos(equipo.grupoDatos);
        this.identificador = normalizarTexto(equipo.identificador ?? equipo.nombre);
        this.descripcion = normalizarTexto(equipo.descripcion);
        this.fechaInstalacion = normalizarTexto(equipo.fechaInstalacion);
        this.tipo = normalizarTexto(equipo.tipo);
        this.estado = normalizarTexto(equipo.estado);
        this.funcionEquipo = normalizarTexto(equipo.funcionEquipo);
    }
}
 
/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
 
Funciones internas de normalizacion.
La clase EquipoDTO depende de estas funciones para trabajar.
*/

function normalizarTexto(valor) {
        /*
    Descripcion:
    Convierte un valor a texto y elimina espacios al inicio
    y al final. Retorna null si el valor no existe.
 
    Parametros:
    - valor: Valor recibido.
 
    Retorna:
    - Texto normalizado o null.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();

    return texto.length === 0 ? null : texto;
}

function normalizarGrupoDatos(valor) {
    if (valor === undefined || valor === null || String(valor).trim() === "") {
        return 1;
    }

    return Number(valor);
}
