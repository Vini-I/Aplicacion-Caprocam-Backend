/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.dto.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Archivo de transferencia de datos para parasitologias.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo parasito.
*/

export const ParasitoParasitologia = Object.freeze({
    GREGARINA:    'gregarina',
    NEMATODO:     'nematodo',
    EPICOMENSAL:  'epicomensal',
    PROTOZOARIO:  'protozoario',
    OTRO:         'otro',
});

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el grado de infeccion.
*/

export const GradoInfeccion = Object.freeze({
    BAJO:   'bajo',
    MEDIO:  'medio',
    ALTO:   'alto',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de parasitologias.
*/

export class ParasitologiaDTO {
    constructor({
        id,
        tipoRegistro,
        finca,
        fincaNombre,
        estanque,
        fechaReporte,
        responsable,
        parasito,
        parasitoNombre,
        camaronesMuestreados,
        camaronesInfectados,
        porcentajeInfeccion,
        gradoInfeccion,
        gradoInfeccionNombre,
        observaciones,
        activo,
        fechaCreacion,
        fechaActualizacion,
        fechaEliminacion,
    }) {
        /*
        Descripcion:
        Construye un objeto ParasitologiaDTO con los datos recibidos.

        Parametros:
        - id:                    Identificador unico.
        - tipoRegistro:          Tipo de registro del modulo.
        - finca:                 Identificador de la finca.
        - fincaNombre:           Nombre visible de la finca.
        - estanque:              Codigo del estanque.
        - fechaReporte:          Fecha del reporte parasitologico.
        - responsable:           Persona responsable del reporte.
        - parasito:              Tipo de parasito encontrado.
        - parasitoNombre:        Nombre visible del parasito.
        - camaronesMuestreados:  Cantidad de camarones revisados.
        - camaronesInfectados:   Cantidad de camarones infectados.
        - porcentajeInfeccion:   Porcentaje calculado de infeccion.
        - gradoInfeccion:        Nivel de infeccion calculado.
        - gradoInfeccionNombre:  Nombre visible del grado de infeccion.
        - observaciones:         Comentarios adicionales.
        - activo:                Estado logico del registro.
        - fechaCreacion:         Fecha de creacion.
        - fechaActualizacion:    Fecha de ultima actualizacion.
        - fechaEliminacion:      Fecha de eliminacion logica.
        */
        this.id                   = id;
        this.tipoRegistro         = tipoRegistro;
        this.finca                = finca;
        this.fincaNombre          = fincaNombre;
        this.estanque             = estanque;
        this.fechaReporte         = fechaReporte;
        this.responsable          = responsable;
        this.parasito             = parasito;
        this.parasitoNombre       = parasitoNombre;
        this.camaronesMuestreados = camaronesMuestreados;
        this.camaronesInfectados  = camaronesInfectados;
        this.porcentajeInfeccion  = porcentajeInfeccion;
        this.gradoInfeccion       = gradoInfeccion;
        this.gradoInfeccionNombre = gradoInfeccionNombre;
        this.observaciones        = observaciones;
        this.activo               = activo;
        this.fechaCreacion        = fechaCreacion;
        this.fechaActualizacion   = fechaActualizacion;
        this.fechaEliminacion     = fechaEliminacion;
    }
}