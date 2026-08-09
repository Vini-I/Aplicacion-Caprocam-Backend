/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginOperario.dto.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 08/08/2026
Modulo: Login
Descripcion:
DTO para respuestas de verificacion de PIN movil (sin roles).
//////////////////////////////////////////////////////////
*/

export class LoginOperarioDTO {
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
        this.telefono        = operario.telefono;
        this.tipoColaborador = operario.tipoColaborador;
    }
}