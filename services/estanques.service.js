/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.service.js
Autor: Gerald Alfaro
Fecha: 31/07/2026
Modulo: Estanques
Descripcion:
Define las reglas de negocio, validaciones y preparacion
de equipos asociados al modulo de estanques.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import {
    EstadoEstanque
} from "../dtos/estanques.dto.js";

import {
    TipoEquipo
} from "../dtos/equipo.dto.js";

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
    - false si no es valido.
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

export function isEstadoEstanque(estado) {
    /*
    Descripcion:
    Valida que el estado recibido exista dentro de los
    estados permitidos del modulo.

    Parametros:
    - estado: Estado recibido.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */

    const estados = Object.values(
        EstadoEstanque
    );

    for (
        let i = 0;
        i < estados.length;
        i++
    ) {
        if (estado === estados[i]) {
            return true;
        }
    }

    return false;
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id sea numerico y mayor a cero.

    Parametros:
    - id: Id recibido.

    Retorna:
    - true si es valido.
    - false si no es valido.
    */

    return isNumeroMayorCero(
        id
    );
}

export function isFechaOpcionalValida(valor) {
    /*
    Descripcion:
    Valida una fecha opcional.
    Permite los formatos YYYY-MM-DD y DD/MM/YYYY.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - true si viene vacia o es valida.
    - false si el formato o fecha no son validos.
    */

    if (isEmpty(valor)) {
        return true;
    }

    if (valor instanceof Date) {
        return !Number.isNaN(
            valor.getTime()
        );
    }

    const texto = String(valor).trim();

    if (texto.includes("/")) {
        const partes = texto.split("/");

        if (partes.length !== 3) {
            return false;
        }

        return esFechaReal(
            partes[0],
            partes[1],
            partes[2]
        );
    }

    if (texto.includes("-")) {
        const partes = texto.split("-");

        if (partes.length !== 3) {
            return false;
        }

        return esFechaReal(
            partes[2],
            partes[1],
            partes[0]
        );
    }

    return false;
}

export function isBooleanoOpcionalValido(valor) {
    /*
    Descripcion:
    Valida diferentes representaciones de un booleano.
    Si el campo no fue enviado se considera valido.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - true si es una representacion valida.
    - false si el valor no corresponde a un booleano.
    */

    if (
        valor === undefined ||
        valor === null ||
        valor === ""
    ) {
        return true;
    }

    if (
        valor === true ||
        valor === false
    ) {
        return true;
    }

    if (
        valor === 1 ||
        valor === 0 ||
        valor === "1" ||
        valor === "0"
    ) {
        return true;
    }

    if (
        valor === "true" ||
        valor === "false" ||
        valor === "Si" ||
        valor === "si" ||
        valor === "No" ||
        valor === "no"
    ) {
        return true;
    }

    return false;
}

export function agruparEquiposPorTipo(equipos) {
    /*
    Descripcion:
    Agrupa los equipos asociados a un estanque segun
    el valor de tipoEquipo.

    Parametros:
    - equipos: Lista de equipos asociados al estanque.

    Retorna:
    - Objeto con los equipos separados por tipo.
    */

    const agrupados = {
        aireacion: [],
        bombeo: [],
        alimentacion: [],
        monitoreo: [],
        mantenimiento: [],
        otros: []
    };

    for (
        let i = 0;
        i < equipos.length;
        i++
    ) {
        const equipo = equipos[i];

        if (
            equipo.tipoEquipo ===
            TipoEquipo.AIREACION
        ) {
            agrupados.aireacion.push(
                equipo
            );
        } else if (
            equipo.tipoEquipo ===
            TipoEquipo.BOMBEO
        ) {
            agrupados.bombeo.push(
                equipo
            );
        } else if (
            equipo.tipoEquipo ===
            TipoEquipo.ALIMENTACION
        ) {
            agrupados.alimentacion.push(
                equipo
            );
        } else if (
            equipo.tipoEquipo ===
            TipoEquipo.MONITOREO
        ) {
            agrupados.monitoreo.push(
                equipo
            );
        } else if (
            equipo.tipoEquipo ===
            TipoEquipo.MANTENIMIENTO
        ) {
            agrupados.mantenimiento.push(
                equipo
            );
        } else {
            agrupados.otros.push(
                equipo
            );
        }
    }

    return agrupados;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas por las
validaciones principales.
*/

function esFechaReal(
    diaValor,
    mesValor,
    anioValor
) {
    /*
    Descripcion:
    Verifica que los componentes recibidos formen una
    fecha real del calendario.

    Parametros:
    - diaValor: Dia recibido.
    - mesValor: Mes recibido.
    - anioValor: Anio recibido.

    Retorna:
    - true si la fecha es valida.
    - false si no es valida.
    */

    const dia = Number(
        diaValor
    );

    const mes = Number(
        mesValor
    );

    const anio = Number(
        anioValor
    );

    if (
        !Number.isInteger(dia) ||
        !Number.isInteger(mes) ||
        !Number.isInteger(anio)
    ) {
        return false;
    }

    if (
        String(anioValor).length !== 4 ||
        dia < 1 ||
        mes < 1 ||
        mes > 12
    ) {
        return false;
    }

    const fecha = new Date(
        anio,
        mes - 1,
        dia
    );

    if (
        fecha.getFullYear() !== anio ||
        fecha.getMonth() !== mes - 1 ||
        fecha.getDate() !== dia
    ) {
        return false;
    }

    return true;
}