/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.dto.js
Autor: oscar mario
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

export const EstadoPrecria = Object.freeze({
    ACTIVA:     'Activa',
    FINALIZADA: 'Finalizada',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/
 
export class PrecriaDTO {
    constructor({
        lote_larva_id,
        id_lote_larva,
        finca_id,
        id_finca,
        estanque_id,
        fecha_inicio,
        fecha_fin,
        duracion_dias,
        duracion_dias_esperada,
        cantidad_inicial,
        cantidad_final,
        pl_inicial,
        pl_final,
        estado,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para preCria. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura, aplicando transformaciones de tipo, resolviendo llaves foraneas y seteando valores por defecto (ej. estados predeterminados).

        Parametros:
        - Objeto literal destructurado con las propiedades originales a mapear (incluyendo snake_case desde BD o camelCase desde JSON).
        */

/*
        Descripcion:
        DTO de entrada para una Pre-cria.
 
        Parametros:
        - lote_larva_id:    ID del lote de larva (requerido).
        - finca_id:         ID de la finca (requerido).
        - estanque_id:      ID del estanque (requerido).
        - fecha_inicio:     Fecha de inicio (requerido).
        - cantidad_inicial: Cantidad inicial (requerido).
        - pl_inicial:       PL inicial (opcional).
        - estado:           Estado (opcional, default Activa).
        - fecha_fin, cantidad_final, pl_final, duracion_dias:
          Se completan al finalizar la pre-cria.
        - creadoPorUsuarioId:     FK a usuarios - web (resuelto por
          obtenerContextoPeticion, nunca por el body del cliente).
        - creadoPorColaboradorId: FK a colaboradores - movil (idem).
        */
        const loteIdDb  = lote_larva_id ?? id_lote_larva;
        const fincaIdDb = finca_id ?? id_finca;
 
        this.lote_larva_id    = Number(loteIdDb);
        this.finca_id         = Number(fincaIdDb);
        this.estanque_id      = Number(estanque_id);
        this.fecha_inicio     = String(fecha_inicio).trim();
        this.cantidad_inicial = Number(cantidad_inicial);
        this.pl_inicial       = pl_inicial !== undefined && pl_inicial !== null
            ? Number(pl_inicial) : null;
        this.estado = estado ? String(estado).trim() : EstadoPrecria.ACTIVA;
        this.fecha_fin = fecha_fin ? String(fecha_fin).trim() : null;
        this.cantidad_final = cantidad_final !== undefined && cantidad_final !== null
            ? Number(cantidad_final) : null;
        this.pl_final = pl_final !== undefined && pl_final !== null
            ? Number(pl_final) : null;
        this.duracion_dias = duracion_dias !== undefined && duracion_dias !== null
            ? Number(duracion_dias) : null;
        this.duracion_dias_esperada = duracion_dias_esperada !== undefined && duracion_dias_esperada !== null
            ? Number(duracion_dias_esperada) : null;
        this.creado_por_usuario_id     = creadoPorUsuarioId     ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
    }
}