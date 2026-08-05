/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: procedencia.dto.js
Autor: oscar mario
Fecha: 01/08/2026
Modulo: Procedencia
Descripcion:
DTO para transferir y normalizar datos del modulo de procedencia.
//////////////////////////////////////////////////////////
*/

export class ProcedenciaDTO {
    constructor({ 
        id, 
        uuid, 
        grupoDatos, 
        nombre, 
        descripcion, 
        creadoPorUsuarioId, 
        creadoPorColaboradorId, 
        activo, 
        fechaCreacion, 
        fechaActualizacion 
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para procedencia. Se encarga de recibir datos crudos y normalizarlos en una estructura segura.
        */
        this.id = id;
        this.uuid = uuid;
        this.grupoDatos = grupoDatos;
        this.nombre = String(nombre ?? "").trim();
        this.descripcion = descripcion ? String(descripcion).trim() : null;
        this.creado_por_usuario_id = creadoPorUsuarioId ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
        this.activo = activo !== undefined ? Boolean(activo) : true;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }
}