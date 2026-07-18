/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginAdmin.dto.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
DTO para respuestas de administrador en el login web.
//////////////////////////////////////////////////////////
*/


/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para respuestas de administrador.
Campos ocultos: contrasenaHash, rolId, tipo.
*/

export class LoginAdminDTO {
    /*
        Descripcion:
        Construye un DTO seguro para respuestas de admin.

        Parametros:
        - usuario:    Objeto crudo proveniente de
                      loginUsuarios.model.js
        - nombreRol:  String con el nombre del rol resuelto
                      desde loginRoles.model.js

        Retorna:
        Objeto sin campos sensibles:
        { id, nombre, apellidos, correo, usuario, rol }
        */
    constructor(usuario, rol) {
        this.id = usuario.id;
        this.uuid = usuario.uuid;
        this.grupoDatos = usuario.grupoDatos;
        this.nombre = usuario.nombre;
        this.apellidos = usuario.apellidos;
        this.email = usuario.email;
        this.correo = usuario.email;
        this.nombreUsuario = usuario.nombreUsuario;
        this.usuario = usuario.nombreUsuario;
        this.telefono = usuario.telefono;
        this.rol = rol
            ? {
                id: rol.id,
                nombre: rol.nombre,
                descripcion: rol.descripcion,
                pantallasPermitidas: rol.pantallasPermitidas ?? []
            }
            : null;
    }
}
