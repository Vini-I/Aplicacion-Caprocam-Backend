/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: compradores.model.js
Autor: Jose Espinoza
Fecha: 28/06/2026
Modulo: Compradores
Descripcion:
Modelo encargado de las operaciones de datos del
modulo de compradores. Actualmente utiliza datos
mock mientras se implementa la base de datos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// Constantes
import {
    ESTADOS_COMPRADOR
} from "../common/compradores.constants.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const compradoresMock = [
    {
        id: 1,
        nombre: "Intermediario del Pacifico",
        contacto: "Juan Perez",
        telefono: "8888-0001",
        correo: "juanperez@mail.com",
        estado: "ACTIVO"
    },
    {
        id: 2,
        nombre: "Distribuidora Marina S.A.",
        contacto: "Ana Lopez",
        telefono: "8888-0002",
        correo: "analopez@mail.com",
        estado: "ACTIVO"
    },
    {
        id: 3,
        nombre: "Exportaciones del Sur",
        contacto: "Carlos Mora",
        telefono: "8888-0003",
        correo: "carlosmora@mail.com",
        estado: "ACTIVO"
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES DE BASE DE DATOS
//////////////////////////////////////////////////////////
*/

export async function obtenerTodosLosCompradores() {

    return compradoresMock.filter(
        comprador =>
            comprador.estado === ESTADOS_COMPRADOR.ACTIVO
    );

}

export async function obtenerCompradorPorId(id) {

    return (
        compradoresMock.find(
            comprador => comprador.id === Number(id)
        ) || null
    );

}

export async function crearComprador(datos) {

    const nuevoComprador = {
        id: compradoresMock.length + 1,
        ...datos,
        estado: ESTADOS_COMPRADOR.ACTIVO
    };

    compradoresMock.push(nuevoComprador);

    return nuevoComprador;

}

export async function actualizarComprador(id, datos) {

    const indice = compradoresMock.findIndex(
        comprador => comprador.id === Number(id)
    );

    if (indice === -1) {

        return null;

    }

    compradoresMock[indice] = {
        ...compradoresMock[indice],
        ...datos
    };

    return compradoresMock[indice];

}

export async function eliminarComprador(id) {

    const comprador = compradoresMock.find(
        comprador => comprador.id === Number(id)
    );

    if (!comprador) {

        return false;

    }

    comprador.estado = ESTADOS_COMPRADOR.INACTIVO;

    return true;

}