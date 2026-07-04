/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.service.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Define las reglas de negocio, validaciones, catalogos y
calculos del modulo de enfermedades.

Importante:
Este archivo NO debe usar el modelo. El acceso al modelo
se realiza desde el controller.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { TipoEnfermedad, SeveridadEnfermedad } from '../dtos/enfermedades.dto.js';

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Catalogos visibles del modulo de enfermedades.
*/

const catalogoEnfermedades = [
    {
        label: 'WSSV - Mancha Blanca',
        value: TipoEnfermedad.WSSV,
        tipo: 'viral',
    },
    {
        label: 'AHPND - Necrosis hepatopancreatica aguda',
        value: TipoEnfermedad.AHPND,
        tipo: 'bacteriana',
    },
    {
        label: 'Vibriosis',
        value: TipoEnfermedad.VIBRIOSIS,
        tipo: 'bacteriana',
    },
    {
        label: 'IHHNV',
        value: TipoEnfermedad.IHHNV,
        tipo: 'viral',
    },
    {
        label: 'NHP - Hepatobacter penaei',
        value: TipoEnfermedad.NHP,
        tipo: 'bacteriana',
    },
    {
        label: 'Otro',
        value: TipoEnfermedad.OTRO,
        tipo: 'otro',
    },
];

const catalogoSeveridades = [
    {
        label: 'Baja',
        value: SeveridadEnfermedad.BAJA,
    },
    {
        label: 'Media',
        value: SeveridadEnfermedad.MEDIA,
    },
    {
        label: 'Alta',
        value: SeveridadEnfermedad.ALTA,
    },
    {
        label: 'Critica',
        value: SeveridadEnfermedad.CRITICA,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion,
catalogo y resumen que utiliza el controller.
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio, es null, undefined
    o solo contiene espacios.

    Parametros:
    - valor: Valor a verificar.

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

    return String(valor).trim().length === 0;
}

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id sea numerico y mayor que cero.

    Parametros:
    - id: ID recibido por parametro.

    Retorna:
    - true si el id es valido.
    - false si el id no es valido.
    */

    const numero = Number(id);

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
    Valida que un valor sea numerico y mayor o igual que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es numerico y mayor o igual que cero.
    - false si no cumple la regla.
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

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Valida que una fecha tenga el formato estandar yyyy-mm-dd.

    Parametros:
    - fecha: Fecha a validar.

    Retorna:
    - true si la fecha tiene formato valido.
    - false si la fecha no cumple el formato.
    */

    if (isEmpty(fecha)) {
        return false;
    }

    const fechaTexto = String(fecha).trim();
    const patronIso = /^\d{4}-\d{2}-\d{2}$/;

    if (patronIso.test(fechaTexto)) {
        return true;
    }

    return false;
}

export function isEnfermedadesValidas(enfermedades) {
    /*
    Descripcion:
    Valida que enfermedades sea una lista y que cada valor
    exista dentro del catalogo permitido.

    Parametros:
    - enfermedades: Lista de enfermedades recibida.

    Retorna:
    - true si la lista es valida.
    - false si la lista es invalida.
    */

    if (Array.isArray(enfermedades) === false) {
        return false;
    }

    if (enfermedades.length === 0) {
        return false;
    }

    for (let i = 0; i < enfermedades.length; i++) {
        if (isEnfermedadValida(enfermedades[i]) === false) {
            return false;
        }
    }

    return true;
}

export function isEnfermedadValida(enfermedad) {
    /*
    Descripcion:
    Valida que una enfermedad exista dentro del enum permitido.

    Parametros:
    - enfermedad: Enfermedad recibida.

    Retorna:
    - true si la enfermedad es valida.
    - false si no es valida.
    */

    if (isEmpty(enfermedad)) {
        return false;
    }

    return Object.values(TipoEnfermedad).includes(String(enfermedad).trim());
}

export function isSeveridadValida(severidad) {
    /*
    Descripcion:
    Valida que una severidad exista dentro del enum permitido.

    Parametros:
    - severidad: Severidad recibida.

    Retorna:
    - true si la severidad es valida.
    - false si no es valida.
    */

    if (isEmpty(severidad)) {
        return false;
    }

    return Object.values(SeveridadEnfermedad).includes(String(severidad).trim());
}

export function obtenerNombreEnfermedad(enfermedad) {
    /*
    Descripcion:
    Obtiene el nombre visible de una enfermedad.

    Parametros:
    - enfermedad: Valor interno de la enfermedad.

    Retorna:
    - Nombre visible de la enfermedad.
    */

    for (let i = 0; i < catalogoEnfermedades.length; i++) {
        if (catalogoEnfermedades[i].value === enfermedad) {
            return catalogoEnfermedades[i].label;
        }
    }

    return 'Otro';
}

