/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.dto.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Archivo de transferencia de datos para parasitologias.
Transforma, normaliza y prepara los datos de entrada y salida.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que transforman los datos
recibidos y los datos enviados al cliente.
*/

export function crearParasitologiaEntradaDTO(body) {
    /*
    Descripcion:
    Normaliza el body recibido antes de crear un registro
    de parasitologia.

    Parametros:
    - body: Datos recibidos en el request body

    Retorna:
    - Objeto normalizado para crear una parasitologia
    */
    return construirParasitologiaEntrada(body);
}

export function actualizarParasitologiaEntradaDTO(body) {
    /*
    Descripcion:
    Normaliza el body recibido antes de actualizar un registro
    de parasitologia.

    Parametros:
    - body: Datos recibidos en el request body

    Retorna:
    - Objeto normalizado para actualizar una parasitologia
    */
    return construirParasitologiaEntrada(body);
}

export function parasitologiaSalidaDTO(registro) {
    /*
    Descripcion:
    Construye el objeto de salida que se enviara al cliente
    para un solo registro de parasitologia.

    Parametros:
    - registro: Registro obtenido desde el modelo

    Retorna:
    - Objeto con los datos visibles para la respuesta JSON
    */
    return {
        id: registro.id,
        tipoRegistro: registro.tipoRegistro,
        finca: registro.finca,
        fincaNombre: registro.fincaNombre,
        estanque: registro.estanque,
        fechaReporte: registro.fechaReporte,
        responsable: registro.responsable,
        parasito: registro.parasito,
        parasitoNombre: registro.parasitoNombre,
        camaronesMuestreados: registro.camaronesMuestreados,
        camaronesInfectados: registro.camaronesInfectados,
        porcentajeInfeccion: registro.porcentajeInfeccion,
        gradoInfeccion: registro.gradoInfeccion,
        gradoInfeccionNombre: registro.gradoInfeccionNombre,
        observaciones: registro.observaciones,
        activo: registro.activo,
        fechaCreacion: registro.fechaCreacion,
        fechaActualizacion: registro.fechaActualizacion,
        fechaEliminacion: registro.fechaEliminacion
    };
}

export function listaParasitologiasSalidaDTO(registros) {
    /*
    Descripcion:
    Convierte una lista de registros internos en una lista
    preparada para la respuesta JSON.

    Parametros:
    - registros: Arreglo de registros de parasitologias

    Retorna:
    - Arreglo de registros transformados con parasitologiaSalidaDTO()
    */
    const lista = [];

    for (let i = 0; i < registros.length; i++) {
        lista.push(parasitologiaSalidaDTO(registros[i]));
    }

    return lista;
}

export function resumenParasitologiasDTO(resumen) {
    /*
    Descripcion:
    Construye el objeto de salida para el resumen general
    del modulo de parasitologias.

    Parametros:
    - resumen: Datos calculados por el servicio

    Retorna:
    - Objeto con totales, promedio y frecuencias
    */
    return {
        totalRegistros: resumen.totalRegistros,
        totalCamaronesMuestreados: resumen.totalCamaronesMuestreados,
        totalCamaronesInfectados: resumen.totalCamaronesInfectados,
        promedioInfeccion: resumen.promedioInfeccion,
        gradosFrecuentes: resumen.gradosFrecuentes,
        parasitosFrecuentes: resumen.parasitosFrecuentes
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas para normalizar texto y numeros
antes de enviarlos al servicio.
*/

function construirParasitologiaEntrada(body) {
    /*
    Descripcion:
    Construye un objeto limpio con los campos permitidos
    para crear o actualizar una parasitologia.

    Parametros:
    - body: Datos recibidos desde el cliente

    Retorna:
    - Objeto con campos normalizados
    */
    const datos = body || {};

    return {
        finca: normalizarTexto(datos.finca),
        fincaNombre: normalizarTextoOpcional(datos.fincaNombre),
        estanque: normalizarTexto(datos.estanque),
        fechaReporte: normalizarTexto(datos.fechaReporte),
        responsable: normalizarTextoOpcional(datos.responsable),
        parasito: normalizarTexto(datos.parasito),
        camaronesMuestreados: normalizarNumero(datos.camaronesMuestreados),
        camaronesInfectados: normalizarNumero(datos.camaronesInfectados),
        observaciones: normalizarTextoOpcional(datos.observaciones)
    };
}

function normalizarTexto(valor) {
    /*
    Descripcion:
    Convierte un valor obligatorio a texto limpio.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Texto sin espacios al inicio ni al final
    */
    if (valor === undefined) {
        return "";
    }

    if (valor === null) {
        return "";
    }

    return String(valor).trim();
}

function normalizarTextoOpcional(valor) {
    /*
    Descripcion:
    Convierte un valor opcional a texto limpio.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Texto limpio o cadena vacia si no se envio
    */
    if (valor === undefined) {
        return "";
    }

    if (valor === null) {
        return "";
    }

    return String(valor).trim();
}

function normalizarNumero(valor) {
    /*
    Descripcion:
    Convierte un valor recibido a numero.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Numero convertido o 0 si no es numerico
    */
    const numero = Number(valor);

    if (Number.isNaN(numero) === true) {
        return 0;
    }

    return numero;
}