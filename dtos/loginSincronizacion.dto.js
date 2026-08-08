/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginSincronizacion.dto.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 08/08/2026
Modulo: Login
Descripcion:
DTO para sincronizacion movil de colaboradores (sin roles).
//////////////////////////////////////////////////////////
*/

export class LoginSincronizacionDTO {
    constructor(operario) {
        this.id              = operario.id;
        this.uuid            = operario.uuid;
        this.grupoDatos      = operario.grupoDatos;
        this.fincaId         = operario.fincaId;
        this.nombre          = operario.nombre;
        this.apellidos       = operario.apellidos;
        this.email           = operario.email;
        this.correo          = operario.email;
        this.nombreUsuario   = operario.nombreUsuario;
        this.usuario         = operario.nombreUsuario;
        this.pinHash         = operario.pinHash;
        this.tipoColaborador = operario.tipoColaborador;
    }
}