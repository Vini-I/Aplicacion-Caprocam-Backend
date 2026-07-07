/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.model.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Capa de datos del modulo de enfermedades.
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

import { TipoEnfermedad, SeveridadEnfermedad } from '../dtos/enfermedades.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let siguienteId = 3;

let enfermedades = [
    {
        id:                   1,
        tipoRegistro:         'enfermedad',
        finca:                '1',
        fincaNombre:          'Finca La Reina',
        estanque:             'EST-001',
        fechaReporte:         '2026-06-27',
        responsable:          'Isaac',
        enfermedades:         [TipoEnfermedad.WSSV, TipoEnfermedad.VIBRIOSIS],
        enfermedadesNombre:   ['WSSV - Mancha Blanca', 'Vibriosis'],
        severidad:            SeveridadEnfermedad.MEDIA,
        severidadNombre:      'Media',
        mortalidad:           2,
        reporte:              'Caso mock con sintomas leves y seguimiento sanitario.',
        activo:               true,
        fechaCreacion:        '2026-06-27T00:00:00.000Z',
        fechaActualizacion:   '2026-06-27T00:00:00.000Z',
        fechaEliminacion:     null,
    },
    {
        id:                   2,
        tipoRegistro:         'enfermedad',
        finca:                '2',
        fincaNombre:          'Finca La Esperanza',
        estanque:             'EST-002',
        fechaReporte:         '2026-06-28',
        responsable:          'Maria',
        enfermedades:         [TipoEnfermedad.NHP],
        enfermedadesNombre:   ['NHP - Hepatobacter penaei'],
        severidad:            SeveridadEnfermedad.ALTA,
        severidadNombre:      'Alta',
        mortalidad:           5,
        reporte:              'Caso mock con mortalidad registrada y observacion activa.',
        activo:               true,
        fechaCreacion:        '2026-06-28T00:00:00.000Z',
        fechaActualizacion:   '2026-06-28T00:00:00.000Z',
        fechaEliminacion:     null,
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos mock del modulo de enfermedades.
*/

export function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todos los registros activos de enfermedades.
    Permite aplicar filtros opcionales.

    Parametros:
    - filtros: Objeto con filtros de busqueda.

    Retorna:
    - Lista con los registros encontrados.
    */

    const resultado = [];

    for (let i = 0; i < enfermedades.length; i++) {
        const registro = enfermedades[i];

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
    Busca un registro de enfermedad por su ID.

    Parametros:
    - id: ID del registro a buscar.

    Retorna:
    - El registro encontrado.
    - null si no existe o esta inactivo.
    */

    for (let i = 0; i < enfermedades.length; i++) {
        const registro = enfermedades[i];

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
    Agrega un nuevo registro de enfermedad a la lista mock.

    Parametros:
    - dto: Objeto EnfermedadDTO con los datos del nuevo registro.

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
    enfermedades.push(nuevo);

    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un registro de enfermedad existente por su ID.

    Parametros:
    - id:  ID del registro a actualizar.
    - dto: Objeto EnfermedadDTO con los nuevos datos.

    Retorna:
    - El registro actualizado.
    - null si no existe o esta inactivo.
    */

    const index = buscarIndicePorId(id);

    if (index === -1) {
        return null;
    }

    if (enfermedades[index].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    enfermedades[index] = {
        ...enfermedades[index],
        ...dto,
        id:                 Number(id),
        activo:             true,
        fechaActualizacion: fechaActual,
        fechaEliminacion:   null,
    };

    return enfermedades[index];
}

export function remove(id) {
    /*
    Descripcion:
    Elimina logicamente un registro de enfermedad por su ID.

    Parametros:
    - id: ID del registro a eliminar.

    Retorna:
    - El registro eliminado logicamente.
    - null si no existe o ya estaba inactivo.
    */

    const index = buscarIndicePorId(id);

    if (index === -1) {
        return null;
    }

    if (enfermedades[index].activo === false) {
        return null;
    }

    const fechaActual = new Date().toISOString();

    enfermedades[index].activo = false;
    enfermedades[index].fechaActualizacion = fechaActual;
    enfermedades[index].fechaEliminacion = fechaActual;

    return enfermedades[index];
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
    - Indice encontrado.
    - -1 si no existe.
    */

    for (let i = 0; i < enfermedades.length; i++) {
        if (enfermedades[i].id === Number(id)) {
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
    - true si coincide.
    - false si no coincide.
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

    if (!coincideFiltro(registro.severidad, filtros.severidad)) {
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
    - false si no coincide.
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