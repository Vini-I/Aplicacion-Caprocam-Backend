/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: laboratorio.dto.js
Autor: oscar mario
Fecha: 01/08/2026
Modulo: Laboratorio
Descripcion:
DTO para transferir y normalizar datos del modulo de laboratorio.
//////////////////////////////////////////////////////////
*/

export class LaboratorioDTO {
    constructor({ id, uuid, grupo_datos, nombre, descripcion,creadoPorUsuarioId,creadoPorColaboradorId, activo, fecha_creacion, fecha_actualizacion }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para laboratorio. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura, aplicando transformaciones de tipo, resolviendo llaves foraneas y seteando valores por defecto (ej. estados predeterminados).

        Parametros:
        - Objeto literal destructurado con las propiedades originales a mapear (incluyendo snake_case desde BD o camelCase desde JSON).
        */
        this.id = id;
        this.uuid = uuid;
        this.grupoDatos = grupo_datos;
        this.nombre = String(nombre ?? "").trim();
        this.descripcion = descripcion ? String(descripcion).trim() : null;
        this.creado_por_usuario_id = creadoPorUsuarioId ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
        this.activo = Boolean(activo);
        this.fechaCreacion = fecha_creacion;
        this.fechaActualizacion = fecha_actualizacion;
    }
}