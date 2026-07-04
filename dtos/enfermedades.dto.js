/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.dto.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Archivo de transferencia de datos para enfermedades.
Es un caparazon para almacenar los datos requeridos
del modulo antes de enviarlos al modelo.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo enfermedades.
*/

export const TipoEnfermedad = Object.freeze({
    WSSV:       'wssv',
    AHPND:      'ahpnd',
    VIBRIOSIS:  'vibriosis',
    IHHNV:      'ihhnv',
    NHP:        'nhp',
    OTRO:       'otro',
});

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo severidad.
*/

export const SeveridadEnfermedad = Object.freeze({
    BAJA:     'baja',
    MEDIA:    'media',
    ALTA:     'alta',
    CRITICA:  'critica',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de enfermedades.
*/

export class EnfermedadDTO {
    constructor({
        id,
        tipoRegistro,
        finca,
        fincaNombre,
        estanque,
        fechaReporte,
        responsable,
        enfermedades,
        enfermedadesNombre,
        severidad,
        severidadNombre,
        mortalidad,
        reporte,
        activo,
        fechaCreacion,
        fechaActualizacion,
        fechaEliminacion,
    }) {
        /*
        Descripcion:
        Construye un objeto EnfermedadDTO con los datos recibidos.

        Parametros:
        - id:                  Identificador unico del registro.
        - tipoRegistro:        Tipo de registro del modulo.
        - finca:               Identificador de la finca.
        - fincaNombre:         Nombre visible de la finca.
        - estanque:            Codigo del estanque.
        - fechaReporte:        Fecha del reporte sanitario.
        - responsable:         Persona responsable del reporte.
        - enfermedades:        Lista de enfermedades seleccionadas.
        - enfermedadesNombre:  Lista de nombres visibles de enfermedades.
        - severidad:           Valor interno de la severidad.
        - severidadNombre:     Nombre visible de la severidad.
        - mortalidad:          Cantidad de mortalidad registrada.
        - reporte:             Detalle o descripcion del caso.
        - activo:              Estado logico del registro.
        - fechaCreacion:       Fecha de creacion.
        - fechaActualizacion:  Fecha de ultima actualizacion.
        - fechaEliminacion:    Fecha de eliminacion logica.
        */

        this.id                  = id;
        this.tipoRegistro        = tipoRegistro;
        this.finca               = finca;
        this.fincaNombre         = fincaNombre;
        this.estanque            = estanque;
        this.fechaReporte        = fechaReporte;
        this.responsable         = responsable;
        this.enfermedades        = enfermedades;
        this.enfermedadesNombre  = enfermedadesNombre;
        this.severidad           = severidad;
        this.severidadNombre     = severidadNombre;
        this.mortalidad          = mortalidad;
        this.reporte             = reporte;
        this.activo              = activo;
        this.fechaCreacion       = fechaCreacion;
        this.fechaActualizacion  = fechaActualizacion;
        this.fechaEliminacion    = fechaEliminacion;
    }
}