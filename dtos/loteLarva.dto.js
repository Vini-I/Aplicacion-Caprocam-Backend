/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarva.dto.js
Autor: Joan
Fecha: 04/07/2026
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
        codigo_lote,
        proveedor_id,
        proveedorId,
        laboratorio,
        lugar_procedencia,
        procedencia,
        certificado_larva,
        pl_inicial,
        cantidad_inicial,
        fecha_ingreso,
        estado_lote,
    }) {
        /*
        Descripcion:
        Constructor del Data Transfer Object (DTO) para loteLarva. Se encarga de recibir datos crudos (ya sea del request del cliente o de una fila cruda de base de datos) y normalizarlos en una estructura segura, aplicando transformaciones de tipo, resolviendo llaves foraneas y seteando valores por defecto (ej. estados predeterminados).

        Parametros:
        - Objeto literal destructurado con las propiedades originales a mapear (incluyendo snake_case desde BD o camelCase desde JSON).
        */

/*
        Descripcion:
        DTO de entrada para un Lote de Larva.
 
        Parametros:
        - codigo_lote:       Codigo de identificacion (requerido).
        - proveedor_id:      ID del proveedor (opcional, FK nullable).
        - laboratorio:       Laboratorio de origen (opcional).
        - lugar_procedencia: Procedencia de la larva (opcional).
        - certificado_larva: Certificado sanitario (opcional).
        - pl_inicial:        PL inicial (opcional).
        - cantidad_inicial:  Cantidad inicial (requerido).
        - fecha_ingreso:     Fecha de ingreso (requerido).
        - estado_lote:       Estado del lote (opcional, default Disponible).
        */
        const proveedorDb   = proveedor_id ?? proveedorId;
        const procedenciaDb = lugar_procedencia ?? procedencia;
 
        this.codigo_lote       = String(codigo_lote).trim();
        this.proveedor_id      = proveedorDb ? Number(proveedorDb) : null;
        this.laboratorio       = laboratorio ? String(laboratorio).trim() : null;
        this.lugar_procedencia = procedenciaDb ? String(procedenciaDb).trim() : null;
        this.certificado_larva = certificado_larva ? String(certificado_larva).trim() : null;
        this.pl_inicial        = pl_inicial !== undefined && pl_inicial !== null
            ? Number(pl_inicial) : null;
        this.cantidad_inicial  = Number(cantidad_inicial);
        this.fecha_ingreso     = String(fecha_ingreso).trim();
        this.estado_lote       = estado_lote
            ? String(estado_lote).trim()
            : EstadoLote.DISPONIBLE;
    }
}