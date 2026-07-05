/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.dto.js
Autor: Jose Espinoza
Fecha: 29/06/2026
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
    constructor({ id, nombre, categoria, cantidad, stockMinimo, precioUnidad, estado }) {
        this.id           = id;
        this.nombre       = nombre;
        this.categoria    = categoria;
        this.cantidad     = cantidad;
        this.stockMinimo  = stockMinimo;
        this.precioUnidad = precioUnidad;
        this.estado       = estado;
    }
}