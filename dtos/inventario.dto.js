/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.dto.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
DTO de entrada y mapper de salida, SOLO para los campos
propios de la tabla inventario (producto_id, proveedor_id,
cantidad, stock_minimo). El catalogo (nombre, categoria,
precio, etc.) vive en el modulo "producto", separado.
 
cantidad NO se acepta en el DTO de actualizacion: solo cambia
via movimientos_inventario, para mantener el registro de
auditoria como unica fuente de verdad.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
 
Caparazon de datos para el modulo de inventario.
*/

export class InventarioCreateDTO {
    constructor({
        producto_id,
        productoId,
        proveedor_id,
        proveedorId,
        stock_minimo,
        stockMinimo,
    }) {
        /*
        Descripcion:
        DTO de entrada para crear un registro de inventario.
        cantidad siempre inicia en 0; la carga inicial de stock
        se hace con un primer movimiento tipo 'Entrada'.
 
        Parametros:
        - producto_id:   ID del producto ya existente (requerido).
        - proveedor_id:  ID del proveedor (opcional, FK nullable).
        - stock_minimo:  Cantidad minima antes de alertar (requerido).
        */
        const productoDb  = producto_id ?? productoId;
        const proveedorDb = proveedor_id ?? proveedorId;
        const stockMinDb  = stock_minimo ?? stockMinimo;
 
        this.producto_id  = Number(productoDb);
        this.proveedor_id = proveedorDb ? Number(proveedorDb) : null;
        this.stock_minimo = Number(stockMinDb);
    }
}

/*
//////////////////////////////////////////////////////////
DTO DE ENTRADA — actualizacion (sin cantidad)
//////////////////////////////////////////////////////////
*/
 
export class InventarioUpdateDTO {
    constructor({
        proveedor_id,
        proveedorId,
        stock_minimo,
        stockMinimo,
    }) {
        /*
        Descripcion:
        DTO de entrada para actualizar un registro de inventario.
        Solo permite tocar proveedor_id y stock_minimo. cantidad
        NO se acepta aqui: cambia unicamente via movimientos.
 
        Parametros:
        - proveedor_id:  ID del proveedor (opcional, FK nullable).
        - stock_minimo:  Cantidad minima antes de alertar (requerido).
        */
        const proveedorDb = proveedor_id ?? proveedorId;
        const stockMinDb  = stock_minimo ?? stockMinimo;
 
        this.proveedor_id = proveedorDb ? Number(proveedorDb) : null;
        this.stock_minimo = Number(stockMinDb);
    }
}
 

 

function formatearFechaDDMMAAAA(valor) {
    if (!valor) return null;

    const fecha = valor instanceof Date ? valor : new Date(valor);
    if (Number.isNaN(fecha.getTime())) return null;

    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
}

/*
//////////////////////////////////////////////////////////
MAPPER DE SALIDA — fila JOIN (inventario + productos) -> camelCase
//////////////////////////////////////////////////////////
 
Se sigue usando JOIN solo para enriquecer la respuesta con el
nombre/categoria del producto; el modulo de productos sigue
siendo el dueño de esos datos.
*/

export function mapearInventario(row) {
    /*
    Descripcion:
    Convierte una fila cruda del JOIN inventario+productos
    (con los alias definidos en SELECT_JOIN) a un objeto de
    respuesta en camelCase para el frontend.
 
    Parametros:
    - row: Fila cruda devuelta por mysql2 (con alias inv_id,
      inv_uuid, inv_activo, prod_id, etc).
 
    Retorna:
    - Objeto formateado para el frontend, o null.
    */
    if (!row) return null;
    return {
        id:                 row.inv_id,
        uuid:               row.inv_uuid,
        productoId:         row.prod_id,
        codigo:             row.codigo, 
        nombre:             row.nombre,
        categoria:          row.categoria,
        unidad:             row.unidad,
        precioUnidad:       row.precio_unidad !== undefined
            ? Number(row.precio_unidad) : undefined,
        proveedorId:        row.proveedor_id,
        nombreProveedor:    row.nombre_proveedor,
        cantidad:           Number(row.cantidad),
        stockMinimo:        Number(row.stock_minimo),
        fechaCaducidad:     formatearFechaDDMMAAAA(row.fecha_caducidad),  
        estado:             row.estado,
        activo:             Boolean(row.inv_activo),
        version:            row.version,
        fechaCreacion:      row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
    };
}
