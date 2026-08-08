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
Conectado a MySQL via pool. Usa borrado logico y auditoria dual.
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
*/

function mapearComprador(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase para el frontend.

    Parametros:
    - fila: Objeto crudo recuperado de MySQL.

    Retorna:
    - Objeto comprador mapeado a camelCase o null.
    */
    if (!fila) return null;
    return {
        id:                     fila.id,
        grupoDatos:             fila.grupo_datos,
        nombre:                 fila.nombre,
        cedula:                 fila.cedula,
        telefono:               fila.telefono,
        correo:                 fila.correo,
        direccion:              fila.direccion,
        notas:                  fila.notas,
        estado:                 fila.estado,
        creadoPorUsuarioId:     fila.creado_por_usuario_id || null,
        creadoPorColaboradorId: fila.creado_por_colaborador_id || null,
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
    Obtiene todos los compradores activos del grupo de datos.

    Parametros:
    - grupoDatos: Grupo de datos de la sesion actual.

    Retorna:
    - Lista de compradores mapeados a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT id, grupo_datos, nombre, cedula, telefono, correo, direccion, notas, estado,
                creado_por_usuario_id, creado_por_colaborador_id
         FROM compradores
         WHERE grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearComprador);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un comprador activo por ID dentro del grupo.

    Parametros:
    - id: ID unico del comprador.
    - grupoDatos: Grupo de datos de la sesion actual.

    Retorna:
    - El comprador encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT id, grupo_datos, nombre, cedula, telefono, correo, direccion, notas, estado,
                creado_por_usuario_id, creado_por_colaborador_id
         FROM compradores
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearComprador(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un nuevo comprador registrando auditoria previa validacion de cedula.

    Parametros:
    - dto: Objeto CompradorDTO con la informacion a crear.
    - grupoDatos: Grupo de datos de la sesion actual.

    Retorna:
    - El comprador recien creado.
    */
    if (dto.cedula) {
        const [existente] = await pool.query(
            `SELECT id FROM compradores
             WHERE cedula = ? AND grupo_datos = ? AND estado = "ACTIVO"
               AND deleted_at IS NULL`,
            [dto.cedula, grupoDatos]
        );
        if (existente.length > 0) {
            throw new Error('Ya existe un comprador registrado con esta cedula.');
        }
    }

    const [result] = await pool.query(
        `INSERT INTO compradores 
            (grupo_datos, nombre, cedula, telefono, correo, direccion, notas, estado,
             creado_por_usuario_id, creado_por_colaborador_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, "ACTIVO", ?, ?)`,
        [
            grupoDatos,
            dto.nombre,
            dto.cedula || null,
            dto.telefono || null,
            dto.correo || null,
            dto.direccion || null,
            dto.notas || null,
            dto.creadoPorUsuarioId || null,
            dto.creadoPorColaboradorId || null
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un comprador existente en la base de datos validando duplicados de cedula.

    Parametros:
    - id: ID del comprador a modificar.
    - dto: Objeto CompradorDTO con los datos actualizados.
    - grupoDatos: Grupo de datos de la sesion actual.

    Retorna:
    - El comprador actualizado o null si no existe.
    */
    if (dto.cedula) {
        const [existente] = await pool.query(
            `SELECT id FROM compradores
             WHERE cedula = ? AND grupo_datos = ? AND id != ? AND estado = "ACTIVO"
               AND deleted_at IS NULL`,
            [dto.cedula, grupoDatos, id]
        );
        if (existente.length > 0) {
            throw new Error('Ya existe otro comprador registrado con esta cedula.');
        }
    }

    const [result] = await pool.query(
        `UPDATE compradores
         SET nombre = ?, cedula = ?, telefono = ?, correo = ?, direccion = ?, notas = ?
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [
            dto.nombre,
            dto.cedula || null,
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

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Ejecuta un borrado logico del comprador desactivando su estado.

    Parametros:
    - id: ID del comprador a desactivar.
    - grupoDatos: Grupo de datos de la sesion actual.

    Retorna:
    - Objeto comprador previo al borrado o null si no existia.
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