/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.dto.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Compradores
Descripcion:
Archivo de transferencia de datos para compradores.
//////////////////////////////////////////////////////////
*/

export class CompradorDTO {
    constructor({ id, grupoDatos, nombre, contacto, estado }) {
        /*
        Descripcion:
        Construye un objeto CompradorDTO con los datos recibidos.

        Parametros:
        - id:         ID unico (opcional)
        - grupoDatos: Grupo de datos del usuario
        - nombre:     Nombre del comprador (requerido)
        - contacto:   Datos de contacto/telefono (opcional)
        - estado:     Estado del comprador (default ACTIVO)
        */
        this.id         = id;
        this.grupoDatos = grupoDatos;
        this.nombre     = nombre;
        this.contacto   = contacto ?? null;
        this.estado     = estado   ?? 'ACTIVO';
    }
}