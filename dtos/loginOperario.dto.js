/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     loginOperario.dto.js
Autor:       Rodolfo Chaves
Fecha:       28/06/2026
Modulo:      Login
Descripcion:
DTO para respuestas de verificacion de PIN movil.
Mapea el objeto crudo del model a un objeto seguro,
ocultando pinHash. Incluye pantallasPermitidas para que
la app movil sepa que vistas debe mostrar segun el rol.
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
        this.id     = operario.id;
        this.nombre = operario.nombre;
        this.rol    = {
            id:                  rol.id,
            nombre:              rol.nombre,
            pantallasPermitidas: rol.pantallasPermitidas
        };
    }
}