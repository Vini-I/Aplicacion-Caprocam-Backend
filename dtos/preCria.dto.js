/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.dto.js
Autor:  Oscar Mario
Fecha: 01/08/2026
Modulo: Pre-cria
Descripcion:
DTOs para transferir y normalizar datos del modulo de pre-cria.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const EstadoPrecria = Object.freeze({
    ACTIVA: "ACTIVA",
    FINALIZADA: "FINALIZADA"
});

/*
//////////////////////////////////////////////////////////
DTOs
//////////////////////////////////////////////////////////
*/

export class PrecriaDTO {
    constructor({
        loteLarvaId,
        fincaId,
        estanqueId,
        cantidadInicial,
        plInicial,
        fechaInicio,
        duracionDias,
        estado,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para pre-cria. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura, aplicando transformaciones de tipo, resolviendo llaves foraneas y seteando valores por defecto (ej. estados predeterminados).

        Parametros:
        - Objeto literal destructurado con las propiedades originales a mapear (incluyendo snake_case desde BD o camelCase desde JSON).
        - creadoPorUsuarioId:     FK a usuarios - web (resuelto por
          obtenerContextoPeticion, nunca por el body del cliente).
        - creadoPorColaboradorId: FK a colaboradores - movil (idem).
        */
 
        this.lote_larva_id = Number(loteLarvaId);
        this.finca_id      = Number(fincaId);
        this.estanque_id   = Number(estanqueId);
        
        this.cantidad_inicial = Number(cantidadInicial);
        this.pl_inicial = plInicial !== undefined && plInicial !== null
            ? Number(plInicial) : null;
        this.fecha_inicio = String(fechaInicio).trim();
        
        this.duracion_dias = duracionDias !== undefined && duracionDias !== null
            ? Number(duracionDias) : null;
            
        this.estado = estado ? String(estado).trim() : EstadoPrecria.ACTIVA;
        
        this.creado_por_usuario_id     = creadoPorUsuarioId ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
    }
}