/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginSincronizacion.dto.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
DTO para el endpoint GET /sincronizar. A diferencia de
loginOperario.dto.js, INCLUYE el pinHash a proposito:
el movil necesita guardarlo en SQLite para verificar el
PIN de forma offline con bcrypt.compare(). El hash es
seguro de transmitir porque bcrypt no es reversible.
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
    constructor(operario, nombreRol) {
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
        this.id      = operario.id;
        this.nombre  = operario.nombre;
        this.pinHash = operario.pinHash;
        this.rol     = nombreRol;
    }
}