/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.dto.js
Autor: Marco Vásquez
Fecha: 28/06/2026
Modulo: Colaboradores
Descripcion:
Archivo de transferencia de datos para colaboradores.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo rol.
*/

export const RolColaborador = Object.freeze({
    ADMIN:        'admin',
    COLABORADOR:  'colaborador',
    SUPERVISOR:   'supervisor',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de colaboradores.
*/

export class ColaboradorDTO {
    constructor({ id, nombre, apellidos, telefono, email, rol }) {
        /*
        Descripcion:
        Construye un objeto ColaboradorDTO con los datos recibidos.

        Parametros:
        - id:        Identificador unico (opcional en creacion)
        - nombre:    Nombre del colaborador (requerido)
        - apellidos: Apellidos del colaborador (requerido)
        - telefono:  Telefono de 8 digitos (opcional)
        - email:     Correo electronico (requerido, validar regex)
        - rol:       Rol del colaborador (requerido, usar RolColaborador)
        */
        this.id        = id;
        this.nombre    = nombre;
        this.apellidos = apellidos;
        this.telefono  = telefono;
        this.email     = email;
        this.rol       = rol;
    }
}