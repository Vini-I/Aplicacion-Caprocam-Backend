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
    /**
     * Descripcion:
     * Construye un objeto CompradorDTO mapeando campos del frontend.
     *
     * Parametros:
     * - data: Objeto con los datos recibidos del request.
     *
     * Retorna:
     * - Instancia limpia de CompradorDTO.
     */
    constructor({
        id,
        grupoDatos,
        nombre,
        cedula,
        contacto,
        identificacion,
        telefono,
        email,
        correo,
        direccion,
        notas,
        estado,
    } = {}) {
        this.id         = id;
        this.grupoDatos = grupoDatos;
        this.nombre     = nombre;
        this.contacto   = cedula ?? contacto ?? identificacion ?? null;
        this.telefono   = telefono ?? null;
        this.correo     = email ?? correo ?? null;
        this.direccion  = direccion ?? null;
        this.notas      = notas ?? null;
        this.estado     = estado ?? 'ACTIVO';
    }
}