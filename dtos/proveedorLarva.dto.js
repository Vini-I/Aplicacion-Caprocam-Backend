/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedorLarva.dto.js
Autor: Joan Campos
Fecha: 4/08/2026
Modulo: Proveedor Larva
Descripcion:
DTO para transferir y normalizar datos del modulo de proveedor de larva.
//////////////////////////////////////////////////////////
*/

export class ProveedorLarvaDTO {
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
        Constructor del Data Transfer Object (DTO) para proveedorLarva. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura.
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