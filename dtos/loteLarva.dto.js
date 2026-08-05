/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarva.dto.js
Autor: oscar mario-Joan Campos
Fecha: 4/08/2026
Modulo: lotelarva
Descripcion:
DTOs para transferir y normalizar datos del modulo de loteLarva.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const EstadoLote = Object.freeze({
    DISPONIBLE: 'Disponible',
    EN_PRECRIA: 'En PreCria',
    SEMBRADO:   'Sembrado',
    AGOTADO:    'Agotado',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/
 
export class LoteLarvaDTO {
    constructor({
        codigoLote,
        proveedorId,
        laboratorioId,
        procedenciaId,
        certificadoLarva,
        plInicial,
        cantidadInicial,
        fechaIngreso,
        estadoLote,
        creadoPorUsuarioId,
        creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para loteLarva. Se encarga de recibir datos crudos y normalizarlos en una estructura segura, aplicando transformaciones de tipo y resolviendo llaves foraneas.
        */
 
        this.codigo_lote       = String(codigoLote).trim();
        this.proveedor_id      = proveedorId ? Number(proveedorId) : null;
        this.laboratorio_id    = laboratorioId ? Number(laboratorioId) : null;
        this.procedencia_id    = procedenciaId ? Number(procedenciaId) : null;
        this.certificado_larva = certificadoLarva ? String(certificadoLarva).trim() : null;
        
        this.pl_inicial        = plInicial !== undefined && plInicial !== null
            ? Number(plInicial) : null;
            
        this.cantidad_inicial  = Number(cantidadInicial);
        this.fecha_ingreso     = String(fechaIngreso).trim();
        this.estado_lote       = estadoLote
            ? String(estadoLote).trim()
            : EstadoLote.DISPONIBLE;
            
        this.creado_por_usuario_id     = creadoPorUsuarioId     ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
    }
}