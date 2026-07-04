/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.model.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Modelo encargado de manejar los datos del modulo de
enfermedades.
Actualmente trabaja con datos mock locales en memoria.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DATOS MOCK LOCALES
//////////////////////////////////////////////////////////

Contiene registros temporales para probar el modulo sin base
de datos.
*/

let siguienteId = 3;

let enfermedadesMock = [
    {
        id: "1",
        tipoRegistro: "enfermedad",
        finca: "1",
        fincaNombre: "Finca La Reina",
        estanque: "EST-001",
        fechaReporte: "27/06/2026",
        responsable: "Isaac",
        enfermedades: ["wssv", "vibriosis"],
        severidad: "media",
        severidadNombre: "Media",
        mortalidad: 2,
        reporte: "Caso mock con sintomas leves y seguimiento sanitario.",
        activo: true,
        fechaCreacion: "2026-06-27T00:00:00.000Z",
        fechaActualizacion: "2026-06-27T00:00:00.000Z",
        fechaEliminacion: null
    },
    {
        id: "2",
        tipoRegistro: "enfermedad",
        finca: "2",
        fincaNombre: "Finca La Esperanza",
        estanque: "EST-002",
        fechaReporte: "28/06/2026",
        responsable: "Maria",
        enfermedades: ["nhp"],
        severidad: "alta",
        severidadNombre: "Alta",
        mortalidad: 5,
        reporte: "Caso mock con mortalidad registrada y observacion activa.",
        activo: true,
        fechaCreacion: "2026-06-28T00:00:00.000Z",
        fechaActualizacion: "2026-06-28T00:00:00.000Z",
        fechaEliminacion: null
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones usadas por el service para consultar,
crear, actualizar y eliminar registros.
*/

async function obtenerEnfermedades(filtros) {
    /*
    Descripcion:
    Obtiene registros activos de enfermedades y aplica filtros.

    Parametros:
    - filtros: Objeto con filtros opcionales

    Retorna:
    - Lista de registros activos
    */

    let registros = obtenerActivos();

    registros = aplicarFiltros(registros, filtros);

    return registros;
}

async function obtenerEnfermedadPorId(id) {
    /*
    Descripcion:
    Busca un registro activo por id.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro encontrado o null
    */

    const idBuscado = String(id);

    for (let i = 0; i < enfermedadesMock.length; i++) {
        if (enfermedadesMock[i].id === idBuscado) {
            if (enfermedadesMock[i].activo === true) {
                return enfermedadesMock[i];
            }
        }
    }

    return null;
}

async function crearEnfermedad(datos) {
    /*
    Descripcion:
    Crea un nuevo registro mock en memoria.

    Parametros:
    - datos: Datos preparados por el service

    Retorna:
    - Registro creado
    */

    const fechaActual = new Date().toISOString();
    const idNuevo = String(siguienteId);

    const nuevoRegistro = {
        id: idNuevo,
        tipoRegistro: "enfermedad",
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        enfermedades: datos.enfermedades,
        severidad: datos.severidad,
        severidadNombre: datos.severidadNombre,
        mortalidad: datos.mortalidad,
        reporte: datos.reporte,
        activo: true,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
        fechaEliminacion: null
    };

    siguienteId = siguienteId + 1;
    enfermedadesMock.push(nuevoRegistro);

    return nuevoRegistro;
}

async function actualizarEnfermedad(id, datos) {
    /*
    Descripcion:
    Actualiza un registro mock existente.

    Parametros:
    - id: Identificador del registro
    - datos: Datos nuevos del registro

    Retorna:
    - Registro actualizado o null
    */

    const indice = buscarIndicePorId(id);

    if (indice === -1) {
        return null;
    }

    if (enfermedadesMock[indice].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    const actualizado = {
        id: String(id),
        tipoRegistro: "enfermedad",
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        enfermedades: datos.enfermedades,
        severidad: datos.severidad,
        severidadNombre: datos.severidadNombre,
        mortalidad: datos.mortalidad,
        reporte: datos.reporte,
        activo: true,
        fechaCreacion: enfermedadesMock[indice].fechaCreacion,
        fechaActualizacion: fechaActual,
        fechaEliminacion: null
    };

    enfermedadesMock[indice] = actualizado;

    return actualizado;
}

async function eliminarEnfermedad(id) {
    /*
    Descripcion:
    Realiza borrado logico de un registro.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro marcado como inactivo o null
    */

    const indice = buscarIndicePorId(id);

    if (indice === -1) {
        return null;
    }

    if (enfermedadesMock[indice].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    enfermedadesMock[indice].activo = false;
    enfermedadesMock[indice].fechaActualizacion = fechaActual;
    enfermedadesMock[indice].fechaEliminacion = fechaActual;

    return enfermedadesMock[indice];
}

async function limpiarEnfermedades() {
    /*
    Descripcion:
    Limpia todos los registros mock activos.
    Esta funcion es solo para pruebas locales.

    Parametros:
    No posee

    Retorna:
    - Lista vacia
    */

    enfermedadesMock = [];
    siguienteId = 1;

    return enfermedadesMock;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas usadas por las funciones principales.
*/

// obtenerEnfermedades() depende de esta funcion
function obtenerActivos() {
    /*
    Descripcion:
    Obtiene solo registros activos.

    Parametros:
    No posee

    Retorna:
    - Lista de registros activos
    */

    const activos = [];

    for (let i = 0; i < enfermedadesMock.length; i++) {
        if (enfermedadesMock[i].activo === true) {
            activos.push(enfermedadesMock[i]);
        }
    }

    return activos;
}

// obtenerEnfermedades() depende de esta funcion
function aplicarFiltros(registros, filtros) {
    /*
    Descripcion:
    Aplica filtros opcionales sobre los registros.

    Parametros:
    - registros: Lista base
    - filtros: Filtros opcionales

    Retorna:
    - Lista filtrada
    */

    let resultado = registros;

    if (filtros === undefined) {
        return resultado;
    }

    if (filtros === null) {
        return resultado;
    }

    resultado = filtrarPorCampo(resultado, "finca", filtros.finca);
    resultado = filtrarPorCampo(resultado, "estanque", filtros.estanque);
    resultado = filtrarPorCampo(resultado, "severidad", filtros.severidad);
    resultado = filtrarPorCampo(
        resultado,
        "fechaReporte",
        filtros.fechaReporte
    );

    return resultado;
}

// aplicarFiltros() depende de esta funcion
function filtrarPorCampo(registros, campo, valor) {
    /*
    Descripcion:
    Filtra una lista por campo cuando el valor existe.

    Parametros:
    - registros: Lista de registros
    - campo: Campo del objeto
    - valor: Valor buscado

    Retorna:
    - Lista filtrada
    */

    if (valorEstaVacio(valor) === true) {
        return registros;
    }

    const resultado = [];
    const valorBuscado = String(valor);

    for (let i = 0; i < registros.length; i++) {
        if (String(registros[i][campo]) === valorBuscado) {
            resultado.push(registros[i]);
        }
    }

    return resultado;
}

// actualizarEnfermedad() y eliminarEnfermedad() dependen de esta funcion
function buscarIndicePorId(id) {
    /*
    Descripcion:
    Busca el indice de un registro por id.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Indice encontrado o -1
    */

    const idBuscado = String(id);

    for (let i = 0; i < enfermedadesMock.length; i++) {
        if (enfermedadesMock[i].id === idBuscado) {
            return i;
        }
    }

    return -1;
}

// aplicarFiltros() depende de esta funcion
function valorEstaVacio(valor) {
    /*
    Descripcion:
    Revisa si un valor viene vacio.

    Parametros:
    - valor: Valor recibido

    Retorna:
    - true si esta vacio
    - false si tiene informacion
    */

    if (valor === undefined) {
        return true;
    }

    if (valor === null) {
        return true;
    }

    if (String(valor).trim() === "") {
        return true;
    }

    return false;
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
    limpiarEnfermedades
};
