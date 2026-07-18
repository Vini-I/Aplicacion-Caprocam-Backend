/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginOperario.dto.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
DTO para respuestas de verificacion de PIN movil.
//////////////////////////////////////////////////////////
*/
/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para respuestas de operario.
Campos ocultos: pinHash, rolId, tipo, contrasenaHash.
*/
export class LoginOperarioDTO {
    constructor(operario, rol) {
        /*
        Descripcion:
        Construye un DTO seguro para respuestas de
        verificacion de PIN movil.

        Parametros:
        - operario: Objeto crudo proveniente de
                    loginUsuarios.model.js
        - rol:      Objeto rol completo de
                    loginRoles.model.js, incluyendo
                    pantallasPermitidas

        Retorna:
        Objeto sin campos sensibles:
        { id, nombre, rol: { id, nombre,
          pantallasPermitidas } }
        */
        this.id = operario.id;
        this.uuid = operario.uuid;
        this.grupoDatos = operario.grupoDatos;
        this.fincaId = operario.fincaId;
        this.nombre = operario.nombre;
        this.apellidos = operario.apellidos;
        this.email = operario.email;
        this.correo = operario.email;
        this.nombreUsuario = operario.nombreUsuario;
        this.usuario = operario.nombreUsuario;
        this.telefono = operario.telefono;
        this.tipoColaborador = operario.tipoColaborador;
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
