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

Ademas de las validaciones, este archivo es ahora el UNICO lugar
donde viven las formulas del muestreo con atarraya. El controller,
el DTO y el model las consumen desde aqui: nadie recalcula por su
cuenta y nadie acepta un valor calculado que venga del cliente.

Formulas (documento de requerimientos):

  Area muestreada  = cantidad de tiros x area de la atarraya (m2)
  Promedio por tiro= total de camarones / cantidad de tiros
  Densidad por m2  = total de camarones / area muestreada
  Poblacion total  = densidad por m2 x (hectareas del estanque x 10 000)
  Sobrevivencia (%)= (poblacion total / poblacion sembrada) x 100
                     donde poblacion sembrada = cantidadSiembra (larvas
                     por m2) x (hectareas del estanque x 10 000)

La sobrevivencia dejo de ser un campo que el usuario digita: se
deriva de la poblacion estimada del conteo actual contra la
poblacion que se sembro originalmente en el estanque. Es un dato
calculado y el backend lo recalcula al guardar.

Ejemplo del documento (estanque de 2 ha, atarraya de 2,5 m2):
  10 tiros por hectarea            -> 2 ha x 10  = 20 tiros
  area muestreada                  -> 20 x 2,5   = 50 m2
  total de los 20 tiros            -> 350 camarones
  promedio por tiro                -> 350 / 20   = 17,5
  densidad por m2                  -> 350 / 50   = 7 camarones/m2
  poblacion total                  -> 7 x 20 000 = 140 000 camarones

OJO con las unidades: areaEstanque se maneja en HECTAREAS (por eso
se multiplica por 10 000) y areaAtarraya en METROS CUADRADOS. La
pantalla lo dice explicito en las etiquetas.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Valores de referencia del documento de requerimientos.
*/

// Tiros de atarraya recomendados por hectarea de estanque.
export const TIROS_POR_HECTAREA = 10;

// Area que cubre aproximadamente cada tiro de atarraya, en m2.
export const AREA_ATARRAYA_DEFECTO = 2.5;

// Metros cuadrados que tiene una hectarea.
export const M2_POR_HECTAREA = 10000;

// Tope de tiros aceptado en un mismo registro. Coincide con el
// MAX_TIROS del formulario (useDatosConteo.js) para que la app y
// el backend rechacen exactamente lo mismo.
export const MAX_TIROS = 20;

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

/*
//////////////////////////////////////////////////////////
TIROS DE ATARRAYA
//////////////////////////////////////////////////////////

El conteo se registra tiro por tiro, que es como se hace en campo:
se lanza la atarraya, se cuentan los camarones de ese tiro y se
anota. El arreglo de tiros es la UNICA fuente de verdad; de ahi
salen la cantidad de tiros y el total de camarones de la muestra.

Antes el cliente mandaba "tirosAtarraya" y "numeroCamarones" como
dos campos sueltos que podian contradecirse entre si (por ejemplo
20 tiros con un total que no correspondia a ningun conteo real).
Ahora el backend los deriva del detalle y guarda ese detalle en
densidad_detalle_tiros.
*/

export function normalizarTiros(body) {
    /*
    Descripcion:
    Extrae y normaliza el detalle de tiros recibido en el body.
    Acepta dos formatos, para no atarse a una sola forma de envio:

    - Arreglo plano de cantidades:
        "tiros": [20, 15, 30]
    - Arreglo de objetos con numero de tiro explicito:
        "tiros": [{ "numeroTiro": 1, "cantidadCamarones": 20 }, ...]

    Tambien acepta el alias "detalleTiros".

    El numero de tiro NO se toma del cliente aunque venga: se
    reasigna por posicion (1, 2, 3...). Asi se garantiza que la
    llave unica (densidad_id, numero_tiro) nunca choque por un
    cliente que mande numeros repetidos o salteados.

    Parametros:
    - body: Campos recibidos en el body de la peticion.

    Retorna:
    - Arreglo [{ numeroTiro, cantidadCamarones }] ya normalizado.
    - null si el body no trae tiros (permite distinguir "no vino"
      de "vino vacio", que se resuelve en validarTiros).
    */

    const recibidos = body?.tiros !== undefined ? body.tiros : body?.detalleTiros;

    if (recibidos === undefined || recibidos === null) {
        return null;
    }

    if (!Array.isArray(recibidos)) {
        return [];
    }

    return recibidos.map((tiro, indice) => {
        const cantidad = (tiro !== null && typeof tiro === "object")
            ? (tiro.cantidadCamarones !== undefined ? tiro.cantidadCamarones : tiro.cantidad)
            : tiro;

        return {
            numeroTiro: indice + 1,
            cantidadCamarones: cantidad
        };
    });
}

