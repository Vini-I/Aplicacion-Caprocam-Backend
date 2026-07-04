/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.model.js
Autor: Marco Vásquez
Fecha: 03/07/2026
Modulo: Raleo
Descripcion:
Capa de datos del modulo de raleo.
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
import { MetodoRaleo, metodoRaleo } from '../dtos/raleo.dto.js';

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////

Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
*/

let raleos = [
    {
        id:              1,
        idFinca:         1,
        idEstanque:      1,
        idResponsable:   2,
        fecha:           '03/07/2026',
        porcentaje:      30,
        pesoEstimado:    0.3,
        biomasaEstimado: 14,
        objetivo:        'Resiembra en otro estanque',
        metodo:          MetodoRaleo.ATARRAYA,
        notas:           'Se debe verificar los componentes Fisico-Químicos del estanque'
    },
    {
        id:              2,
        idFinca:         2,
        idEstanque:      3,
        idResponsable:   1,
        fecha:           '04/07/2026',
        porcentaje:      40,
        pesoEstimado:    0.45,
        biomasaEstimado: 20,
        objetivo:        'Comercialización',
        metodo:          MetodoRaleo.RED_DE_ARRASTRE,
        notas:           'listo para vender'
    },
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de colaboradores.
*/

export function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todas las tablas de raleo.
    Permite filtrar por idFinca.

    Parametros:
    - filtros: Filtros opcionales

    Retorna:
    - Lista de raleos
    */
    if (filtros) {
        if (filtros.idFinca) {
            return filtrarPorFinca(filtros.idFinca);
        }
    }

    return raleos;
}

export function findById(id) {
    /*
    Descripcion:
    Busca un raleo por su ID.

    Parametros:
    - id: ID del raleo a buscar.

    Retorna:
    - El raleo encontrado, o null si no existe.
    */
    for (let i = 0; i < raleos.length; i++) {
        if (raleos[i].id === id) {
            return raleos[i];
        }
    }
    return null;
}



export function create(dto) {
    /*
    Descripcion:
    Agrega un nuevo raleo a la lista.

    Parametros:
    - dto: Objeto RaleoDTO con los datos del nuevo raleo.

    Retorna:
    - nuevo: El raleo recien creado con su ID asignado.
    */
    const nuevo = { ...dto, id: raleos.length + 1 };
    raleos.push(nuevo);
    return nuevo;
}

export function remove(id) {
    /*
    Descripcion:
    Elimina un raleo por su ID.

    Parametros:
    - id: ID del raleo a eliminar.

    Retorna:
    - El raleo eliminado, o null si no existe.
    */
    const index = buscarIndicePorId(id);

    if (index === -1) {
        return null;
    }

    const eliminado = raleos[index];

    raleos.splice(index, 1);

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

    for (let i = 0; i < raleos.length; i++) {
        if (raleos[i].idFinca === numeroFinca) {
            resultado.push(raleos[i]);
        }
    }

    return resultado;
}

function buscarIndicePorId(id) {
    for (let i = 0; i < raleos.length; i++) {
        if (raleos[i].id === id) {
            return i;
        }
    }

    return -1;
}