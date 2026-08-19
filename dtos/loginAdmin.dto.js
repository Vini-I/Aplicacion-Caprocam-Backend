/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginAdmin.dto.js
Autor: Rodolfo Chaves / Marco Vásquez
Fecha: 08/08/2026
Modulo: Login
Descripcion:
DTO para respuestas de administrador en el login web (sin roles).
//////////////////////////////////////////////////////////
*/

export class LoginAdminDTO {
    constructor(usuario) {
        this.id            = usuario.id;
        this.uuid          = usuario.uuid;
        this.grupoDatos    = usuario.grupoDatos;
        this.nombre        = usuario.nombre;
        this.apellidos     = usuario.apellidos;
        this.email         = usuario.email;
        this.correo        = usuario.email;
        this.nombreUsuario = usuario.nombreUsuario;
        this.usuario       = usuario.nombreUsuario;
        this.telefono      = usuario.telefono;
    }
}