export function validarTiros(tiros) {
    /*
    Descripcion:
    Valida el detalle de tiros ya normalizado.

    Se exige al menos un tiro: un conteo sin ningun tiro no tiene
    nada que sumar y produciria una densidad de 0 que no significa
    nada. Cada tiro debe traer una cantidad entera mayor o igual a
    cero (un tiro puede salir vacio, pero no puede quedar en
    blanco: eso bajaria el total sin que nadie se entere).

    Parametros:
    - tiros: Arreglo devuelto por normalizarTiros (puede ser null).

    Retorna:
    - Arreglo de mensajes de error. Vacio si el detalle es valido.
    */

    const errores = [];

    if (tiros === null) {
        errores.push("El campo tiros es requerido: debe enviarse el detalle de camarones por tiro.");
        return errores;
    }

    if (!Array.isArray(tiros) || tiros.length === 0) {
        errores.push("El campo tiros debe ser una lista con al menos un tiro.");
        return errores;
    }

    if (tiros.length > MAX_TIROS) {
        errores.push("El campo tiros no puede tener mas de " + MAX_TIROS + " tiros por registro.");
        return errores;
    }

    for (let i = 0; i < tiros.length; i++) {
        const cantidad = tiros[i].cantidadCamarones;

        if (isEmpty(cantidad)) {
            errores.push("Falta la cantidad de camarones del tiro " + (i + 1) + ".");
            continue;
        }

        const numero = Number(cantidad);

        if (Number.isNaN(numero) || numero < 0) {
            errores.push("La cantidad de camarones del tiro " + (i + 1) + " debe ser numerica y mayor o igual que cero.");
            continue;
        }

        if (!Number.isInteger(numero)) {
            errores.push("La cantidad de camarones del tiro " + (i + 1) + " debe ser un numero entero.");
        }
    }

    return errores;
}

/*
//////////////////////////////////////////////////////////
FORMULAS DEL MUESTREO
//////////////////////////////////////////////////////////

Todas reciben y devuelven numeros. Devuelven null cuando falta un
dato o cuando el calculo daria una division por cero, para que el
model guarde NULL en vez de un 0 o un Infinity que se leeria como
un resultado real.
*/

export function calcularTotalCamarones(tiros) {
    /*
    Descripcion:
    Suma los camarones de todos los tiros. Es el
    "total_camarones_muestra" que se guarda en la base.

    Parametros:
    - tiros: Arreglo [{ numeroTiro, cantidadCamarones }].

    Retorna:
    - Total de camarones de la muestra.
    */

    if (!Array.isArray(tiros)) {
        return 0;
    }

    let total = 0;

    for (let i = 0; i < tiros.length; i++) {
        const numero = Number(tiros[i].cantidadCamarones);

        if (!Number.isNaN(numero)) {
            total = total + numero;
        }
    }

    return total;
}

export function calcularAreaMuestreada(tirosAtarraya, areaAtarraya) {
    /*
    Descripcion:
    Area total muestreada = cantidad de tiros x area de la atarraya.

    Ejemplo del documento: 20 tiros x 2,5 m2 = 50 m2.

    Parametros:
    - tirosAtarraya: Cantidad de tiros realizados.
    - areaAtarraya: Area que cubre cada tiro, en m2.

    Retorna:
    - Area muestreada en m2, o null si falta algun dato.
    */

    const tiros = Number(tirosAtarraya);
    const area = Number(areaAtarraya);

    if (!Number.isFinite(tiros) || !Number.isFinite(area)) {
        return null;
    }

    if (tiros <= 0 || area <= 0) {
        return null;
    }

    return redondear(tiros * area);
}

