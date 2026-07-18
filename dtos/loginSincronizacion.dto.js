/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginSincronizacion.dto.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
DTO para sincronizacion movil de colaboradores.
//////////////////////////////////////////////////////////
*/
/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para sincronizacion movil.
Incluye pinHash intencionalmente para uso offline.
*/
export class LoginSincronizacionDTO {
    constructor(operario, rol) {
         /*
        Descripcion:
        Construye un DTO para que la app movil guarde
        en su SQLite local los datos de cada operario.

        Parametros:
        - operario:  Objeto crudo proveniente de
                     loginUsuarios.model.js
        - nombreRol: String con el nombre del rol resuelto
                     desde loginRoles.model.js

        Retorna:
        { id, nombre, pinHash, rol }
        El pinHash se incluye intencionalmente para
        verificacion offline.
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
        this.pinHash = operario.pinHash;
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
