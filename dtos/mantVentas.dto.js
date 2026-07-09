/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.dto.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Ventas
Descripcion:
Archivo de transferencia de datos para ventas.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de ventas.
*/

export class mantVentaDTO {
    constructor(grupoDatos, id, finca, estanque, pesoPromedio, tamanoPromedio, cantVendida, precioKilo, fecha, total, colaborador, comprador) {
        /*
        Descripcion:
        Construye un objeto mantVentaDTO con los datos recibidos.

        Parametros:
        - id: Identificador unico de la venta (opcional)
        - finca: Identificador de la finca (requerido)
        - estanque: Identificador del estanque (requerido)
        - pesoPromedio: Peso promedio de los peces vendidos (requerido)
        - tamanoPromedio: Tamaño promedio de los peces vendidos (requerido)
        - cantVendida: Cantidad de peces vendidos (requerido)
        - precioKilo: Precio por kilo de los peces vendidos (requerido)
        - fecha: Fecha de la venta (requerido)
        - total: Total de la venta (requerido)
        - colaborador: Identificador del colaborador (requerido)
        - comprador: Identificador del comprador (requerido)
        */
        this.grupoDatos = grupoDatos;
        this.id = id || null;
        this.finca = finca;
        this.estanque = estanque;
        this.pesoPromedio = pesoPromedio;
        this.tamanoPromedio = tamanoPromedio;
        this.cantVendida = cantVendida;
        this.precioKilo = precioKilo;
        this.fecha = fecha;
        this.total = total;
        this.colaborador = colaborador;
        this.comprador = comprador;
    }
}