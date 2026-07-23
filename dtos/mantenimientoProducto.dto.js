/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.dto.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoProductos
Descripcion:
DTO para la tabla junction mantenimiento_equipo_productos.
Vincula un ticket de mantenimiento con un producto.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class MantenimientoProductoDTO {
    constructor({
        id,
        grupoDatos,
        mantenimientoEquipoId,
        productoId,
        cantidad,
        costoUnitario,
        subtotal,
    }) {
        /*
        Descripcion:
        Construye un objeto MantenimientoProductoDTO.

        Parametros:
        - id:                    Identificador unico (opcional en creacion)
        - grupoDatos:            Grupo de datos (requerido)
        - mantenimientoEquipoId: FK a mantenimiento_equipo (requerido)
        - productoId:            FK a productos (requerido)
        - cantidad:              Cantidad usada (requerido)
        - costoUnitario:         Costo por unidad (requerido)
        - subtotal:              Subtotal calculado (requerido)
        */
        this.id                    = id;
        this.grupoDatos            = grupoDatos;
        this.mantenimientoEquipoId = mantenimientoEquipoId;
        this.productoId            = productoId;
        this.cantidad              = Number(cantidad)      || 1;
        this.costoUnitario         = Number(costoUnitario) || 0;
        this.subtotal              = Number(subtotal)      || 0;
    }
}