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

import {
    ParasitoParasitologia,
    GradoInfeccion
} from "../dtos/parasitologias.dto.js";

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

    if (
        typeof valor === "string" &&
        valor.trim().length === 0
    ) {
        return true;
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

    return isNumeroMayorCero(
        id
    );
}

export function isNumeroMayorCero(valor) {
    /*
    Descripcion:
    Valida que un valor sea un numero entero mayor que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es entero y mayor que cero.
    - false si no cumple la regla.
    */

    const numero =
        Number(valor);

    if (
        Number.isInteger(numero) === false
    ) {
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
    Valida que un valor sea un numero entero mayor o igual
    que cero.

    Parametros:
    - valor: Valor a validar.

    Retorna:
    - true si es entero y mayor o igual que cero.
    - false si no cumple la regla.
    */

    const numero =
        Number(valor);

    if (
        Number.isInteger(numero) === false
    ) {
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
    Valida que una fecha tenga un formato permitido y
    corresponda a una fecha real del calendario.
    Se aceptan formatos yyyy-mm-dd y dd/mm/aaaa.

    Parametros:
    - fecha: Fecha a validar.

    Retorna:
    - true si la fecha es valida.
    - false si no es valida.
    */

    const partes =
        obtenerPartesFecha(
            fecha
        );

    return partes !== null;
}

export function isFechaFutura(fecha) {
    /*
    Descripcion:
    Determina si una fecha valida es posterior al dia
    actual segun la fecha configurada en el servidor.

    Parametros:
    - fecha: Fecha en formato yyyy-mm-dd o dd/mm/aaaa.

    Retorna:
    - true si la fecha es futura.
    - false si corresponde a hoy o una fecha anterior.
    */

    const partes =
        obtenerPartesFecha(
            fecha
        );

    if (partes === null) {
        return false;
    }

    const fechaReporte =
        new Date(
            partes.anio,
            partes.mes - 1,
            partes.dia
        );

    const ahora =
        new Date();

    const fechaServidor =
        new Date(
            ahora.getFullYear(),
            ahora.getMonth(),
            ahora.getDate()
        );

    return (
        fechaReporte >
        fechaServidor
    );
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

    const parasitos =
        Object.values(
            ParasitoParasitologia
        );

    const parasitoTexto =
        String(
            parasito
        ).trim();

    for (
        let i = 0;
        i < parasitos.length;
        i++
    ) {
        if (
            parasitoTexto ===
            parasitos[i]
        ) {
            return true;
        }
    }

    return false;
}

export function isInfectadosValido(
    camaronesMuestreados,
    camaronesInfectados
) {
    /*
    Descripcion:
    Valida que los camarones infectados no sean mayores
    que los camarones muestreados cuando ambos valores
    fueron proporcionados.

    Parametros:
    - camaronesMuestreados: Total de camarones revisados.
    - camaronesInfectados: Total de camarones infectados.

    Retorna:
    - true si la relacion es valida o no aplica.
    - false si la relacion es invalida.
    */

    if (
        isEmpty(camaronesMuestreados) ||
        isEmpty(camaronesInfectados)
    ) {
        return true;
    }

    if (
        !isNumeroMayorCero(
            camaronesMuestreados
        )
    ) {
        return false;
    }

    if (
        !isNumeroMayorIgualCero(
            camaronesInfectados
        )
    ) {
        return false;
    }

    const muestreados =
        Number(
            camaronesMuestreados
        );

    const infectados =
        Number(
            camaronesInfectados
        );

    if (
        infectados >
        muestreados
    ) {
        return false;
    }

    return true;
}

export function calcularPorcentajeInfeccion(
    camaronesMuestreados,
    camaronesInfectados
) {
    /*
    Descripcion:
    Calcula el porcentaje de infeccion del muestreo.
    El calculo solamente se realiza cuando ambos valores
    opcionales fueron proporcionados y son validos.

    Parametros:
    - camaronesMuestreados: Total de camarones revisados.
    - camaronesInfectados: Total de camarones infectados.

    Retorna:
    - Porcentaje de infeccion con dos decimales.
    - null cuando no existen datos suficientes o validos.
    */

    if (
        isEmpty(camaronesMuestreados) ||
        isEmpty(camaronesInfectados)
    ) {
        return null;
    }

    if (
        !isNumeroMayorCero(
            camaronesMuestreados
        )
    ) {
        return null;
    }

    if (
        !isNumeroMayorIgualCero(
            camaronesInfectados
        )
    ) {
        return null;
    }

    if (
        !isInfectadosValido(
            camaronesMuestreados,
            camaronesInfectados
        )
    ) {
        return null;
    }

    const muestreados =
        Number(
            camaronesMuestreados
        );

    const infectados =
        Number(
            camaronesInfectados
        );

    const porcentaje =
        (
            infectados /
            muestreados
        ) * 100;

    return Number(
        porcentaje.toFixed(
            2
        )
    );
}

export function calcularGradoInfeccion(
    porcentajeInfeccion
) {
    /*
    Descripcion:
    Calcula el grado de infeccion segun el porcentaje.

    Parametros:
    - porcentajeInfeccion: Porcentaje calculado.

    Retorna:
    - bajo, medio o alto.
    - null cuando no existe porcentaje calculado.
    */

    if (
        isEmpty(
            porcentajeInfeccion
        )
    ) {
        return null;
    }

    const porcentaje =
        Number(
            porcentajeInfeccion
        );

    if (
        Number.isNaN(
            porcentaje
        )
    ) {
        return null;
    }

    if (
        porcentaje < 0 ||
        porcentaje > 100
    ) {
        return null;
    }

    if (porcentaje >= 60) {
        return GradoInfeccion.ALTO;
    }

    if (porcentaje >= 30) {
        return GradoInfeccion.MEDIO;
    }

    return GradoInfeccion.BAJO;
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

export function construirResumenParasitologias(
    registros
) {
    /*
    Descripcion:
    Construye un resumen general de los registros de
    parasitologias.

    Los registros que no poseen datos de muestreo no se
    utilizan para calcular el promedio de infeccion.

    Parametros:
    - registros: Lista de registros de parasitologias.

    Retorna:
    - Objeto con totales, promedio y frecuencias.
    */

    const resumen = {
        totalRegistros:
            registros.length,
        totalCamaronesMuestreados:
            0,
        totalCamaronesInfectados:
            0,
        promedioInfeccion:
            null,
        gradosFrecuentes:
            [],
        parasitosFrecuentes:
            []
    };

    const contadorGrados = {};
    const contadorParasitos = {};

    let sumaPorcentajeInfeccion =
        0;

    let registrosConPorcentaje =
        0;

    for (
        let i = 0;
        i < registros.length;
        i++
    ) {
        const registro =
            registros[i];

        if (
            !isEmpty(
                registro.camaronesMuestreados
            )
        ) {
            const muestreados =
                Number(
                    registro.camaronesMuestreados
                );

            if (
                Number.isNaN(
                    muestreados
                ) === false
            ) {
                resumen.totalCamaronesMuestreados =
                    resumen.totalCamaronesMuestreados +
                    muestreados;
            }
        }

        if (
            !isEmpty(
                registro.camaronesInfectados
            )
        ) {
            const infectados =
                Number(
                    registro.camaronesInfectados
                );

            if (
                Number.isNaN(
                    infectados
                ) === false
            ) {
                resumen.totalCamaronesInfectados =
                    resumen.totalCamaronesInfectados +
                    infectados;
            }
        }

        if (
            !isEmpty(
                registro.porcentajeInfeccion
            )
        ) {
            const porcentaje =
                Number(
                    registro.porcentajeInfeccion
                );

            if (
                Number.isNaN(
                    porcentaje
                ) === false
            ) {
                sumaPorcentajeInfeccion =
                    sumaPorcentajeInfeccion +
                    porcentaje;

                registrosConPorcentaje =
                    registrosConPorcentaje +
                    1;
            }
        }

        contarValor(
            contadorGrados,
            registro.gradoInfeccion
        );

        contarValor(
            contadorParasitos,
            registro.parasito
        );
    }

    if (
        registrosConPorcentaje > 0
    ) {
        const promedio =
            sumaPorcentajeInfeccion /
            registrosConPorcentaje;

        resumen.promedioInfeccion =
            Number(
                promedio.toFixed(
                    2
                )
            );
    }

    resumen.gradosFrecuentes =
        construirListaContador(
            contadorGrados
        );

    resumen.parasitosFrecuentes =
        construirListaContador(
            contadorParasitos
        );

    return resumen;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones auxiliares utilizadas para validar fechas
y construir resumenes.
*/

/*
Descripcion:
Obtiene las partes numericas de una fecha y valida que
corresponda a una fecha real del calendario.

Parametros:
- fecha: Fecha en formato yyyy-mm-dd o dd/mm/aaaa.

Retorna:
- Objeto con anio, mes y dia.
- null si la fecha no es valida.
*/

function obtenerPartesFecha(fecha) {
    if (isEmpty(fecha)) {
        return null;
    }

    const fechaTexto =
        String(
            fecha
        ).trim();

    const patronIso =
        /^\d{4}-\d{2}-\d{2}$/;

    const patronLocal =
        /^\d{2}\/\d{2}\/\d{4}$/;

    let anio;
    let mes;
    let dia;

    if (
        patronIso.test(
            fechaTexto
        )
    ) {
        const partes =
            fechaTexto.split(
                "-"
            );

        anio =
            Number(
                partes[0]
            );

        mes =
            Number(
                partes[1]
            );

        dia =
            Number(
                partes[2]
            );
    } else if (
        patronLocal.test(
            fechaTexto
        )
    ) {
        const partes =
            fechaTexto.split(
                "/"
            );

        dia =
            Number(
                partes[0]
            );

        mes =
            Number(
                partes[1]
            );

        anio =
            Number(
                partes[2]
            );
    } else {
        return null;
    }

    const fechaValidar =
        new Date(
            anio,
            mes - 1,
            dia
        );

    if (
        fechaValidar.getFullYear() !== anio ||
        fechaValidar.getMonth() !== mes - 1 ||
        fechaValidar.getDate() !== dia
    ) {
        return null;
    }

    return {
        anio,
        mes,
        dia
    };
}

function contarValor(
    contador,
    valor
) {
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

    if (
        contador[valor] ===
        undefined
    ) {
        contador[valor] = 0;
    }

    contador[valor] =
        contador[valor] + 1;
}

function construirListaContador(
    contador
) {
    /*
    Descripcion:
    Convierte un objeto contador en una lista ordenada.

    Parametros:
    - contador: Objeto con valores y cantidades.

    Retorna:
    - Lista de objetos con valor y cantidad.
    */

    const lista = [];

    const claves =
        Object.keys(
            contador
        );

    for (
        let i = 0;
        i < claves.length;
        i++
    ) {
        const clave =
            claves[i];

        lista.push({
            valor:
                clave,
            cantidad:
                contador[clave]
        });
    }

    lista.sort(
        function (a, b) {
            return (
                b.cantidad -
                a.cantidad
            );
        }
    );

    return lista;
}