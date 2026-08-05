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
        fechaFin,
        cantidadFinal,
        plFinal,
        estado,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para pre-cria. Se encarga de recibir datos crudos y normalizarlos en una estructura segura.
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
            
        // --- Campos de finalizacion para cuando se edita antes del cierre ---
        this.fecha_fin = fechaFin ? String(fechaFin).trim() : null;
        this.cantidad_final = cantidadFinal !== undefined && cantidadFinal !== null 
            ? Number(cantidadFinal) : null;
        this.pl_final = plFinal !== undefined && plFinal !== null 
            ? Number(plFinal) : null;
            
        this.estado = estado ? String(estado).trim() : EstadoPrecria.ACTIVA;
        
        this.creado_por_usuario_id     = creadoPorUsuarioId ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
    }
}