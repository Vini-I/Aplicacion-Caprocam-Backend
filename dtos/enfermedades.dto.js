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
Adapta los datos del modulo a la estructura usada por
la base de datos MySQL.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo enfermedad.
Estos valores coinciden con el ENUM de la tabla enfermedades.
*/

export const TipoEnfermedad = Object.freeze({
    WSSV:       'WSSV - Mancha Blanca',
    AHPND:      'AHPND - Necrosis hepatopancreatica aguda',
    VIBRIOSIS:  'Vibriosis',
    IHHNV:      'IHHNV',
    NHP:        'NHP - Hepatobacter penaei',
    OTRO:       'otro',
});

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo severidad.
Estos valores coinciden con el ENUM de la tabla enfermedades.
*/

export const SeveridadEnfermedad = Object.freeze({
    BAJO:     'bajo',
    MEDIO:    'medio',
    ALTO:     'alto',
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
        uuid,
        grupoDatos,
        fincaId,
        estanqueId,
        colaboradorId,
        tipoRegistro,
        fechaReporte,
        responsable,
        enfermedad,
        enfermedadNombre,
        severidad,
        severidadNombre,
        mortalidadRegistrada,
        reporte,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version,
    }) {
        /*
        Descripcion:
        Construye un objeto EnfermedadDTO con los datos recibidos.

        Parametros:
        - id:                    Identificador interno de MySQL.
        - uuid:                  Identificador global para sincronizacion.
        - grupoDatos:            Grupo de datos del registro.
        - fincaId:               Identificador de la finca.
        - estanqueId:            Identificador del estanque.
        - colaboradorId:         Identificador del colaborador.
        - tipoRegistro:          Tipo de registro del modulo.
        - fechaReporte:          Fecha del reporte sanitario.
        - responsable:           Persona responsable del reporte.
        - enfermedad:            Enfermedad registrada.
        - enfermedadNombre:      Nombre visible de la enfermedad.
        - severidad:             Valor interno de la severidad.
        - severidadNombre:       Nombre visible de la severidad.
        - mortalidadRegistrada:  Cantidad de mortalidad registrada.
        - reporte:               Detalle o descripcion del caso.
        - activo:                Estado logico del registro.
        - fechaCreacion:         Fecha de creacion.
        - fechaActualizacion:    Fecha de ultima actualizacion.
        - deletedAt:             Fecha de eliminacion logica.
        - version:               Version del registro para sincronizacion.
        */

        this.id                    = id;
        this.uuid                  = uuid;
        this.grupoDatos            = grupoDatos;
        this.fincaId               = fincaId;
        this.estanqueId            = estanqueId;
        this.colaboradorId         = colaboradorId;
        this.tipoRegistro          = tipoRegistro;
        this.fechaReporte          = fechaReporte;
        this.responsable           = responsable;
        this.enfermedad            = enfermedad;
        this.enfermedadNombre      = enfermedadNombre;
        this.severidad             = severidad;
        this.severidadNombre       = severidadNombre;
        this.mortalidadRegistrada  = mortalidadRegistrada;
        this.reporte               = reporte;
        this.activo                = activo;
        this.fechaCreacion         = fechaCreacion;
        this.fechaActualizacion    = fechaActualizacion;
        this.deletedAt             = deletedAt;
        this.version               = version;
    }
}
