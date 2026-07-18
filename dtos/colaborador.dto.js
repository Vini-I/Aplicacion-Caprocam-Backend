/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.dto.js
Autor: Marco Vásquez
Fecha: 06/07/2026
Modulo: Colaboradores
Descripcion:
Archivo de transferencia de datos para colaboradores.
Adaptado a la estructura de la tabla colaboradores en DB.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo tipo_colaborador.
*/

export const TipoColaborador = Object.freeze({
    CAPROCAM_COLLAB: 'caprocam_collab',
    EXTERNAL_OWNER:  'external_owner',
    EXTERNAL_COLLAB: 'external_collab',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class ColaboradorDTO {
    constructor({
        id,
        grupoDatos,
        fincaId,
        rolId,
        nombre,
        apellidos,
        telefono,
        email,
        nombreUsuario,
        pinHash,
        tipoColaborador,
        activo,
    }) {
        /*
        Descripcion:
        Construye un objeto ColaboradorDTO con los datos recibidos.

        Parametros:
        - id:              Identificador unico (opcional en creacion)
        - grupoDatos:      Grupo de datos al que pertenece (requerido)
        - fincaId:         FK a fincas (opcional)
        - rolId:           FK a roles (requerido)
        - nombre:          Nombre del colaborador (requerido)
        - apellidos:       Apellidos del colaborador (requerido)
        - telefono:        Telefono (opcional)
        - email:           Correo electronico (opcional)
        - nombreUsuario:   Nombre de usuario unico por grupo (requerido)
        - pinHash:         PIN hasheado para login movil (requerido)
        - tipoColaborador: Tipo de colaborador (usar TipoColaborador)
        - activo:          Estado activo (default true)
        */
        this.id              = id;
        this.grupoDatos      = grupoDatos;
        this.fincaId         = fincaId       ?? null;
        this.rolId           = rolId;
        this.nombre          = nombre;
        this.apellidos       = apellidos;
        this.telefono        = telefono      ?? null;
        this.email           = email         ?? null;
        this.nombreUsuario   = nombreUsuario;
        this.pinHash         = pinHash;
        this.tipoColaborador = tipoColaborador ?? TipoColaborador.EXTERNAL_COLLAB;
        this.activo          = activo         ?? true;
    }
}