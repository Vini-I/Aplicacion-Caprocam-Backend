/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.model.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Modelo encargado de manejar las operaciones de datos del
modulo de parasitologias. Actualmente usa datos mock en
memoria para pruebas.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DATOS MOCK
//////////////////////////////////////////////////////////

Arreglo temporal usado para simular registros mientras
se conecta el modulo a base de datos.
*/

let siguienteId = 3;

let registrosParasitologias = [
    {
        id: "1",
        tipoRegistro: "parasitologia",
        finca: "1",
        fincaNombre: "Finca La Reina",
        estanque: "EST-001",
        fechaReporte: "27/06/2026",
        responsable: "Responsable prueba",
        parasito: "gregarina",
        parasitoNombre: "Gregarina",
        camaronesMuestreados: 50,
        camaronesInfectados: 12,
        porcentajeInfeccion: 24,
        gradoInfeccion: "bajo",
        gradoInfeccionNombre: "Bajo",
        observaciones: "Registro temporal de prueba.",
        activo: true,
        fechaCreacion: "2026-06-27T00:00:00.000Z",
        fechaActualizacion: "2026-06-27T00:00:00.000Z",
        fechaEliminacion: null
    },
    {
        id: "2",
        tipoRegistro: "parasitologia",
        finca: "2",
        fincaNombre: "Finca La Esperanza",
        estanque: "EST-002",
        fechaReporte: "27/06/2026",
        responsable: "",
        parasito: "nematodo",
        parasitoNombre: "Nematodo",
        camaronesMuestreados: 60,
        camaronesInfectados: 25,
        porcentajeInfeccion: 41.67,
        gradoInfeccion: "medio",
        gradoInfeccionNombre: "Medio",
        observaciones: "Se recomienda seguimiento del estanque.",
        activo: true,
        fechaCreacion: "2026-06-27T00:00:00.000Z",
        fechaActualizacion: "2026-06-27T00:00:00.000Z",
        fechaEliminacion: null
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las operaciones CRUD que utiliza el servicio.
*/

async function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todos los registros activos y aplica filtros
    opcionales.

    Parametros:
    - filtros: Objeto con finca, estanque, parasito y fechaReporte

    Retorna:
    - Arreglo de registros activos filtrados
    */
    let registros = obtenerRegistrosActivos();

    registros = aplicarFiltros(registros, filtros);

    return registros;
}

async function findById(id) {
    /*
    Descripcion:
    Busca un registro activo por su ID.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro encontrado o null si no existe
    */
    const idBuscado = String(id);

    for (let i = 0; i < registrosParasitologias.length; i++) {
        const registro = registrosParasitologias[i];

        if (registro.id === idBuscado) {
            if (registro.activo === true) {
                return registro;
            }
        }
    }

    return null;
}

async function create(datos) {
    /*
    Descripcion:
    Crea un nuevo registro de parasitologia en memoria.

    Parametros:
    - datos: Datos preparados por el servicio

    Retorna:
    - Registro creado
    */
    const fechaActual = new Date().toISOString();
    const idNuevo = String(siguienteId);

    const nuevoRegistro = {
        id: idNuevo,
        tipoRegistro: datos.tipoRegistro,
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        parasito: datos.parasito,
        parasitoNombre: datos.parasitoNombre,
        camaronesMuestreados: datos.camaronesMuestreados,
        camaronesInfectados: datos.camaronesInfectados,
        porcentajeInfeccion: datos.porcentajeInfeccion,
        gradoInfeccion: datos.gradoInfeccion,
        gradoInfeccionNombre: datos.gradoInfeccionNombre,
        observaciones: datos.observaciones,
        activo: true,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
        fechaEliminacion: null
    };

    siguienteId = siguienteId + 1;
    registrosParasitologias.push(nuevoRegistro);

    return nuevoRegistro;
}

async function update(id, datos) {
    /*
    Descripcion:
    Actualiza un registro activo de parasitologia.

    Parametros:
    - id: Identificador del registro
    - datos: Datos preparados por el servicio

    Retorna:
    - Registro actualizado o null si no existe
    */
    const indice = buscarIndicePorId(id);

    if (indice === -1) {
        return null;
    }

    if (registrosParasitologias[indice].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    const registroActualizado = {
        id: String(id),
        tipoRegistro: datos.tipoRegistro,
        finca: datos.finca,
        fincaNombre: datos.fincaNombre,
        estanque: datos.estanque,
        fechaReporte: datos.fechaReporte,
        responsable: datos.responsable,
        parasito: datos.parasito,
        parasitoNombre: datos.parasitoNombre,
        camaronesMuestreados: datos.camaronesMuestreados,
        camaronesInfectados: datos.camaronesInfectados,
        porcentajeInfeccion: datos.porcentajeInfeccion,
        gradoInfeccion: datos.gradoInfeccion,
        gradoInfeccionNombre: datos.gradoInfeccionNombre,
        observaciones: datos.observaciones,
        activo: true,
        fechaCreacion: registrosParasitologias[indice].fechaCreacion,
        fechaActualizacion: fechaActual,
        fechaEliminacion: null
    };

    registrosParasitologias[indice] = registroActualizado;

    return registroActualizado;
}

async function remove(id) {
    /*
    Descripcion:
    Realiza una eliminacion logica de un registro de parasitologia.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Registro eliminado logicamente o null si no existe
    */
    const indice = buscarIndicePorId(id);

    if (indice === -1) {
        return null;
    }

    if (registrosParasitologias[indice].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    registrosParasitologias[indice].activo = false;
    registrosParasitologias[indice].fechaActualizacion = fechaActual;
    registrosParasitologias[indice].fechaEliminacion = fechaActual;

    return registrosParasitologias[indice];
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas para filtrar registros, buscar indices y
validar valores de filtro.
*/

function obtenerRegistrosActivos() {
    /*
    Descripcion:
    Obtiene solamente los registros marcados como activos.

    Parametros:
    - No recibe parametros

    Retorna:
    - Arreglo de registros activos
    */
    const registros = [];

    for (let i = 0; i < registrosParasitologias.length; i++) {
        const registro = registrosParasitologias[i];

        if (registro.activo === true) {
            registros.push(registro);
        }
    }

    return registros;
}

function aplicarFiltros(registros, filtros) {
    /*
    Descripcion:
    Aplica todos los filtros disponibles a una lista de registros.

    Parametros:
    - registros: Lista base de registros
    - filtros: Objeto con filtros opcionales

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

    resultado = filtrarPorFinca(resultado, filtros.finca);
    resultado = filtrarPorEstanque(resultado, filtros.estanque);
    resultado = filtrarPorParasito(resultado, filtros.parasito);
    resultado = filtrarPorFechaReporte(resultado, filtros.fechaReporte);

    return resultado;
}

function filtrarPorFinca(registros, finca) {
    /*
    Descripcion:
    Filtra los registros por finca.

    Parametros:
    - registros: Lista de registros
    - finca: Finca buscada

    Retorna:
    - Lista filtrada por finca
    */
    if (filtroEstaVacio(finca) === true) {
        return registros;
    }

    const resultado = [];
    const fincaBuscada = String(finca);

    for (let i = 0; i < registros.length; i++) {
        if (String(registros[i].finca) === fincaBuscada) {
            resultado.push(registros[i]);
        }
    }

    return resultado;
}

function filtrarPorEstanque(registros, estanque) {
    /*
    Descripcion:
    Filtra los registros por estanque.

    Parametros:
    - registros: Lista de registros
    - estanque: Estanque buscado

    Retorna:
    - Lista filtrada por estanque
    */
    if (filtroEstaVacio(estanque) === true) {
        return registros;
    }

    const resultado = [];
    const estanqueBuscado = String(estanque);

    for (let i = 0; i < registros.length; i++) {
        if (String(registros[i].estanque) === estanqueBuscado) {
            resultado.push(registros[i]);
        }
    }

    return resultado;
}

function filtrarPorParasito(registros, parasito) {
    /*
    Descripcion:
    Filtra los registros por tipo de parasito.

    Parametros:
    - registros: Lista de registros
    - parasito: Parasito buscado

    Retorna:
    - Lista filtrada por parasito
    */
    if (filtroEstaVacio(parasito) === true) {
        return registros;
    }

    const resultado = [];
    const parasitoBuscado = String(parasito);

    for (let i = 0; i < registros.length; i++) {
        if (String(registros[i].parasito) === parasitoBuscado) {
            resultado.push(registros[i]);
        }
    }

    return resultado;
}

function filtrarPorFechaReporte(registros, fechaReporte) {
    /*
    Descripcion:
    Filtra los registros por fecha de reporte.

    Parametros:
    - registros: Lista de registros
    - fechaReporte: Fecha buscada

    Retorna:
    - Lista filtrada por fecha de reporte
    */
    if (filtroEstaVacio(fechaReporte) === true) {
        return registros;
    }

    const resultado = [];
    const fechaBuscada = String(fechaReporte);

    for (let i = 0; i < registros.length; i++) {
        if (String(registros[i].fechaReporte) === fechaBuscada) {
            resultado.push(registros[i]);
        }
    }

    return resultado;
}

function buscarIndicePorId(id) {
    /*
    Descripcion:
    Busca el indice de un registro dentro del arreglo mock.

    Parametros:
    - id: Identificador del registro

    Retorna:
    - Indice encontrado o -1 si no existe
    */
    const idBuscado = String(id);

    for (let i = 0; i < registrosParasitologias.length; i++) {
        if (registrosParasitologias[i].id === idBuscado) {
            return i;
        }
    }

    return -1;
}

function filtroEstaVacio(valor) {
    /*
    Descripcion:
    Verifica si un filtro viene vacio.

    Parametros:
    - valor: Valor del filtro

    Retorna:
    - true si esta vacio, false si tiene contenido
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
    findAll,
    findById,
    create,
    update,
    remove,

    // Alias para compatibilidad con nombres usados anteriormente.
    obtenerParasitologias: findAll,
    obtenerParasitologiaPorId: findById,
    crearParasitologia: create,
    actualizarParasitologia: update,
    eliminarParasitologia: remove
};