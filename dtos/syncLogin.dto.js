/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncLogin.dto.js
Autor: Greivin Eliecer A.G
Fecha: 08/08/2026
Modulo: Sincronizacion
Descripcion:
DTO para el login de sincronizacion movil de colaboradores.
Define los datos basicos del colaborador que se devuelven
al dispositivo movil tras un inicio de sesion exitoso.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO DE RESPUESTA DE LOGIN
//////////////////////////////////////////////////////////
*/
export class ColaboradorLoginDTO {
    constructor(colaborador) {
        /*
        Descripcion:
        Encapsula los datos basicos del colaborador
        para la respuesta del login de sincronizacion.
        NO incluye pinHash por motivos de seguridad.

        Parametros:
        - colaborador: Objeto crudo del modelo colaborador.

        Retorna:
        { id, uuid, nombre, apellidos, cedula,
          tipoColaborador, rolId, grupoDatos, fincaId }
        */
        this.id              = colaborador.id;
        this.uuid            = colaborador.uuid;
        this.nombre          = colaborador.nombre;
        this.apellidos       = colaborador.apellidos;
        this.cedula          = colaborador.cedula;
        this.tipoColaborador = colaborador.tipoColaborador;
        this.rolId           = colaborador.rolId;
        this.grupoDatos      = colaborador.grupoDatos;
        this.fincaId         = colaborador.fincaId;
    }
}