export function calcularPromedioPorTiro(totalCamarones, tirosAtarraya) {
    /*
    Descripcion:
    Promedio de camarones por tiro = total / cantidad de tiros.

    Ejemplo del documento: 350 / 20 = 17,5.

    Parametros:
    - totalCamarones: Total de camarones de la muestra.
    - tirosAtarraya: Cantidad de tiros realizados.

    Retorna:
    - Promedio por tiro, o null si no hay tiros.
    */

    const total = Number(totalCamarones);
    const tiros = Number(tirosAtarraya);

    if (!Number.isFinite(total) || !Number.isFinite(tiros) || tiros <= 0) {
        return null;
    }

    return redondear(total / tiros);
}

export function calcularDensidadPorM2(totalCamarones, areaMuestreada) {
    /*
    Descripcion:
    Densidad por m2 = total de camarones / area muestreada.

    Ejemplo del documento: 350 / 50 = 7 camarones por m2.

    Parametros:
    - totalCamarones: Total de camarones de la muestra.
    - areaMuestreada: Area muestreada en m2.

    Retorna:
    - Densidad en camarones por m2, o null si no hay area.
    */

    const total = Number(totalCamarones);
    const area = Number(areaMuestreada);

    if (!Number.isFinite(total) || !Number.isFinite(area) || area <= 0) {
        return null;
    }

    return redondear(total / area);
}

export function calcularPoblacionEstimada(densidadPorM2, areaEstanqueHectareas) {
    /*
    Descripcion:
    Poblacion total estimada del estanque
    = densidad por m2 x (hectareas x 10 000).

    Ejemplo del documento: 7 x (2 x 10 000) = 140 000 camarones.

    Se redondea a entero porque la columna poblacion_estimada es
    INT: no existen fracciones de camaron.

    Parametros:
    - densidadPorM2: Densidad calculada en camarones por m2.
    - areaEstanqueHectareas: Area del estanque en HECTAREAS.

    Retorna:
    - Poblacion estimada como entero, o null si falta algun dato.
    */

    const densidad = Number(densidadPorM2);
    const hectareas = Number(areaEstanqueHectareas);

    if (!Number.isFinite(densidad) || !Number.isFinite(hectareas)) {
        return null;
    }

    if (densidad <= 0 || hectareas <= 0) {
        return null;
    }

    return Math.round(densidad * hectareas * M2_POR_HECTAREA);
}

export function calcularSobrevivencia(poblacionEstimada, cantidadSiembra, areaEstanqueHectareas) {
    /*
    Descripcion:
    Porcentaje de sobrevivencia = poblacion estimada actual /
    poblacion sembrada originalmente, expresado en porcentaje.

    La poblacion sembrada se reconstruye con el mismo criterio que
    la poblacion estimada: cantidadSiembra son larvas por m2, asi
    que se multiplica por el area del estanque en m2 (hectareas x
    10 000) para obtener el total de larvas sembradas.

    Se acota a un maximo de 100: una sobrevivencia mayor a la
    siembra original no es un dato de campo valido (indicaria una
    cantidad de siembra mal capturada), y dejar pasar 130% o 500%
    confundiria mas de lo que informa.

    Parametros:
    - poblacionEstimada: Poblacion total estimada del conteo actual.
    - cantidadSiembra: Larvas sembradas por m2 (de la siembra del estanque).
    - areaEstanqueHectareas: Area del estanque en HECTAREAS.

    Retorna:
    - Porcentaje de sobrevivencia (0-100), o null si falta algun dato.
    */

    const poblacion = Number(poblacionEstimada);
    const siembraPorM2 = Number(cantidadSiembra);
    const hectareas = Number(areaEstanqueHectareas);

    if (!Number.isFinite(poblacion) || !Number.isFinite(siembraPorM2) || !Number.isFinite(hectareas)) {
        return null;
    }

    if (poblacion <= 0 || siembraPorM2 <= 0 || hectareas <= 0) {
        return null;
    }

    const poblacionSembrada = siembraPorM2 * hectareas * M2_POR_HECTAREA;

    if (poblacionSembrada <= 0) {
        return null;
    }

    const porcentaje = redondear((poblacion / poblacionSembrada) * 100);

    return porcentaje > 100 ? 100 : porcentaje;
}

