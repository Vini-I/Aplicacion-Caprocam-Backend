/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: colaborador.model.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: Colaboradores
Descripcion:
Capa de datos del modulo de colaboradores.
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

Todas las funciones principales dependen de mapearColaborador().
*/

function mapearColaborador(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto colaborador en camelCase.
    */
    return {
        id:              fila.id,
        uuid:            fila.uuid,
        grupoDatos:      fila.grupo_datos,
        fincaId:         fila.finca_id,
        rolId:           fila.rol_id,
        nombre:          fila.nombre,
        apellidos:       fila.apellidos,
        cedula:          fila.cedula,
        telefono:        fila.telefono,
        email:           fila.email,
        nombreUsuario:   fila.nombre_usuario,
        tipoColaborador: fila.tipo_colaborador,
        activo:          fila.activo,
        fechaCreacion:      fila.fecha_creacion,
        fechaActualizacion: fila.fecha_actualizacion,
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
    Obtiene todos los colaboradores activos del grupo.

    Parametros:
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de colaboradores mapeados a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT * FROM colaboradores
         WHERE grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearColaborador);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un colaborador por ID dentro del grupo.

    Parametros:
    - id:         ID del colaborador.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El colaborador encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT * FROM colaboradores
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearColaborador(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un nuevo colaborador en la DB.

    Parametros:
    - dto:        Objeto ColaboradorDTO con los datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El colaborador recien creado.
    */
    const [result] = await pool.query(
        `INSERT INTO colaboradores
         (grupo_datos, finca_id, rol_id, nombre, apellidos, cedula,
          telefono, email, nombre_usuario, pin_hash, tipo_colaborador)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            grupoDatos,
            dto.fincaId,
            dto.rolId,
            dto.nombre,
            dto.apellidos,
            dto.cedula,
            dto.telefono,
            dto.email,
            dto.nombreUsuario,
            dto.pinHash,
            dto.tipoColaborador,
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un colaborador existente e incrementa version.

    Parametros:
    - id:         ID del colaborador.
    - dto:        Objeto ColaboradorDTO con los nuevos datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El colaborador actualizado o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE colaboradores
         SET finca_id = ?, rol_id = ?, nombre = ?, apellidos = ?,
             cedula = ?, telefono = ?, email = ?, tipo_colaborador = ?,
             version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [
            dto.fincaId,
            dto.rolId,
            dto.nombre,
            dto.apellidos,
            dto.cedula,
            dto.telefono,
            dto.email,
            dto.tipoColaborador,
            id,
            grupoDatos,
        ]
    );
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Borrado logico del colaborador.

    Parametros:
    - id:         ID del colaborador.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El colaborador antes de ser desactivado, o null si no existe.
    */
    const colaborador = await findById(id, grupoDatos);
    if (!colaborador) return null;

    await pool.query(
        `UPDATE colaboradores
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return colaborador;
}