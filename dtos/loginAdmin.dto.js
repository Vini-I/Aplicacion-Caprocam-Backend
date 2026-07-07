/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginAdmin.dto.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
DTO para respuestas de administrador en el login web.
Mapea el objeto crudo del model a un objeto seguro,
ocultando contrasenaHash.
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
    constructor(usuario, nombreRol) {
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
        this.id        = usuario.id;
        this.nombre    = usuario.nombre;
        this.apellidos = usuario.apellidos;
        this.correo    = usuario.correo;
        this.usuario   = usuario.usuario;
        this.rol       = nombreRol;
    }
}