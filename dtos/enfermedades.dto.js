/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.dto.js
Autor: Isaac Chaves
Fecha: 30/07/2026
Modulo: Enfermedades
Descripcion:
Archivo de transferencia de datos para enfermedades.
Incluye auditoria dual para usuario web y colaborador movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Define los valores permitidos para el campo enfermedad.
Los valores deben coincidir con el ENUM de MySQL.
*/

export const TipoEnfermedad = Object.freeze({
    WSSV: 'WSSV - Mancha Blanca',
    AHPND: 'AHPND - Necrosis hepatopancreatica aguda',
    VIBRIOSIS: 'Vibriosis',
    IHHNV: 'IHHNV',
    NHP: 'NHP - Hepatobacter penaei',
    OTRO: 'otro',
});

/*
Descripcion:
Define los valores permitidos para el campo severidad.
Los valores deben coincidir con el ENUM de MySQL.
*/

export const SeveridadEnfermedad = Object.freeze({
    BAJO: 'bajo',
    MEDIO: 'medio',
    ALTO: 'alto',
    CRITICA: 'critica',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Normaliza la estructura de un registro de enfermedad.

Instancia con la estructura del modulo.

Parametros:
- La auditoria utiliza creadoPorUsuarioId y
- creadoPorColaboradorId.
- No utiliza colaboradorId.

Retorna:
- grupoDatos: Grupo resuelto desde el JWT.
- fincaId: Identificador de la finca.
- estanqueId: Identificador del estanque.
- creadoPorUsuarioId: Usuario web creador o null.
- creadoPorColaboradorId: Colaborador movil creador o null.
*/

export class EnfermedadDTO {
    constructor({
        id,
        uuid,
        grupoDatos,
        fincaId,
        estanqueId,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
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
        this.id = id;
        this.uuid = uuid;
        this.grupoDatos = grupoDatos;
        this.fincaId = fincaId;
        this.estanqueId = estanqueId;
        this.creadoPorUsuarioId = creadoPorUsuarioId ?? null;
        this.creadoPorColaboradorId =
            creadoPorColaboradorId ?? null;
        this.tipoRegistro = tipoRegistro ?? 'enfermedad';
        this.fechaReporte = fechaReporte;
        this.responsable = responsable ?? null;
        this.enfermedad = enfermedad;
        this.enfermedadNombre = enfermedadNombre;
        this.severidad = severidad;
        this.severidadNombre = severidadNombre;
        this.mortalidadRegistrada =
            mortalidadRegistrada ?? null;
        this.reporte = reporte ?? null;
        this.activo = activo;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.deletedAt = deletedAt;
        this.version = version;
    }
}
