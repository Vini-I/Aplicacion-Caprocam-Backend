/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: comprador.model.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Compradores
Descripcion:
Capa de datos del modulo de compradores.
Conectado a MySQL via pool. Usa borrado logico.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Config
*/

import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Todas las funciones principales dependen de mapearComprador().
*/

function mapearComprador(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase
    para el frontend.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto comprador en camelCase.
    */
    if (!fila) return null;
    return {
        id:         fila.id,
        grupoDatos: fila.grupo_datos,
        nombre:     fila.nombre,
        contacto:   fila.contacto,
        estado:     fila.estado,
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todos los compradores activos del grupo.

    Parametros:
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de compradores mapeados a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT id, grupo_datos, nombre, contacto, estado
         FROM compradores
         WHERE grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearComprador);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un comprador por ID dentro del grupo.

    Parametros:
    - id:          ID del comprador.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El comprador encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT id, grupo_datos, nombre, contacto, estado
         FROM compradores
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearComprador(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un nuevo comprador en la DB.

    Parametros:
    - dto:         Objeto DTO con los datos.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El comprador recien creado.
    */
    const [result] = await pool.query(
        `INSERT INTO compradores (grupo_datos, nombre, contacto, estado)
         VALUES (?, ?, ?, "ACTIVO")`,
        [grupoDatos, dto.nombre, dto.contacto || null]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un comprador existente.

    Parametros:
    - id:          ID del comprador.
    - dto:         Objeto DTO con los nuevos datos.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El comprador actualizado o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE compradores
         SET nombre = ?, contacto = ?
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [dto.nombre, dto.contacto || null, id, grupoDatos]
    );
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Borrado logico del comprador. No elimina el registro.

    Parametros:
    - id:          ID del comprador.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El comprador antes de ser desactivado, o null si no existe.
    */
    const comprador = await findById(id, grupoDatos);
    if (!comprador) return null;

    await pool.query(
        `UPDATE compradores
         SET estado = "INACTIVO", deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return comprador;
}