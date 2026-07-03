/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.dto.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Compradores
Descripcion:
Archivo de transferencia de datos para compradores.
//////////////////////////////////////////////////////////
*/

export class CompradorDTO {
    constructor({ id, nombre, contacto, telefono, estado }) {
        this.id       = id;
        this.nombre   = nombre;
        this.contacto = contacto;
        this.telefono = telefono;
        this.estado   = estado;
    }
}