/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.service.js
Autor: Samuel
Fecha: 29/06/2026
Modulo: Fisico Quimica
Descripcion:
Define las reglas de negocio y validaciones del modulo
de Fisico Quimica.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el controller para verificar los datos.
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.

    Parametros:
    - valor: Valor a revisar.

    Retorna:
    - true si esta vacio.
    - false si tiene contenido.
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (typeof valor === "string") {
        if (valor.trim().length === 0) {
            return true;
        }
    }

    return false;
}

export function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor a cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es valido.
    - false si no.
    */

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero <= 0) {
        return false;
    }

    return true;
}

export function isArrayValido(arreglo) {
    /*
    Descripcion:
    Valida que un arreglo exista y contenga
    al menos un elemento.

    Parametros:
    - arreglo: Arreglo a validar.

    Retorna:
    - true si es valido.
    - false si no.
    */

    if (!Array.isArray(arreglo)) {
        return false;
    }

    if (arreglo.length === 0) {
        return false;
    }

    return true;
}

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Verifica que una fecha tenga contenido.

    Parametros:
    - fecha: Fecha recibida.

    Retorna:
    - true si la fecha es valida.
    - false si esta vacia.
    */

    return !isEmpty(fecha);
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un identificador sea numerico
    y mayor a cero.

    Parametros:
    - id: Identificador recibido.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isNumeroMayorCero(id);
}

export function isPhValido(ph) {
    /*
    Descripcion:
    Valida que el arreglo de mediciones de pH
    contenga informacion.

    Parametros:
    - ph: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isArrayValido(ph);
}

export function isSalinidadValida(salinidad) {
    /*
    Descripcion:
    Valida que el arreglo de salinidad
    contenga informacion.

    Parametros:
    - salinidad: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isArrayValido(salinidad);
}

export function isTemperaturaValida(temperatura) {
    /*
    Descripcion:
    Valida que el arreglo de temperatura
    contenga informacion.

    Parametros:
    - temperatura: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isArrayValido(temperatura);
}

export function isOxigeno(oxigeno) {
    /*
    Descripcion:
    Valida que el arreglo de oxigeno disuelto
    contenga informacion.

    Parametros:
    - oxigenoDisuelto: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isArrayValido(oxigeno);
}
