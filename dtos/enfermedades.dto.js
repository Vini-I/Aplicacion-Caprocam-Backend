/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.dto.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
DTO encargado de transformar datos de entrada y salida del
modulo de enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene funciones exportables para limpiar entrada y salida.
*/

export function crearEnfermedadDTO(body) {
    /*
    Descripcion:
    Transforma los datos recibidos para crear una enfermedad.

    Parametros:
    - body: Cuerpo de la peticion

    Retorna:
    - Objeto limpio para el service
    */

    return construirEntrada(body);
}

export function actualizarEnfermedadDTO(body) {
    /*
    Descripcion:
    Transforma los datos recibidos para actualizar enfermedad.

    Parametros:
    - body: Cuerpo de la peticion

    Retorna:
    - Objeto limpio para el service
    */

    return construirEntrada(body);
}

export function enfermedadSalidaDTO(registro) {
    /*
    Descripcion:
    Transforma un registro para respuesta al cliente.

    Parametros:
    - registro: Registro desde model

    Retorna:
    - Objeto seguro de salida
    */

    return {
        id: registro.id,
        tipoRegistro: registro.tipoRegistro,
        finca: registro.finca,
        fincaNombre: registro.fincaNombre,
        estanque: registro.estanque,
        fechaReporte: registro.fechaReporte,
        responsable: registro.responsable,
        enfermedades: registro.enfermedades,
        severidad: registro.severidad,
        severidadNombre: registro.severidadNombre,
        mortalidad: registro.mortalidad,
        reporte: registro.reporte,
        activo: registro.activo,
        fechaCreacion: registro.fechaCreacion,
        fechaActualizacion: registro.fechaActualizacion,
        fechaEliminacion: registro.fechaEliminacion
    };
}

export function listaEnfermedadesSalidaDTO(registros) {
    /*
    Descripcion:
    Transforma una lista de registros para respuesta.

    Parametros:
    - registros: Lista desde model

    Retorna:
    - Lista de objetos seguros
    */

    const lista = [];

    for (let i = 0; i < registros.length; i++) {
        lista.push(enfermedadSalidaDTO(registros[i]));
    }

    return lista;
}

export function resumenEnfermedadesDTO(resumen) {
    /*
    Descripcion:
    Transforma el resumen de enfermedades para respuesta.

    Parametros:
    - resumen: Resumen construido por service

    Retorna:
    - Objeto de resumen
    */

    return {
        totalCasos: resumen.totalCasos,
        totalMortalidad: resumen.totalMortalidad,
        enfermedadesFrecuentes: resumen.enfermedadesFrecuentes,
        severidadesFrecuentes: resumen.severidadesFrecuentes
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas de normalizacion.
*/

// crearEnfermedadDTO() y actualizarEnfermedadDTO() dependen de esta funcion
function construirEntrada(body) {
    /*
    Descripcion:
    Construye el objeto normalizado de entrada.

    Parametros:
    - body: Cuerpo de la peticion

    Retorna:
    - Objeto normalizado
    */

    return {
        finca: normalizarTexto(body.finca),
        fincaNombre: normalizarTextoOpcional(body.fincaNombre),
        estanque: normalizarTexto(body.estanque),
        fechaReporte: normalizarTexto(body.fechaReporte),
        responsable: normalizarTextoOpcional(body.responsable),
        enfermedades: normalizarLista(body.enfermedades),
        severidad: normalizarTexto(body.severidad),
        mortalidad: normalizarNumero(body.mortalidad),
        reporte: normalizarTexto(body.reporte)
    };
}

// construirEntrada() depende de esta funcion
function normalizarTexto(valor) {
    /*
    Descripcion:
    Convierte valor a texto limpio.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Texto limpio
    */

    if (valor === undefined) {
        return "";
    }

    if (valor === null) {
        return "";
    }

    return String(valor).trim();
}

// construirEntrada() depende de esta funcion
function normalizarTextoOpcional(valor) {
    /*
    Descripcion:
    Convierte valor opcional a texto limpio.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Texto limpio o vacio
    */

    if (valor === undefined) {
        return "";
    }

    if (valor === null) {
        return "";
    }

    return String(valor).trim();
}

// construirEntrada() depende de esta funcion
function normalizarNumero(valor) {
    /*
    Descripcion:
    Convierte valor a numero.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Numero normalizado
    */

    const numero = Number(valor);

    if (Number.isNaN(numero) === true) {
        return 0;
    }

    return numero;
}

// construirEntrada() depende de esta funcion
function normalizarLista(valor) {
    /*
    Descripcion:
    Convierte valor recibido a lista.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - Lista normalizada
    */

    if (valor === undefined) {
        return [];
    }

    if (valor === null) {
        return [];
    }

    if (Array.isArray(valor) === true) {
        return normalizarArreglo(valor);
    }

    if (typeof valor === "string") {
        return normalizarTextoSeparadoPorComas(valor);
    }

    return [];
}

// normalizarLista() depende de esta funcion
function normalizarArreglo(valores) {
    /*
    Descripcion:
    Limpia un arreglo de textos.

    Parametros:
    - valores: Arreglo recibido

    Retorna:
    - Lista limpia
    */

    const lista = [];

    for (let i = 0; i < valores.length; i++) {
        const texto = normalizarTexto(valores[i]);

        if (texto !== "") {
            lista.push(texto);
        }
    }

    return lista;
}

// normalizarLista() depende de esta funcion
function normalizarTextoSeparadoPorComas(valor) {
    /*
    Descripcion:
    Convierte texto separado por comas a lista.

    Parametros:
    - valor: Texto recibido

    Retorna:
    - Lista limpia
    */

    const partes = valor.split(",");
    const lista = [];

    for (let i = 0; i < partes.length; i++) {
        const texto = normalizarTexto(partes[i]);

        if (texto !== "") {
            lista.push(texto);
        }
    }

    return lista;
}
