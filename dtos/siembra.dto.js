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

export const EstadoPrecria = Object.freeze({
    ACTIVA: "ACTIVA",
    FINALIZADA: "FINALIZADA"
});

/*
//////////////////////////////////////////////////////////
DTOs
//////////////////////////////////////////////////////////
*/

export class LoteLarvaDTO {
    constructor({
        codigo_lote,
        grupo_datos,
        proveedor_id,
        laboratorio,
        procedencia,
        certificado_larva,
        pl_inicial,
        cantidad_inicial,
        fecha_ingreso,
        estado_lote,
        activo,
        fecha_creacion,
        fecha_actualizacion
    }) {
        /*
        Descripcion:
        DTO para un Lote de Larva.

        Parametros:
        - id: ID del lote (opcional).
        - codigo_lote: Codigo de identificacion.
        - proveedor: Nombre o ID del proveedor.
        - laboratorio: Laboratorio de origen.
        - procedencia: Procedencia de la larva.
        - certificado_larva: Certificado sanitario.
        - pl_inicial: PL inicial (numero entero positivo).
        - cantidad_inicial: Cantidad inicial (numero entero positivo).
        - fecha_ingreso: Fecha de ingreso de la larva.
        */
        this.codigo_lote = String(codigo_lote).trim();
        this.grupo_datos = grupo_datos ? String(grupo_datos).trim() : null;
        this.proveedor_id = Number(proveedor_id);
        this.laboratorio = String(laboratorio).trim();
        this.procedencia = String(procedencia).trim();
        this.certificado_larva = String(certificado_larva).trim();
        this.pl_inicial = Number(pl_inicial);
        this.cantidad_inicial = Number(cantidad_inicial);
        this.fecha_ingreso = String(fecha_ingreso).trim();
        this.estado_lote = String(estado_lote).trim();
        this.activo = Boolean(activo);
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }
}

export class PrecriaDTO {
    constructor({
        uuid,
        grupo_datos,
        id_lote_larva,
        id_finca,
        estanque_id,
        unidad_precria,
        fecha_inicio,
        duracion_dias,
        cantidad_inicial,
        pl_inicial,
        estado,
        fecha_fin,
        cantidad_final,
        pl_final,
        estado,
        activo,
        fecha_creacion,
        fecha_actualizacion
    }) {
        /*
        Descripcion:
        DTO para una Pre-cria.

        Parametros:
        - id: ID de la pre-cria.
        - id_lote_larva: ID del lote de larva.
        - id_finca: ID de la finca.
        - unidad_precria: Nombre de la unidad.
        - fecha_inicio: Fecha de inicio.
        - cantidad_inicial: Cantidad inicial.
        - pl_inicial: PL inicial.
        - estado: Estado de la pre-cria (ACTIVA/FINALIZADA).
        - fecha_fin: Fecha de finalizacion (opcional).
        - cantidad_final: Cantidad final (opcional).
        - pl_final: PL final (opcional).
        */
        this.id_lote_larva = Number(id_lote_larva);
        this.id_finca = Number(id_finca);
        this.estanque_id = Number(estanque_id);
        this.grupo_datos = grupo_datos ? String(grupo_datos).trim() : null;
        this.unidad_precria = String(unidad_precria).trim();
        this.duracion_dias = Number(duracion_dias);
        this.fecha_inicio = String(fecha_inicio).trim();
        this.cantidad_inicial = Number(cantidad_inicial);
        this.pl_inicial = Number(pl_inicial);
        this.estado = estado 
            ? String(estado).trim().toUpperCase() 
            : EstadoPrecria.ACTIVA;
        this.fecha_fin = fecha_fin ? String(fecha_fin).trim() : null;
        this.cantidad_final = cantidad_final !== undefined && cantidad_final !== null
            ? Number(cantidad_final)
            : null;
        this.pl_final = pl_final !== undefined && pl_final !== null
            ? Number(pl_final)
            : null;
        this.activo = Boolean(activo);
        this.fecha_creacion = fecha_creacion;
        this.fecha_actualizacion = fecha_actualizacion;
    }
}