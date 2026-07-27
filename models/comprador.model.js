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

/**
 * Descripcion:
 * Convierte una fila MySQL (snake_case) a camelCase para el frontend.
 *
 * Parametros:
 * - fila: Objeto crudo recuperado de MySQL.
 *
 * Retorna:
 * - Objeto comprador mapeado a camelCase o null.
 */
function mapearComprador(fila) {
    if (!fila) return null;
    return {
        id:         fila.id,
        grupoDatos: fila.grupo_datos,
        nombre:     fila.nombre,
        contacto:   fila.contacto,
        telefono:   fila.telefono,
        correo:     fila.correo,
        direccion:  fila.direccion,
        notas:      fila.notas,
        estado:     fila.estado,
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

/**
 * Descripcion:
 * Obtiene todos los compradores activos del grupo de datos.
 *
 * Parametros:
 * - grupoDatos: Grupo de datos del usuario en sesion.
 *
 * Retorna:
 * - Lista de compradores mapeados a camelCase.
 */
export async function findAll(grupoDatos) {
    const [filas] = await pool.query(
        `SELECT id, grupo_datos, nombre, contacto, telefono, correo, direccion, notas, estado
         FROM compradores
         WHERE grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearComprador);
}

/**
 * Descripcion:
 * Busca un comprador activo por ID dentro del grupo.
 *
 * Parametros:
 * - id: ID unico del comprador.
 * - grupoDatos: Grupo de datos del usuario en sesion.
 *
 * Retorna:
 * - El comprador encontrado o null.
 */
export async function findById(id, grupoDatos) {
    const [filas] = await pool.query(
        `SELECT id, grupo_datos, nombre, contacto, telefono, correo, direccion, notas, estado
         FROM compradores
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearComprador(filas[0]) : null;
}

/**
 * Descripcion:
 * Inserta un nuevo comprador en la base de datos.
 *
 * Parametros:
 * - dto: Objeto CompradorDTO con la informacion a crear.
 * - grupoDatos: Grupo de datos del usuario en sesion.
 *
 * Retorna:
 * - El comprador recien creado.
 */
export async function create(dto, grupoDatos) {
    const [result] = await pool.query(
        `INSERT INTO compradores (grupo_datos, nombre, contacto, telefono, correo, direccion, notas, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, "ACTIVO")`,
        [
            grupoDatos,
            dto.nombre,
            dto.contacto || null,
            dto.telefono || null,
            dto.correo || null,
            dto.direccion || null,
            dto.notas || null
        ]
    );
    return findById(result.insertId, grupoDatos);
}

/**
 * Descripcion:
 * Actualiza un comprador existente en la base de datos.
 *
 * Parametros:
 * - id: ID del comprador a modificar.
 * - dto: Objeto CompradorDTO con los datos actualizados.
 * - grupoDatos: Grupo de datos del usuario en sesion.
 *
 * Retorna:
 * - El comprador actualizado o null si no existe.
 */
export async function update(id, dto, grupoDatos) {
    const [result] = await pool.query(
        `UPDATE compradores
         SET nombre = ?, contacto = ?, telefono = ?, correo = ?, direccion = ?, notas = ?
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [
            dto.nombre,
            dto.contacto || null,
            dto.telefono || null,
            dto.correo || null,
            dto.direccion || null,
            dto.notas || null,
            id,
            grupoDatos
        ]
    );
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

/**
 * Descripcion:
 * Ejecuta un borrado logico del comprador desactivando su estado.
 *
 * Parametros:
 * - id: ID del comprador a desactivar.
 * - grupoDatos: Grupo de datos del usuario en sesion.
 *
 * Retorna:
 * - Objeto comprador previo al borrado o null si no existia.
 */
export async function remove(id, grupoDatos) {
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