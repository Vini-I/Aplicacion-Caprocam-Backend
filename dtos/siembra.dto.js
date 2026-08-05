/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.dto.js
Autor:  Oscar Mario-Joan Campos
Fecha: 4/08/2026
Modulo: Siembra
Descripcion:
DTOs para transferir y normalizar datos del modulo de siembra.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const EstadoSiembra = Object.freeze({
    ACTIVA: "ACTIVA",
    FINALIZADA: "FINALIZADA"
});

/*
//////////////////////////////////////////////////////////
DTOs
//////////////////////////////////////////////////////////
*/

export class SiembraDTO {
    constructor({
        loteLarvaId,
        precriaId,
        fincaId,
        estanqueId,
        fechaSiembra,
        tecnicaCultivo,
        densidadPoblacional,
        cantidadSembrada,
        plSiembra,
        duracionCiclo,
        estado,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para siembra. Se encarga de recibir datos crudos y normalizarlos.
        */
 
        this.lote_larva_id = Number(loteLarvaId);
        this.precria_id    = precriaId ? Number(precriaId) : null;
        this.finca_id      = Number(fincaId);
        this.estanque_id   = Number(estanqueId);
        this.fecha_siembra = String(fechaSiembra).trim();
        this.tecnica_cultivo = tecnicaCultivo ? String(tecnicaCultivo).trim() : null;
        this.densidad_poblacional = densidadPoblacional !== undefined && densidadPoblacional !== null
            ? Number(densidadPoblacional) : null;
        this.cantidad_sembrada = Number(cantidadSembrada);
        this.pl_siembra = plSiembra !== undefined && plSiembra !== null
            ? Number(plSiembra) : null;
        this.duracion_ciclo = duracionCiclo !== undefined && duracionCiclo !== null
            ? Number(duracionCiclo) : null;
            
        this.estado = estado ? String(estado).trim() : EstadoSiembra.ACTIVA;
        this.creado_por_usuario_id     = creadoPorUsuarioId ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
    }
}