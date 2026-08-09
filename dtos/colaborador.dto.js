/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.dto.js
Autor: Marco Vásquez
Fecha: 08/08/2026
Modulo: Colaboradores
Descripcion:
Archivo de transferencia de datos para colaboradores (sin roles).
//////////////////////////////////////////////////////////
*/

export const TipoColaborador = Object.freeze({
    CAPROCAM_COLLAB: 'caprocam_collab',
    EXTERNAL_OWNER:  'external_owner',
    EXTERNAL_COLLAB: 'external_collab',
});

export class ColaboradorDTO {
    constructor({
        id,
        grupoDatos,
        fincaId,
        nombre,
        apellidos,
        cedula,
        telefono,
        email,
        nombreUsuario,
        pinHash,
        tipoColaborador,
        activo,
    }) {
        this.id              = id;
        this.grupoDatos      = grupoDatos;
        this.fincaId         = fincaId         ?? null;
        this.nombre          = nombre;
        this.apellidos       = apellidos;
        this.cedula          = cedula           ?? null;
        this.telefono        = telefono         ?? null;
        this.email           = email            ?? null;
        this.nombreUsuario   = nombreUsuario;
        this.pinHash         = pinHash          ?? null;
        this.tipoColaborador = tipoColaborador  ?? TipoColaborador.EXTERNAL_COLLAB;
        this.activo          = activo           ?? true;
    }
}