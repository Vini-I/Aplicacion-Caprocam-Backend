/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.dto.js
Autor: Joan
Fecha: 19/07/2026
Modulo: Proveedor Larva
Descripcion:
DTO para transferir y normalizar datos del modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

export class ProveedorLarvaDTO {
    constructor({ id, uuid, grupo_datos, nombre, descripcion, activo, fecha_creacion, fecha_actualizacion }) {
        this.id = id;
        this.uuid = uuid;
        this.grupoDatos = grupo_datos;
        this.nombre = String(nombre ?? "").trim();
        this.descripcion = descripcion ? String(descripcion).trim() : null;
        this.activo = Boolean(activo);
        this.fechaCreacion = fecha_creacion;
        this.fechaActualizacion = fecha_actualizacion;
    }
}