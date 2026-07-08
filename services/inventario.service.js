/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: inventario.service.js
Autor: Brayan / Joan
Fecha: 30/06/2026
Modulo: Inventario
Descripcion:
Define las funciones de validacion y reglas de negocio
del modulo de inventario.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function isCodigo(codigo) {
    /*
    Descripcion:
    Valida el codigo de producto. Verifica que no venga vacio.

    Parametros:
    - codigo: String a validar.

    Retorna:
    - true si el codigo tiene contenido, false si esta vacio.
    */
    if (!codigo) return false;
    return codigo.trim().length > 0;
}

export function isNumeroValido(numero) {
    /*
    Descripcion:
    Valida que un valor sea un numero finito y no negativo.

    Parametros:
    - numero: Valor a validar.

    Retorna:
    - true si es un numero valido, false si no.
    */
    const valor = Number(numero);
    return !Number.isNaN(valor) && Number.isFinite(valor) && valor >= 0;
}

export function isEmpty(string) {
    /*
    Descripcion:
    Verifica si un string esta vacio o solo tiene espacios.

    Parametros:
    - string: String a verificar.

    Retorna:
    - true si esta vacio, false si tiene contenido.
    */
    if (string === undefined || string === null) return true;
    return String(string).trim().length === 0;
}

export function esStockBajo(cantidad, stockMinimo) {
    /*
    Descripcion:
    Determina si un producto se encuentra en estado de stock bajo.

    Parametros:
    - cantidad:    Cantidad actual del producto.
    - stockMinimo: Cantidad minima antes de alertar.

    Retorna:
    - true si el producto esta en stock bajo, false si no.
    */
    return Number(cantidad) <= Number(stockMinimo);
}

export function conStockBajo(producto) {
    /*
    Descripcion:
    Enriquece un producto con la bandera calculada stockBajo.

    Parametros:
    - producto: Objeto producto proveniente del modelo.

    Retorna:
    - El mismo producto con el campo stockBajo agregado.
    */
    if (!producto) return null;
    return {
        ...producto,
        stockBajo: esStockBajo(producto.cantidad, producto.stockMinimo),
    };
}

export function listaConStockBajo(productos) {
    /*
    Descripcion:
    Aplica conStockBajo() a una lista completa de productos.

    Parametros:
    - productos: Lista de productos.

    Retorna:
    - Lista de productos con la bandera stockBajo agregada.
    */
    if (!productos) return [];
    return productos.map(conStockBajo);
}