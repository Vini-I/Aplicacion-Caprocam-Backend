/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.service.js
Autor: Eduard Salas
Fecha: 6/07/2026
Modulo: Densidad Poblacional
Descripcion:
Define las reglas de negocio y validaciones del modulo
de densidad poblacional.
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
    - valor: Valor a revisar

    Retorna:
    - true si esta vacio, false si tiene contenido
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
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
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

export function isNumeroMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor o igual a cero.

    Parametros:
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
    */
    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero < 0) {
        return false;
    }

    return true;
}

export function isNumeroOpcionalMayorIgualCero(valor) {
    /*
    Descripcion:
    Valida que un valor opcional sea numerico y mayor o igual a cero.
    Si viene vacio, se considera valido.

    Parametros:
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(valor)) {
        return true;
    }

    return isNumeroMayorIgualCero(valor);
}

export function isPercentageOpcional(valor) {
    /*
    Descripcion:
    Valida que un porcentaje opcional este entre 0 y 100.
    Si viene vacio, se considera valido.

    Parametros:
    - valor: Valor a validar

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(valor)) {
        return true;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return false;
    }

    if (numero < 0) {
        return false;
    }

    if (numero > 100) {
        return false;
    }

    return true;
}

const REGEX_FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isFechaValida(valor) {
    /*
    Descripcion:
    Valida que una fecha sea valida y venga en formato ISO
    estricto YYYY-MM-DD.

    Parametros:
    - valor: Fecha a validar (se espera "YYYY-MM-DD").

    Retorna:
    - true si es valida, false si no
    */
    if (isEmpty(valor)) {
        return false;
    }

    const texto = String(valor).trim();

    if (!REGEX_FECHA_ISO.test(texto)) {
        return false;
    }

    const [anio, mes, dia] = texto.split("-").map(Number);

    const fecha = new Date(anio, mes - 1, dia);

    if (Number.isNaN(fecha.getTime())) {
        return false;
    }

    return (
        fecha.getFullYear() === anio &&
        fecha.getMonth() === mes - 1 &&
        fecha.getDate() === dia
    );
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id sea numerico y mayor a cero.

    Parametros:
    - id: Id recibido

    Retorna:
    - true si es valido, false si no
    */
    return isNumeroMayorCero(id);
}

export function maxLength(valor, max) {
    /*
    Descripcion:
    Verifica que el texto no sobrepase una longitud maxima.

    Parametros:
    - valor: Texto a validar.
    - max: Longitud maxima permitida.

    Retorna:
    - true si es valido, false si no
    */
    if (isEmpty(valor)) {
        return true;
    }

    return String(valor).trim().length <= max;
}