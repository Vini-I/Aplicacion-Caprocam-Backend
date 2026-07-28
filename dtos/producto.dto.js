/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.dto.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Productos
Descripcion:
Archivo de transferencia de datos para productos.
//////////////////////////////////////////////////////////
*/

export const CategoriasProducto = Object.freeze({
    FERTILIZANTE: 'Fertilizante',
    HERBICIDA:    'Herbicida',
    FUNGICIDA:    'Fungicida',
    INSECTICIDA:  'Insecticida',
});

export class ProductoDTO {
    /**
     * Descripcion:
     * Construye un objeto ProductoDTO alineado con el frontend.
     * Acepta tanto nomenclaturas en ingles como en espanol.
     *
     * Parametros:
     * - data: Objeto con las propiedades del producto.
     *
     * Retorna:
     * - Instancia normalizada de ProductoDTO.
     */
    constructor({
        id,
        codigo,
        grupoDatos,
        proveedorId,
        nombre,
        categoria,
        unidad,
        precioUnidad,
        cantidad,
        stockMinimo,
        entryDate,
        fechaIngreso,
        expirationDate,
        fechaCaducidad,
        fechaVencimiento,
        estado,
    } = {}) {
        this.id             = id;
        this.codigo         = codigo         ?? null;
        this.grupoDatos     = grupoDatos;
        this.proveedorId    = proveedorId    ?? null;
        this.nombre         = nombre;
        this.categoria      = categoria      ?? null;
        this.unidad         = unidad         ?? 'unidades';
        this.precioUnidad   = precioUnidad   ?? 0;
        this.cantidad       = cantidad       ?? 0;
        this.stockMinimo    = stockMinimo    ?? 0;
        this.entryDate      = entryDate      ?? fechaIngreso   ?? null;
        this.expirationDate = expirationDate ?? fechaCaducidad ?? fechaVencimiento ?? null;
        this.estado         = estado         ?? 'ACTIVO';
    }
}