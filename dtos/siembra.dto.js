/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.dto.js
Autor:  Oscar Mario
Fecha: 01/08/2026
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
        lote_larva_id, loteLarvaId, id_lote_larva,
        precria_id, precriaId, id_precria,
        finca_id, fincaId, id_finca,
        estanque_id, estanqueId,
        fecha_siembra, fechaSiembra,
        tecnica_cultivo, tecnicaCultivo,
        densidad_poblacional, densidadPoblacional,
        cantidad_sembrada, cantidadSembrada,
        pl_siembra, plSiembra,
        duracion_ciclo, duracionCiclo,
        estado,
        creado_por_usuario_id, creadoPorUsuarioId,
        creado_por_colaborador_id, creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para siembra. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura, aplicando transformaciones de tipo, resolviendo llaves foraneas y seteando valores por defecto (ej. estados predeterminados).

        Parametros:
        - Objeto literal destructurado con las propiedades originales a mapear (incluyendo snake_case desde BD o camelCase desde JSON).
        - creadoPorUsuarioId:     FK a usuarios - web (resuelto por
          obtenerContextoPeticion, nunca por el body del cliente).
        - creadoPorColaboradorId: FK a colaboradores - movil (idem).
        */
        const loteIdDb    = lote_larva_id ?? loteLarvaId ?? id_lote_larva;
        const precriaIdDb = precria_id ?? precriaId ?? id_precria;
        const fincaIdDb   = finca_id ?? fincaId ?? id_finca;
        const estanqueIdDb = estanque_id ?? estanqueId;
 
        this.lote_larva_id = Number(loteIdDb);
        this.precria_id    = precriaIdDb ? Number(precriaIdDb) : null;
        this.finca_id      = Number(fincaIdDb);
        this.estanque_id   = Number(estanqueIdDb);
        
        const fec = fecha_siembra ?? fechaSiembra;
        this.fecha_siembra = String(fec).trim();
        
        const tec = tecnica_cultivo ?? tecnicaCultivo;
        this.tecnica_cultivo = tec ? String(tec).trim() : null;
        
        const dens = densidad_poblacional ?? densidadPoblacional;
        this.densidad_poblacional = dens !== undefined && dens !== null
            ? Number(dens) : null;
            
        const cant = cantidad_sembrada ?? cantidadSembrada;
        this.cantidad_sembrada = Number(cant);
        
        const pl = pl_siembra ?? plSiembra;
        this.pl_siembra = pl !== undefined && pl !== null
            ? Number(pl) : null;
            
        const ciclo = duracion_ciclo ?? duracionCiclo;
        this.duracion_ciclo = ciclo !== undefined && ciclo !== null
            ? Number(ciclo) : null;
            
        this.estado = estado ? String(estado).trim() : EstadoSiembra.ACTIVA;
        this.creado_por_usuario_id     = creado_por_usuario_id ?? creadoPorUsuarioId ?? null;
        this.creado_por_colaborador_id = creado_por_colaborador_id ?? creadoPorColaboradorId ?? null;
    }
}