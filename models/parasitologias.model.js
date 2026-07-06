/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.model.js
Autor: Andres Gutierrez
Fecha: 30/06/2026
Modulo: Parasitologias
Descripcion:
Capa de datos del modulo de parasitologias.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/

import { ParasitoParasitologia, GradoInfeccion } from '../dtos/parasitologias.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let siguienteId = 3;

let parasitologias = [
    {
        id:                   1,
        tipoRegistro:         'parasitologia',
        finca:                '1',
        fincaNombre:          'Finca La Reina',
        estanque:             'EST-001',
        fechaReporte:         '27/06/2026',
        responsable:          'Responsable prueba',
        parasito:             ParasitoParasitologia.GREGARINA,
        parasitoNombre:       'Gregarina',
        camaronesMuestreados: 50,
        camaronesInfectados:  12,
        porcentajeInfeccion:  24,
        gradoInfeccion:       GradoInfeccion.BAJO,
        gradoInfeccionNombre: 'Bajo',
        observaciones:        'Registro temporal de prueba.',
        activo:               true,
        fechaCreacion:        '2026-06-27T00:00:00.000Z',
        fechaActualizacion:   '2026-06-27T00:00:00.000Z',
        fechaEliminacion:     null,
    },
    {
        id:                   2,
        tipoRegistro:         'parasitologia',
        finca:                '2',
        fincaNombre:          'Finca La Esperanza',
        estanque:             'EST-002',
        fechaReporte:         '27/06/2026',
        responsable:          '',
        parasito:             ParasitoParasitologia.NEMATODO,
        parasitoNombre:       'Nematodo',
        camaronesMuestreados: 60,
        camaronesInfectados:  25,
        porcentajeInfeccion:  41.67,
        gradoInfeccion:       GradoInfeccion.MEDIO,
        gradoInfeccionNombre: 'Medio',
        observaciones:        'Se recomienda seguimiento del estanque.',
        activo:               true,
        fechaCreacion:        '2026-06-27T00:00:00.000Z',
        fechaActualizacion:   '2026-06-27T00:00:00.000Z',
        fechaEliminacion:     null,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de parasitologias.
*/

export function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todos los registros activos de parasitologias.
    Permite aplicar filtros opcionales.

    Parametros:
    - filtros: Objeto con filtros de busqueda.

    Retorna:
    - Lista con los registros encontrados.
    */
    const resultado = [];

    for (let i = 0; i < parasitologias.length; i++) {
        const registro = parasitologias[i];

        if (registro.activo === true) {
            if (coincideConFiltros(registro, filtros)) {
                resultado.push(registro);
            }
        }
    }

    return resultado;
}

export function findById(id) {
    /*
    Descripcion:
    Busca un registro de parasitologia por su ID.

    Parametros:
    - id: ID del registro a buscar.

    Retorna:
    - El registro encontrado, o null si no existe.
    */
    for (let i = 0; i < parasitologias.length; i++) {
        const registro = parasitologias[i];

        if (registro.id === Number(id)) {
            if (registro.activo === true) {
                return registro;
            }
        }
    }

    return null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo registro de parasitologia a la lista.

    Parametros:
    - dto: Objeto ParasitologiaDTO con los datos del nuevo registro.

    Retorna:
    - nuevo: El registro recien creado con su ID asignado.
    */
    const fechaActual = new Date().toISOString();

    const nuevo = {
        ...dto,
        id:                 siguienteId,
        activo:             true,
        fechaCreacion:      fechaActual,
        fechaActualizacion: fechaActual,
        fechaEliminacion:   null,
    };

    siguienteId = siguienteId + 1;
    parasitologias.push(nuevo);

    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un registro de parasitologia existente por su ID.

    Parametros:
    - id:  ID del registro a actualizar.
    - dto: Objeto ParasitologiaDTO con los nuevos datos.

    Retorna:
    - El registro actualizado, o null si no existe.
    */
    const index = buscarIndicePorId(id);

    if (index === -1) {
        return null;
    }

    if (parasitologias[index].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    parasitologias[index] = {
        ...parasitologias[index],
        ...dto,
        id:                 Number(id),
        activo:             true,
        fechaActualizacion: fechaActual,
        fechaEliminacion:   null,
    };

    return parasitologias[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina logicamente un registro de parasitologia por su ID.

    Parametros:
    - id: ID del registro a eliminar.

    Retorna:
    - El registro eliminado, o null si no existe.
    */
    const index = buscarIndicePorId(id);

    if (index === -1) {
        return null;
    }

    if (parasitologias[index].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    parasitologias[index].activo = false;
    parasitologias[index].fechaActualizacion = fechaActual;
    parasitologias[index].fechaEliminacion = fechaActual;

    return parasitologias[index];
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas de busqueda y filtrado.
*/

function buscarIndicePorId(id) {
    /*
    Descripcion:
    Busca el indice de un registro por su ID.

    Parametros:
    - id: ID del registro.

    Retorna:
    - Indice encontrado, o -1 si no existe.
    */
    for (let i = 0; i < parasitologias.length; i++) {
        if (parasitologias[i].id === Number(id)) {
            return i;
        }
    }

    return -1;
}

function coincideConFiltros(registro, filtros) {
    /*
    Descripcion:
    Verifica si un registro coincide con los filtros recibidos.

    Parametros:
    - registro: Registro a evaluar.
    - filtros: Objeto con filtros.

    Retorna:
    - true si coincide, false si no.
    */
    if (!filtros) {
        return true;
    }

    if (!coincideFiltro(registro.finca, filtros.finca)) {
        return false;
    }

    if (!coincideFiltro(registro.estanque, filtros.estanque)) {
        return false;
    }

    if (!coincideFiltro(registro.parasito, filtros.parasito)) {
        return false;
    }

    if (!coincideFiltro(registro.fechaReporte, filtros.fechaReporte)) {
        return false;
    }

    return true;
}

function coincideFiltro(valorRegistro, valorFiltro) {
    /*
    Descripcion:
    Compara un valor del registro con un filtro opcional.

    Parametros:
    - valorRegistro: Valor almacenado en el registro.
    - valorFiltro: Valor recibido como filtro.

    Retorna:
    - true si el filtro esta vacio o si coincide.
    */
    if (valorFiltro === undefined) {
        return true;
    }

    if (valorFiltro === null) {
        return true;
    }

    if (String(valorFiltro).trim().length === 0) {
        return true;
    }

    if (String(valorRegistro) === String(valorFiltro)) {
        return true;
    }

    return false;
}