export function calcularTirosRecomendados(areaEstanqueHectareas) {
    /*
    Descripcion:
    Cantidad de tiros sugerida segun el documento: 10 tiros por
    hectarea. Se usa para precargar el formulario cuando el usuario
    elige un estanque; el usuario puede cambiarla.

    Se acota al maximo permitido por registro (MAX_TIROS), porque
    la app no acepta mas que eso en una sola captura.

    Parametros:
    - areaEstanqueHectareas: Area del estanque en HECTAREAS.

    Retorna:
    - Cantidad de tiros recomendada, o null si no hay area.
    */

    const hectareas = Number(areaEstanqueHectareas);

    if (!Number.isFinite(hectareas) || hectareas <= 0) {
        return null;
    }

    const recomendados = Math.round(hectareas * TIROS_POR_HECTAREA);

    if (recomendados < 1) {
        return 1;
    }

    if (recomendados > MAX_TIROS) {
        return MAX_TIROS;
    }

    return recomendados;
}

export function calcularResultados(datos) {
    /*
    Descripcion:
    Calcula de una sola pasada todos los valores derivados de un
    registro de densidad poblacional. Es el punto de entrada que
    usan el DTO y el model: asi el orden de las formulas (el area
    muestreada alimenta la densidad, y la densidad alimenta la
    poblacion) queda definido en un solo lugar.

    Parametros:
    - datos: Objeto con
        - tiros: Arreglo [{ numeroTiro, cantidadCamarones }].
        - areaAtarraya: Area de la atarraya en m2.
        - areaEstanque: Area del estanque en HECTAREAS.
        - cantidadSiembra: Larvas sembradas por m2 (para la sobrevivencia).

    Retorna:
    - Objeto con tirosAtarraya, totalCamaronesMuestra,
      areaMuestreada, promedioPorTiro, densidad, poblacionEstimada
      y sobrevivencia.
    */

    const tiros = Array.isArray(datos?.tiros) ? datos.tiros : [];

    const tirosAtarraya = tiros.length;
    const totalCamaronesMuestra = calcularTotalCamarones(tiros);
    const areaMuestreada = calcularAreaMuestreada(tirosAtarraya, datos?.areaAtarraya);
    const promedioPorTiro = calcularPromedioPorTiro(totalCamaronesMuestra, tirosAtarraya);
    const densidad = calcularDensidadPorM2(totalCamaronesMuestra, areaMuestreada);
    const poblacionEstimada = calcularPoblacionEstimada(densidad, datos?.areaEstanque);
    const sobrevivencia = calcularSobrevivencia(poblacionEstimada, datos?.cantidadSiembra, datos?.areaEstanque);

    return {
        tirosAtarraya,
        totalCamaronesMuestra,
        areaMuestreada,
        promedioPorTiro,
        densidad,
        poblacionEstimada,
        sobrevivencia
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function redondear(valor) {
    /*
    Descripcion:
    Redondea a 2 decimales, que es la precision de las columnas
    DECIMAL(10,2) donde se guardan estos valores. Se redondea aqui
    y no se deja al motor de MySQL para que la respuesta del API
    devuelva exactamente el mismo numero que quedo almacenado.

    Parametros:
    - valor: Numero a redondear.

    Retorna:
    - Numero con 2 decimales.
    */

    return Math.round(valor * 100) / 100;
}