/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.dto.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Archivo de transferencia de datos para inventario.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo unidad.
*/

export const UnidadInventario = Object.freeze({
    KILOGRAMOS: 'kg',
    LITROS:     'litros',
    UNIDADES:   'unidades',
    SACOS:      'sacos',
    GRAMOS:     'gramos',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de inventario.
*/

export class InventarioDTO {
    constructor({
        id,
        codigo,
        nombre,
        categoria,
        cantidad,
        unidad,
        stockMinimo,
        proveedor,
        precioUnidad,
    }) {
        /*
        Descripcion:
        Construye un objeto InventarioDTO con los datos recibidos.

        Parametros:
        - id: Identificador unico (opcional en creacion)
        - codigo: Codigo del producto (opcional, ej. "ALI-001")
        - nombre: Nombre del producto (requerido)
        - categoria: Categoria del producto (requerido)
        - cantidad: Cantidad actual en stock (requerido)
        - unidad: Unidad de medida (requerido, usar UnidadInventario)
        - stockMinimo: Cantidad minima antes de alertar stock bajo
        - proveedor: Proveedor del producto (requerido)
        - precioUnidad: Precio por unidad (requerido)
        */
        this.id           = id;
        this.codigo       = codigo ? String(codigo).trim() : null;
        this.nombre       = String(nombre).trim();
        this.categoria    = String(categoria).trim();
        this.cantidad     = Number(cantidad);
        this.unidad       = String(unidad).trim();
        this.stockMinimo  = Number(stockMinimo);
        this.proveedor    = String(proveedor).trim();
        this.precioUnidad = Number(precioUnidad);
    }
}