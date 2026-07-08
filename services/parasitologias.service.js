/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.service.js
Autor: Andres Gutierrez
Fecha: 03/07/2026
Modulo: Parasitologias
Descripcion:
Define las reglas de negocio, validaciones y calculos
del modulo de parasitologias.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { ParasitoParasitologia, GradoInfeccion } from "../dtos/parasitologias.dto.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Catalogo visible de parasitos disponibles.
*/

const catalogoParasitos = [
    {
        label: "Gregarina",
        value: ParasitoParasitologia.GREGARINA
    },
    {
        label: "Nematodo",
        value: ParasitoParasitologia.NEMATODO
    },
    {
        label: "Epicomensal",
        value: ParasitoParasitologia.EPICOMENSAL
    },
    {
        label: "Protozoario",
        value: ParasitoParasitologia.PROTOZOARIO
    },
    {
        label: "Otro",
        value: ParasitoParasitologia.OTRO
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables de validacion,
catalogo y calculo que utiliza el controller.
*/

export function isEmpty(valor) {
    /*
    Descripcion:
    Verifica si un valor esta vacio.

    Parametros:
    - valor: Valor a revisar.

    Retorna:
    - true si esta vacio, false si tiene contenido.
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

export function isIdValido(id) {
    /*
    Descripcion:
    Valida que un id sea numerico y mayor a cero.

    Parametros:
    - id: Id recibido por parametro.

    Retorna:
    - true si es valido, false si no.
    */
    return isNumeroMayorCero(id);
}

export function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es numerico y mayor que cero, false si no.
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
    Valida que un valor sea numerico y mayor o igual que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es numerico y mayor o igual que cero, false si no.
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

export function isNumeroOpcionalMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor opcional sea numerico y mayor que cero.
    Si viene vacio, se considera valido.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es valido, false si no.
    */
    if (isEmpty(valor)) {
        return true;
    }

    return isNumeroMayorCero(valor);
}

export function isFechaValida(fecha) {
    /*
    Descripcion:
    Valida que una fecha tenga formato permitido.
    Se aceptan formatos yyyy-mm-dd y dd/mm/aaaa.

    Parametros:
    - fecha: Fecha a validar.

    Retorna:
    - true si la fecha tiene formato valido, false si no.
    */
    if (isEmpty(fecha)) {
        return false;
    }

    const fechaTexto = String(fecha).trim();
    const patronIso = /^\d{4}-\d{2}-\d{2}$/;
    const patronLocal = /^\d{2}\/\d{2}\/\d{4}$/;

    if (patronIso.test(fechaTexto)) {
        return true;
    }

    if (patronLocal.test(fechaTexto)) {
        return true;
    }

    return false;
}

export function isParasitoValido(parasito) {
    /*
    Descripcion:
    Valida que el parasito recibido exista dentro de los
    parasitos permitidos del modulo.

    Parametros:
    - parasito: Valor del parasito.

    Retorna:
    - true si es valido, false si no.
    */
    if (isEmpty(parasito)) {
        return false;
    }

    const parasitos = Object.values(ParasitoParasitologia);
    const parasitoTexto = String(parasito).trim();

    for (let i = 0; i < parasitos.length; i++) {
        if (parasitoTexto === parasitos[i]) {
            return true;
        }
    }

    return false;
}

export function isInfectadosValido(camaronesMuestreados, camaronesInfectados) {
    /*
    Descripcion:
    Valida que los camarones infectados no sean mayores
    que los camarones muestreados.

    Parametros:
    - camaronesMuestreados: Total de camarones revisados.
    - camaronesInfectados: Total de camarones infectados.

    Retorna:
    - true si la relacion es valida, false si no.
    */
    const muestreados = Number(camaronesMuestreados);
    const infectados = Number(camaronesInfectados);

    if (Number.isNaN(muestreados)) {
        return false;
    }

    if (Number.isNaN(infectados)) {
        return false;
    }

    if (infectados > muestreados) {
        return false;
    }

    return true;
}

export function calcularPorcentajeInfeccion(camaronesMuestreados, camaronesInfectados) {
    /*
    Descripcion:
    Calcula el porcentaje de infeccion del muestreo.

    Parametros:
    - camaronesMuestreados: Total de camarones revisados.
    - camaronesInfectados: Total de camarones infectados.

    Retorna:
    - Porcentaje de infeccion con dos decimales.
    */
    const muestreados = Number(camaronesMuestreados);
    const infectados = Number(camaronesInfectados);

    if (Number.isNaN(muestreados)) {
        return 0;
    }

    if (Number.isNaN(infectados)) {
        return 0;
    }

    if (muestreados <= 0) {
        return 0;
    }

    const porcentaje = (infectados / muestreados) * 100;

    return Number(porcentaje.toFixed(2));
}

export function calcularGradoInfeccion(porcentajeInfeccion) {
    /*
    Descripcion:
    Calcula el grado de infeccion segun el porcentaje.

    Parametros:
    - porcentajeInfeccion: Porcentaje calculado.

    Retorna:
    - bajo, medio o alto.
    */
    const porcentaje = Number(porcentajeInfeccion);

    if (porcentaje >= 60) {
        return GradoInfeccion.ALTO;
    }

    if (porcentaje >= 30) {
        return GradoInfeccion.MEDIO;
    }

    return GradoInfeccion.BAJO;
}

export function obtenerNombreGradoInfeccion(gradoInfeccion) {
    /*
    Descripcion:
    Obtiene el nombre visible del grado de infeccion.

    Parametros:
    - gradoInfeccion: Valor del grado de infeccion.

    Retorna:
    - Nombre visible del grado.
    */
    if (gradoInfeccion === GradoInfeccion.ALTO) {
        return "Alto";
    }

    if (gradoInfeccion === GradoInfeccion.MEDIO) {
        return "Medio";
    }

    return "Bajo";
}

export function obtenerNombreParasito(parasito) {
    /*
    Descripcion:
    Obtiene el nombre visible de un parasito.

    Parametros:
    - parasito: Valor interno del parasito.

    Retorna:
    - Nombre visible del parasito.
    */
    for (let i = 0; i < catalogoParasitos.length; i++) {
        if (catalogoParasitos[i].value === parasito) {
            return catalogoParasitos[i].label;
        }
    }

    return "Otro";
}

export function obtenerCatalogoParasitos() {
    /*
    Descripcion:
    Obtiene el catalogo de parasitos disponibles.

    Parametros:
    No posee.

    Retorna:
    - Lista de parasitos con label y value.
    */
    return catalogoParasitos;
}

export function construirResumenParasitologias(registros) {
    /*
    Descripcion:
    Construye un resumen general de los registros de parasitologias.

    Parametros:
    - registros: Lista de registros de parasitologias.

    Retorna:
    - Objeto con totales, promedio y frecuencias.
    */
    const resumen = {
        totalRegistros: registros.length,
        totalCamaronesMuestreados: 0,
        totalCamaronesInfectados: 0,
        promedioInfeccion: 0,
        gradosFrecuentes: [],
        parasitosFrecuentes: []
    };

    const contadorGrados = {};
    const contadorParasitos = {};
    let sumaPorcentajeInfeccion = 0;

    for (let i = 0; i < registros.length; i++) {
        const registro = registros[i];

        resumen.totalCamaronesMuestreados =
            resumen.totalCamaronesMuestreados +
            Number(registro.camaronesMuestreados);

        resumen.totalCamaronesInfectados =
            resumen.totalCamaronesInfectados +
            Number(registro.camaronesInfectados);

        sumaPorcentajeInfeccion =
            sumaPorcentajeInfeccion +
            Number(registro.porcentajeInfeccion);

        contarValor(contadorGrados, registro.gradoInfeccion);
        contarValor(contadorParasitos, registro.parasito);
    }

    if (registros.length > 0) {
        resumen.promedioInfeccion = sumaPorcentajeInfeccion / registros.length;
        resumen.promedioInfeccion = Number(resumen.promedioInfeccion.toFixed(2));
    }

    resumen.gradosFrecuentes = construirListaContador(contadorGrados);
    resumen.parasitosFrecuentes = construirListaContador(contadorParasitos);

    return resumen;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones auxiliares utilizadas para construir resumenes.
*/

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

function construirListaContador(contador) {
    /*
    Descripcion:
    Convierte un objeto contador en una lista ordenada.

    Parametros:
    - contador: Objeto con valores y cantidades.

    Retorna:
    - Lista de objetos con valor y cantidad.
    */
    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        const clave = claves[i];

        lista.push({
            valor: clave,
            cantidad: contador[clave]
        });
    }

    lista.sort(function (a, b) {
        return b.cantidad - a.cantidad;
    });

    return lista;
}