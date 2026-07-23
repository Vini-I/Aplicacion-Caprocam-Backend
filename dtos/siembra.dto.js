/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.dto.js
Autor: Joan
Fecha: 04/07/2026
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
        lote_larva_id,
        id_lote_larva,
        precria_id,
        id_precria,
        finca_id,
        id_finca,
        estanque_id,
        fecha_siembra,
        tecnica_cultivo,
        densidad_poblacional,
        cantidad_sembrada,
        pl_siembra,
        estado,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para siembra. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura, aplicando transformaciones de tipo, resolviendo llaves foraneas y seteando valores por defecto (ej. estados predeterminados).

        Parametros:
        - Objeto literal destructurado con las propiedades originales a mapear (incluyendo snake_case desde BD o camelCase desde JSON).
        */
const loteIdDb    = lote_larva_id ?? id_lote_larva;
        const precriaIdDb = precria_id ?? id_precria;
        const fincaIdDb   = finca_id ?? id_finca;
 
        this.lote_larva_id = Number(loteIdDb);
        this.precria_id    = precriaIdDb ? Number(precriaIdDb) : null;
        this.finca_id      = Number(fincaIdDb);
        this.estanque_id   = Number(estanque_id);
        this.fecha_siembra = String(fecha_siembra).trim();
        this.tecnica_cultivo = tecnica_cultivo ? String(tecnica_cultivo).trim() : null;
        this.densidad_poblacional = densidad_poblacional !== undefined && densidad_poblacional !== null
            ? Number(densidad_poblacional) : null;
        this.cantidad_sembrada = Number(cantidad_sembrada);
        this.pl_siembra = pl_siembra !== undefined && pl_siembra !== null
            ? Number(pl_siembra) : null;
        this.estado = estado ? String(estado).trim() : EstadoSiembra.ACTIVA;
    }
}