export function obtenerNombresEnfermedades(enfermedades) {
    /*
    Descripcion:
    Convierte una lista de enfermedades internas en una lista
    de nombres visibles.

    Parametros:
    - enfermedades: Lista de enfermedades internas.

    Retorna:
    - Lista de nombres visibles.
    */

    const nombres = [];

    if (Array.isArray(enfermedades) === false) {
        return nombres;
    }

    for (let i = 0; i < enfermedades.length; i++) {
        nombres.push(obtenerNombreEnfermedad(enfermedades[i]));
    }

    return nombres;
}

export function obtenerNombreSeveridad(severidad) {
    /*
    Descripcion:
    Obtiene el nombre visible de una severidad.

    Parametros:
    - severidad: Valor interno de severidad.

    Retorna:
    - Nombre visible de la severidad.
    */

    for (let i = 0; i < catalogoSeveridades.length; i++) {
        if (catalogoSeveridades[i].value === severidad) {
            return catalogoSeveridades[i].label;
        }
    }

    return 'Baja';
}

export function obtenerCatalogoEnfermedades() {
    /*
    Descripcion:
    Obtiene el catalogo de enfermedades disponibles.

    Parametros:
    No posee.

    Retorna:
    - Lista de enfermedades con label, value y tipo.
    */

    return catalogoEnfermedades;
}

export function obtenerCatalogoSeveridades() {
    /*
    Descripcion:
    Obtiene el catalogo de severidades disponibles.

    Parametros:
    No posee.

    Retorna:
    - Lista de severidades con label y value.
    */

    return catalogoSeveridades;
}

export function construirResumenEnfermedades(registros) {
    /*
    Descripcion:
    Construye un resumen general de los registros de enfermedades.

    Parametros:
    - registros: Lista de registros de enfermedades.

    Retorna:
    - Objeto con totales y frecuencias.
    */

    const resumen = {
        totalRegistros: registros.length,
        totalMortalidad: 0,
        enfermedadesFrecuentes: [],
        severidadesFrecuentes: [],
    };

    const contadorEnfermedades = {};
    const contadorSeveridades = {};

    for (let i = 0; i < registros.length; i++) {
        const registro = registros[i];

        sumarMortalidad(resumen, registro);
        contarEnfermedades(contadorEnfermedades, registro);
        contarValor(contadorSeveridades, registro.severidad);
    }

    resumen.enfermedadesFrecuentes = construirListaEnfermedades(contadorEnfermedades);
    resumen.severidadesFrecuentes = construirListaSeveridades(contadorSeveridades);

    return resumen;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones auxiliares utilizadas para construir resumenes.
*/

function sumarMortalidad(resumen, registro) {
    /*
    Descripcion:
    Suma la mortalidad de un registro al resumen general.

    Parametros:
    - resumen: Objeto resumen donde se acumula la mortalidad.
    - registro: Registro actual de enfermedad.

    Retorna:
    No retorna valor.
    */

    const mortalidad = Number(registro.mortalidad);

    if (Number.isNaN(mortalidad)) {
        return;
    }

    resumen.totalMortalidad = resumen.totalMortalidad + mortalidad;
}

function contarEnfermedades(contador, registro) {
    /*
    Descripcion:
    Cuenta las apariciones de cada enfermedad en un registro.

    Parametros:
    - contador: Objeto donde se almacenan las cantidades.
    - registro: Registro actual de enfermedad.

    Retorna:
    No retorna valor.
    */

    if (Array.isArray(registro.enfermedades) === false) {
        return;
    }

    for (let i = 0; i < registro.enfermedades.length; i++) {
        contarValor(contador, registro.enfermedades[i]);
    }
}

function contarValor(contador, valor) {
    /*
    Descripcion:
    Suma una ocurrencia dentro de un objeto contador.

    Parametros:
    - contador: Objeto donde se almacenan las cantidades.
    - valor: Valor que se desea contar.

    Retorna:
    No retorna valor.
    */

    if (isEmpty(valor)) {
        return;
    }

    if (contador[valor] === undefined) {
        contador[valor] = 0;
    }

    contador[valor] = contador[valor] + 1;
}

function construirListaEnfermedades(contador) {
    /*
    Descripcion:
    Convierte el contador de enfermedades en una lista ordenada.

    Parametros:
    - contador: Objeto con enfermedades y cantidades.

    Retorna:
    - Lista de enfermedades con valor, nombre y cantidad.
    */

    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

        lista.push({
            valor: clave,
            nombre: obtenerNombreEnfermedad(clave),
            cantidad: contador[clave],
        });
    }

    lista.sort(function (a, b) {
        return b.cantidad - a.cantidad;
    });

    return lista;
}

function construirListaSeveridades(contador) {
    /*
    Descripcion:
    Convierte el contador de severidades en una lista ordenada.

    Parametros:
    - contador: Objeto con severidades y cantidades.

    Retorna:
    - Lista de severidades con valor, nombre y cantidad.
    */

    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

        lista.push({
            valor: clave,
            nombre: obtenerNombreSeveridad(clave),
            cantidad: contador[clave],
        });
    }

    lista.sort(function (a, b) {
        return b.cantidad - a.cantidad;
    });

    return lista;
}