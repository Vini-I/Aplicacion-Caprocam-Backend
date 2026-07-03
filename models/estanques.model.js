/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.model.js
Autor: Gerald Alfaro
Fecha: 29/06/2026
Modulo: Estanques
Descripcion:
Capa de datos del modulo de estanques.
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

import { EstadoEstanque } from "../dtos/estanques.dto.js";

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let siguienteId = 3;

let estanques = [
    {
        id: 1,
        idFinca: 1,
        codigo: "EST-001",
        tipoEstanque: "Precria",
        estado: EstadoEstanque.ACTIVO,
        largo: 100,
        ancho: 80,
        profundidad: 0.8,
        fuenteAgua: "Pozo",
        especie: "Litopenaeus vannamei - Camaron blanco",
        fechaSiembra: "25/06/2026",
        fechaInicioEngorde: "25/06/2026",
        fechaMantenimiento: "25/06/2026",
        densidadSiembra: 12,
        usaPrecria: false,
        metodoAlimentacion: "Manual",
        proveedorAlimento: "Biomar",
        numeroAireadores: 0,
        tieneAlimentadorAutomatico: false,
        fechaCreacion: "2026-06-25T00:00:00.000Z",
        fechaActualizacion: "2026-06-25T00:00:00.000Z"
    },
    {
        id: 2,
        idFinca: 1,
        codigo: "EST-002",
        tipoEstanque: "Engorde",
        estado: EstadoEstanque.EN_PREPARACION,
        largo: 90,
        ancho: 70,
        profundidad: 1,
        fuenteAgua: "Canal",
        especie: "Litopenaeus vannamei - Camaron blanco",
        fechaSiembra: "25/06/2026",
        fechaInicioEngorde: "25/06/2026",
        fechaMantenimiento: "25/06/2026",
        densidadSiembra: 10,
        usaPrecria: true,
        metodoAlimentacion: "Automatico",
        proveedorAlimento: "Biomar",
        numeroAireadores: 2,
        tieneAlimentadorAutomatico: true,
        fechaCreacion: "2026-06-25T00:00:00.000Z",
        fechaActualizacion: "2026-06-25T00:00:00.000Z"
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de estanques.
*/

export function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todos los estanques.
    Permite filtrar por idFinca.

    Parametros:
    - filtros: Filtros opcionales

    Retorna:
    - Lista de estanques
    */
    if (filtros) {
        if (filtros.idFinca) {
            return filtrarPorFinca(filtros.idFinca);
        }
    }

    return estanques;
}

export function findById(id) {
    /*
    Descripcion:
    Busca un estanque por su ID.

    Parametros:
    - id: ID del estanque a buscar

    Retorna:
    - El estanque encontrado, o null si no existe
    */
    const numeroId = Number(id);

    for (let i = 0; i < estanques.length; i++) {
        if (estanques[i].id === numeroId) {
            return estanques[i];
        }
    }

    return null;
}

export function findByCodigoAndFinca(codigo, idFinca, idIgnorado) {
    /*
    Descripcion:
    Busca un estanque por codigo y finca.
    Permite ignorar un id cuando se actualiza.

    Parametros:
    - codigo: Codigo del estanque
    - idFinca: ID de la finca
    - idIgnorado: ID que se desea ignorar

    Retorna:
    - El estanque encontrado, o null si no existe
    */
    const codigoBuscado = String(codigo).trim().toLowerCase();
    const numeroFinca = Number(idFinca);
    let numeroIgnorado = null;

    if (idIgnorado !== null) {
        if (idIgnorado !== undefined) {
            numeroIgnorado = Number(idIgnorado);
        }
    }

    for (let i = 0; i < estanques.length; i++) {
        const estanque = estanques[i];
        const codigoActual = String(estanque.codigo).trim().toLowerCase();

        if (codigoActual === codigoBuscado) {
            if (estanque.idFinca === numeroFinca) {
                if (estanque.id !== numeroIgnorado) {
                    return estanque;
                }
            }
        }
    }

    return null;
}

export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo estanque a la lista.

    Parametros:
    - dto: Objeto EstanqueDTO con los datos del nuevo estanque

    Retorna:
    - nuevo: El estanque recien creado con su ID asignado
    */
    const fechaActual = new Date().toISOString();

    const nuevo = {
        ...dto,
        id: siguienteId,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual
    };

    siguienteId = siguienteId + 1;
    estanques.push(nuevo);

    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un estanque existente por su ID.

    Parametros:
    - id: ID del estanque a actualizar
    - dto: Objeto EstanqueDTO con los nuevos datos

    Retorna:
    - El estanque actualizado, o null si no existe
    */
    const numeroId = Number(id);
    const index = buscarIndicePorId(numeroId);

    if (index === -1) {
        return null;
    }

    const fechaActual = new Date().toISOString();
    const estanqueActual = estanques[index];

    const actualizado = {
        ...estanqueActual,
        ...dto,
        id: estanqueActual.id,
        fechaCreacion: estanqueActual.fechaCreacion,
        fechaActualizacion: fechaActual
    };

    estanques[index] = actualizado;

    return actualizado;
}

export function remove(id) {
    /*
    Descripcion:
    Elimina un estanque por su ID.

    Parametros:
    - id: ID del estanque a eliminar

    Retorna:
    - El estanque eliminado, o null si no existe
    */
    const numeroId = Number(id);
    const index = buscarIndicePorId(numeroId);

    if (index === -1) {
        return null;
    }

    const eliminado = estanques[index];

    estanques.splice(index, 1);

    return eliminado;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas usadas por el modelo.
*/

function filtrarPorFinca(idFinca) {
    const numeroFinca = Number(idFinca);
    const resultado = [];

    for (let i = 0; i < estanques.length; i++) {
        if (estanques[i].idFinca === numeroFinca) {
            resultado.push(estanques[i]);
        }
    }

    return resultado;
}

function buscarIndicePorId(id) {
    for (let i = 0; i < estanques.length; i++) {
        if (estanques[i].id === id) {
            return i;
        }
    }

    return -1;
}