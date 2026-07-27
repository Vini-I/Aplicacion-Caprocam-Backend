/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.service.js
Autor: Brandon
Fecha: 29/06/2026
Modulo: Trazabilidad
Descripcion:
Service encargado de contener la logica de
negocio del modulo de trazabilidad.
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

export function isEstanqueOrigenValido(estanqueOrigenId) {
    /*
    Descripcion:
    Verifica que el estanque de origen
    tenga informacion.

    Parametros:
    - estanqueOrigenId: Identificador del estanque.

    Retorna:
    - true si es valido.
    - false si esta vacio.
    */

    return !isEmpty(estanqueOrigenId);
}

export function isEstanqueDestinoValido(estanqueDestinoId) {
    /*
    Descripcion:
    Verifica que el estanque de destino
    tenga informacion.

    Parametros:
    - estanqueDestinoId: Identificador del estanque.

    Retorna:
    - true si es valido.
    - false si esta vacio.
    */

    return !isEmpty(estanqueDestinoId);
}

export function isEstanqueDiferente(estanqueOrigenId, estanqueDestinoId) {
    /*
    Descripcion:
    Verifica que el estanque de origen
    sea diferente al estanque de destino.

    Parametros:
    - estanqueOrigenId: Estanque origen.
    - estanqueDestinoId: Estanque destino.

    Retorna:
    - true si son diferentes.
    - false si son iguales.
    */

    return estanqueOrigenId !== estanqueDestinoId;
}

export function isTamanoValido(tamano) {
    /*
    Descripcion:
    Valida que el tamaño sea un numero
    mayor a cero.

    Parametros:
    - tamano: Tamaño registrado.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isNumeroMayorCero(tamano);
}

export function isDiasValidos(dias) {
    /*
    Descripcion:
    Valida que los dias sean un numero
    mayor a cero.

    Parametros:
    - dias: Dias registrados.

    Retorna:
    - true si es valido.
    - false si no.
    */

    return isNumeroMayorCero(dias);
}

export function isPlValido(pl) {
    /*
    Descripcion:
    Valida que el PL sea un numero
    mayor a cero.

    Parametros:
    - pl: Cantidad de PL.

    Retorna:
    - true si es valido.
    - false si no
    */

    return isNumeroMayorCero(pl);
}