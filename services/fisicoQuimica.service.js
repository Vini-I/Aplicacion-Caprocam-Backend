/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.service.js
Autor: Samuel Cerdas
Fecha: 31/07/2026
Modulo: Fisico Quimica
Descripcion:
Define las reglas de negocio y validaciones del modulo
de Fisico Quimica.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene las funciones internas utilizadas para validar
las mediciones del modulo.
*/

function isMedicionValida(medicion) {
    /*
    Descripcion:
    Valida la estructura de una medicion fisico quimica.

    Parametros:
    - medicion: Objeto con valor y etiqueta.

    Retorna:
    - true si la medicion es valida.
    - false si la medicion es invalida.
    */
    if (
        !medicion ||
        typeof medicion !== 'object' ||
        Array.isArray(medicion)
    ) {
        return false;
    }

    if (!isNumeroValido(medicion.valor)) {
        return false;
    }

    if (isEmpty(medicion.etiqueta)) {
        return false;
    }

    return true;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion
que utiliza el middleware para verificar los datos.
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
    if (valor === undefined || valor === null) {
        return true;
    }

    if (
        typeof valor === 'string' &&
        valor.trim().length === 0
    ) {
        return true;
    }

    return false;
}

export function isNumeroValido(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y finito.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es numerico.
    - false si no es numerico.
    */
    if (isEmpty(valor)) {
        return false;
    }

    return Number.isFinite(
        Number(valor)
    );
}

export function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor a cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */
    if (!isNumeroValido(valor)) {
        return false;
    }

    return Number(valor) > 0;
}

export function isArrayValido(arreglo) {
    /*
    Descripcion:
    Valida que un arreglo exista y, si contiene elementos,
    que cada medicion tenga las propiedades valor y etiqueta.
    Permite arreglos vacios para parametros no registrados.

    Parametros:
    - arreglo: Arreglo de mediciones a validar.

    Retorna:
    - true si el arreglo es valido o esta vacio.
    - false si no es un arreglo o contiene datos invalidos.
    */
    if (!Array.isArray(arreglo)) {
        return false;
    }

    if (arreglo.length === 0) {
        return true;
    }

    return arreglo.every(
        isMedicionValida
    );
}

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Verifica que una fecha tenga formato YYYY-MM-DD,
    sea una fecha real y no sea posterior a la fecha actual.

    Parametros:
    - fecha: Fecha recibida.

    Retorna:
    - true si la fecha es valida.
    - false si la fecha es invalida.
    */
    if (
        typeof fecha !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ) {
        return false;
    }

    const fechaIngresada = new Date(
        `${fecha}T00:00:00`
    );

    if (
        Number.isNaN(
            fechaIngresada.getTime()
        )
    ) {
        return false;
    }

    if (
        fechaIngresada
            .toISOString()
            .slice(0, 10) !== fecha
    ) {
        return false;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return fechaIngresada <= hoy;
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
    - false si no es valido.
    */
    return isNumeroMayorCero(id);
}

export function isPhValido(ph) {
    /*
    Descripcion:
    Valida el arreglo de mediciones de pH.

    Parametros:
    - ph: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */
    return isArrayValido(ph);
}

export function isSalinidadValida(salinidad) {
    /*
    Descripcion:
    Valida el arreglo de mediciones de salinidad.

    Parametros:
    - salinidad: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */
    return isArrayValido(salinidad);
}

export function isTemperaturaValida(temperatura) {
    /*
    Descripcion:
    Valida el arreglo de mediciones de temperatura.

    Parametros:
    - temperatura: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */
    return isArrayValido(temperatura);
}

export function isOxigeno(oxigenoDisuelto) {
    /*
    Descripcion:
    Valida el arreglo de mediciones de oxigeno disuelto.

    Parametros:
    - oxigenoDisuelto: Arreglo de mediciones.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */
    return isArrayValido(
        oxigenoDisuelto
    );
}
