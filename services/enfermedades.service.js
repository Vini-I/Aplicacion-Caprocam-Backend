/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.service.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Servicio encargado de manejar la logica de negocio del
modulo de enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Modelos
import enfermedadesModel from "../models/enfermedades.model.js";

// DTOs
import {
    enfermedadSalidaDTO,
    listaEnfermedadesSalidaDTO,
    resumenEnfermedadesDTO
} from "../dtos/enfermedades.dto.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Catalogos locales del modulo.
*/

const ENFERMEDADES_CATALOGO = [
    {
        label: "WSSV - Mancha Blanca",
        value: "wssv",
        tipo: "viral"
    },
    {
        label: "AHPND - Necrosis hepatopancreatica aguda",
        value: "ahpnd",
        tipo: "bacteriana"
    },
    {
        label: "Vibriosis",
        value: "vibriosis",
        tipo: "bacteriana"
    },
    {
        label: "IHHNV",
        value: "ihhnv",
        tipo: "viral"
    },
    {
        label: "NHP - Hepatobacter penaei",
        value: "nhp",
        tipo: "bacteriana"
    },
    {
        label: "Otro",
        value: "otro",
        tipo: "otro"
    }
];

const SEVERIDADES_CATALOGO = [
    {
        label: "Baja",
        value: "baja"
    },
    {
        label: "Media",
        value: "media"
    },
    {
        label: "Alta",
        value: "alta"
    },
    {
        label: "Critica",
        value: "critica"
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

async function obtenerEnfermedades(filtros) {
    /*
    Descripcion:
    Obtiene enfermedades desde el model con filtros opcionales.

    Parametros:
    - filtros: Filtros de busqueda

    Retorna:
    - Lista transformada por DTO
    */

    const registros = await enfermedadesModel.obtenerEnfermedades(filtros);

    return listaEnfermedadesSalidaDTO(registros);
}

async function obtenerEnfermedadPorId(id) {
    /*
    Descripcion:
    Obtiene un registro por id y valida existencia.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro transformado por DTO
    */

    const registro = await enfermedadesModel.obtenerEnfermedadPorId(id);

    if (registro === null) {
        throw crearError("Registro de enfermedad no encontrado", 404);
    }

    return enfermedadSalidaDTO(registro);
}

async function crearEnfermedad(datos) {
    /*
    Descripcion:
    Crea un registro de enfermedad validando catalogos.

    Parametros:
    - datos: Datos normalizados

    Retorna:
    - Registro creado
    */

    validarEnfermedades(datos.enfermedades);
    validarSeveridad(datos.severidad);

    const datosCreacion = {
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        enfermedades: datos.enfermedades,
        severidad: datos.severidad,
        severidadNombre: obtenerNombreSeveridad(datos.severidad),
        mortalidad: datos.mortalidad,
        reporte: datos.reporte
    };

    const registro = await enfermedadesModel.crearEnfermedad(datosCreacion);

    return enfermedadSalidaDTO(registro);
}

async function actualizarEnfermedad(id, datos) {
    /*
    Descripcion:
    Actualiza un registro completo de enfermedad.

    Parametros:
    - id: Identificador del registro
    - datos: Datos normalizados

    Retorna:
    - Registro actualizado
    */

    const existente = await enfermedadesModel.obtenerEnfermedadPorId(id);

    if (existente === null) {
        throw crearError("Registro de enfermedad no encontrado", 404);
    }

    validarEnfermedades(datos.enfermedades);
    validarSeveridad(datos.severidad);

    const datosActualizacion = {
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        enfermedades: datos.enfermedades,
        severidad: datos.severidad,
        severidadNombre: obtenerNombreSeveridad(datos.severidad),
        mortalidad: datos.mortalidad,
        reporte: datos.reporte
    };

    const registro = await enfermedadesModel.actualizarEnfermedad(
        id,
        datosActualizacion
    );

    return enfermedadSalidaDTO(registro);
}

async function eliminarEnfermedad(id) {
    /*
    Descripcion:
    Realiza borrado logico de un registro.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro eliminado logicamente
    */

    const existente = await enfermedadesModel.obtenerEnfermedadPorId(id);

    if (existente === null) {
        throw crearError("Registro de enfermedad no encontrado", 404);
    }

    const registro = await enfermedadesModel.eliminarEnfermedad(id);

    return enfermedadSalidaDTO(registro);
}

async function limpiarEnfermedades() {
    /*
    Descripcion:
    Limpia los datos mock locales.
    Solo debe usarse para pruebas.

    Parametros:
    No posee

    Retorna:
    - Lista vacia
    */

    const registros = await enfermedadesModel.limpiarEnfermedades();

    return listaEnfermedadesSalidaDTO(registros);
}

async function obtenerResumenEnfermedades(filtros) {
    /*
    Descripcion:
    Construye un resumen sanitario con datos mock activos.

    Parametros:
    - filtros: Filtros opcionales

    Retorna:
    - Resumen de enfermedades
    */

    const registros = await enfermedadesModel.obtenerEnfermedades(filtros);
    const resumen = construirResumen(registros);

    return resumenEnfermedadesDTO(resumen);
}

function obtenerCatalogoEnfermedades() {
    /*
    Descripcion:
    Devuelve catalogo local de enfermedades.

    Parametros:
    No posee

    Retorna:
    - Catalogo de enfermedades
    */

    return ENFERMEDADES_CATALOGO;
}

function obtenerCatalogoSeveridades() {
    /*
    Descripcion:
    Devuelve catalogo local de severidades.

    Parametros:
    No posee

    Retorna:
    - Catalogo de severidades
    */

    return SEVERIDADES_CATALOGO;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

// crearEnfermedad() y actualizarEnfermedad() dependen de esta funcion
function validarEnfermedades(enfermedades) {
    /*
    Descripcion:
    Valida que las enfermedades existan en catalogo.

    Parametros:
    - enfermedades: Lista recibida

    Retorna:
    No retorna
    */

    if (Array.isArray(enfermedades) === false) {
        throw crearError("El campo enfermedades debe ser una lista", 400);
    }

    if (enfermedades.length === 0) {
        throw crearError("Debe seleccionar al menos una enfermedad", 400);
    }

    for (let i = 0; i < enfermedades.length; i++) {
        if (existeEnfermedad(enfermedades[i]) === false) {
            throw crearError(
                "La enfermedad " + enfermedades[i] + " no es valida",
                400
            );
        }
    }
}

// crearEnfermedad() y actualizarEnfermedad() dependen de esta funcion
function validarSeveridad(severidad) {
    /*
    Descripcion:
    Valida que la severidad exista en catalogo.

    Parametros:
    - severidad: Severidad recibida

    Retorna:
    No retorna
    */

    if (existeSeveridad(severidad) === false) {
        throw crearError("La severidad no es valida", 400);
    }
}

// validarEnfermedades() depende de esta funcion
function existeEnfermedad(valor) {
    /*
    Descripcion:
    Revisa si una enfermedad existe en catalogo.

    Parametros:
    - valor: Valor de enfermedad

    Retorna:
    - true o false
    */

    for (let i = 0; i < ENFERMEDADES_CATALOGO.length; i++) {
        if (ENFERMEDADES_CATALOGO[i].value === valor) {
            return true;
        }
    }

    return false;
}

// validarSeveridad() depende de esta funcion
function existeSeveridad(valor) {
    /*
    Descripcion:
    Revisa si una severidad existe en catalogo.

    Parametros:
    - valor: Valor de severidad

    Retorna:
    - true o false
    */

    for (let i = 0; i < SEVERIDADES_CATALOGO.length; i++) {
        if (SEVERIDADES_CATALOGO[i].value === valor) {
            return true;
        }
    }

    return false;
}

// crearEnfermedad(), actualizarEnfermedad() y resumen dependen de esta funcion
function obtenerNombreSeveridad(valor) {
    /*
    Descripcion:
    Obtiene label visible de severidad.

    Parametros:
    - valor: Valor de severidad

    Retorna:
    - Nombre visible
    */

    let nombre = valor;

    for (let i = 0; i < SEVERIDADES_CATALOGO.length; i++) {
        if (SEVERIDADES_CATALOGO[i].value === valor) {
            nombre = SEVERIDADES_CATALOGO[i].label;
        }
    }

    return nombre;
}

// construirListaEnfermedades() depende de esta funcion
function obtenerNombreEnfermedad(valor) {
    /*
    Descripcion:
    Obtiene label visible de enfermedad.

    Parametros:
    - valor: Valor de enfermedad

    Retorna:
    - Nombre visible
    */

    let nombre = valor;

    for (let i = 0; i < ENFERMEDADES_CATALOGO.length; i++) {
        if (ENFERMEDADES_CATALOGO[i].value === valor) {
            nombre = ENFERMEDADES_CATALOGO[i].label;
        }
    }

    return nombre;
}

// obtenerResumenEnfermedades() depende de esta funcion
function construirResumen(registros) {
    /*
    Descripcion:
    Construye resumen operativo del modulo.

    Parametros:
    - registros: Lista de registros activos

    Retorna:
    - Resumen construido
    */

    const resumen = {
        totalCasos: registros.length,
        totalMortalidad: 0,
        enfermedadesFrecuentes: [],
        severidadesFrecuentes: []
    };

    const contadorEnfermedades = {};
    const contadorSeveridades = {};

    for (let i = 0; i < registros.length; i++) {
        sumarMortalidad(resumen, registros[i]);
        contarEnfermedades(contadorEnfermedades, registros[i]);
        contarSeveridad(contadorSeveridades, registros[i]);
    }

    resumen.enfermedadesFrecuentes = construirListaEnfermedades(
        contadorEnfermedades
    );

    resumen.severidadesFrecuentes = construirListaSeveridades(
        contadorSeveridades
    );

    return resumen;
}

// construirResumen() depende de esta funcion
function sumarMortalidad(resumen, registro) {
    /*
    Descripcion:
    Suma mortalidad del registro.

    Parametros:
    - resumen: Objeto resumen
    - registro: Registro actual

    Retorna:
    No retorna
    */

    const mortalidad = Number(registro.mortalidad);

    if (Number.isNaN(mortalidad) === false) {
        resumen.totalMortalidad = resumen.totalMortalidad + mortalidad;
    }
}

// construirResumen() depende de esta funcion
function contarEnfermedades(contador, registro) {
    /*
    Descripcion:
    Cuenta apariciones de enfermedades.

    Parametros:
    - contador: Objeto contador
    - registro: Registro actual

    Retorna:
    No retorna
    */

    if (Array.isArray(registro.enfermedades) === false) {
        return;
    }

    for (let i = 0; i < registro.enfermedades.length; i++) {
        const enfermedad = registro.enfermedades[i];

        if (contador[enfermedad] === undefined) {
            contador[enfermedad] = 0;
        }

        contador[enfermedad] = contador[enfermedad] + 1;
    }
}

// construirResumen() depende de esta funcion
function contarSeveridad(contador, registro) {
    /*
    Descripcion:
    Cuenta apariciones de severidades.

    Parametros:
    - contador: Objeto contador
    - registro: Registro actual

    Retorna:
    No retorna
    */

    if (registro.severidad === undefined) {
        return;
    }

    if (registro.severidad === "") {
        return;
    }

    if (contador[registro.severidad] === undefined) {
        contador[registro.severidad] = 0;
    }

    contador[registro.severidad] = contador[registro.severidad] + 1;
}

// construirResumen() depende de esta funcion
function construirListaEnfermedades(contador) {
    /*
    Descripcion:
    Construye lista de enfermedades frecuentes.

    Parametros:
    - contador: Objeto contador

    Retorna:
    - Lista ordenada
    */

    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        lista.push({
            enfermedad: claves[i],
            nombre: obtenerNombreEnfermedad(claves[i]),
            casos: contador[claves[i]]
        });
    }

    lista.sort(function (a, b) {
        return b.casos - a.casos;
    });

    return lista;
}

// construirResumen() depende de esta funcion
function construirListaSeveridades(contador) {
    /*
    Descripcion:
    Construye lista de severidades frecuentes.

    Parametros:
    - contador: Objeto contador

    Retorna:
    - Lista ordenada
    */

    const lista = [];
    const claves = Object.keys(contador);

    for (let i = 0; i < claves.length; i++) {
        lista.push({
            severidad: claves[i],
            nombre: obtenerNombreSeveridad(claves[i]),
            casos: contador[claves[i]]
        });
    }

    lista.sort(function (a, b) {
        return b.casos - a.casos;
    });

    return lista;
}

// Funciones principales dependen de esta funcion
function crearError(mensaje, status) {
    /*
    Descripcion:
    Crea error con status HTTP personalizado.

    Parametros:
    - mensaje: Mensaje del error
    - status: Codigo HTTP

    Retorna:
    - Error personalizado
    */

    const nuevoError = new Error(mensaje);
    nuevoError.status = status;

    return nuevoError;
}

/*
//////////////////////////////////////////////////////////
EXPORTS
//////////////////////////////////////////////////////////
*/

export default {
    obtenerEnfermedades,
    obtenerEnfermedadPorId,
    crearEnfermedad,
    actualizarEnfermedad,
    eliminarEnfermedad,
    limpiarEnfermedades,
    obtenerResumenEnfermedades,
    obtenerCatalogoEnfermedades,
    obtenerCatalogoSeveridades
};
