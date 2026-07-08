/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loginUsuarios.model.js
Autor: Rodolfo Chaves
Fecha: 28/06/2026
Modulo: Login
Descripcion:
Capa de datos del modulo de login para usuarios y
colaboradores.
Trabaja con las tablas reales de MySQL.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de login para usuarios.
*/
export async function findUsuarioByIdentificador(identificador) {
    /*
    Descripcion:
    Busca un usuario por su campo identificador.
    Usado en el login web donde el admin puede ingresar
    con su identificador.

    Parametros:
    - identificador: String con el identificador del usuario.

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            rol_id,
            nombre,
            apellidos,
            email,
            nombre_usuario,
            password_hash,
            telefono,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM usuarios
        WHERE deleted_at IS NULL
          AND activo = TRUE
          AND (
                LOWER(TRIM(nombre_usuario)) = LOWER(TRIM(?))
             OR LOWER(TRIM(email)) = LOWER(TRIM(?))
          )
        LIMIT 1
        `,
        [identificador, identificador]
    );

    return rows.length === 0 ? null : mapearUsuario(rows[0]);
}

export async function findUsuarioById(id) {
    /*
    Descripcion:
    Busca un usuario por su ID numerico.

    Parametros:
    - id: ID del usuario (numero o string numerico).

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            rol_id,
            nombre,
            apellidos,
            email,
            nombre_usuario,
            password_hash,
            telefono,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM usuarios
        WHERE id = ?
          AND deleted_at IS NULL
          AND activo = TRUE
        LIMIT 1
        `,
        [id]
    );

    return rows.length === 0 ? null : mapearUsuario(rows[0]);
}

export async function findUsuarioByCorreo(correo) {
     /*
    Descripcion:
    Busca un usuario por su correo electronico.
    Usada para validar unicidad al registrar un admin.

    Parametros:
    - correo: String con el correo a buscar.

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `
        SELECT id
        FROM usuarios
        WHERE deleted_at IS NULL
          AND activo = TRUE
          AND LOWER(TRIM(email)) = LOWER(TRIM(?))
        LIMIT 1
        `,
        [correo]
    );

    return rows.length === 0 ? null : rows[0];
}

export async function findUsuarioByNombreUsuario(nombreUsuario) {
    /*
    Descripcion:
    Busca un usuario por su nombre de usuario.
    Usada para validar unicidad al registrar un admin.

    Parametros:
    - usuario: String con el nombre de usuario a buscar.

    Retorna:
    - El objeto usuario si existe, o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `
        SELECT id
        FROM usuarios
        WHERE deleted_at IS NULL
          AND activo = TRUE
          AND LOWER(TRIM(nombre_usuario)) = LOWER(TRIM(?))
        LIMIT 1
        `,
        [nombreUsuario]
    );

    return rows.length === 0 ? null : rows[0];
}

export async function createUsuario(dto) {
    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);

    const [result] = await pool.execute(
        `
        INSERT INTO usuarios (
            grupo_datos,
            rol_id,
            nombre,
            apellidos,
            email,
            nombre_usuario,
            password_hash,
            telefono
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.rolId,
            dto.nombre,
            dto.apellidos,
            dto.email,
            dto.nombreUsuario,
            dto.passwordHash,
            dto.telefono ?? null
        ]
    );

    return await findUsuarioById(result.insertId);
}

export async function findColaboradorById(id) {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            rol_id,
            nombre,
            apellidos,
            telefono,
            email,
            nombre_usuario,
            pin_hash,
            tipo_colaborador,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM colaboradores
        WHERE id = ?
          AND deleted_at IS NULL
          AND activo = TRUE
        LIMIT 1
        `,
        [id]
    );

    return rows.length === 0 ? null : mapearColaborador(rows[0]);
}

export async function findColaboradorByNombreUsuario(nombreUsuario) {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            rol_id,
            nombre,
            apellidos,
            telefono,
            email,
            nombre_usuario,
            pin_hash,
            tipo_colaborador,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM colaboradores
        WHERE deleted_at IS NULL
          AND activo = TRUE
          AND LOWER(TRIM(nombre_usuario)) = LOWER(TRIM(?))
        LIMIT 1
        `,
        [nombreUsuario]
    );

    return rows.length === 0 ? null : mapearColaborador(rows[0]);
}

export async function createColaborador(dto) {
    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);

    const [result] = await pool.execute(
        `
        INSERT INTO colaboradores (
            grupo_datos,
            finca_id,
            rol_id,
            nombre,
            apellidos,
            telefono,
            email,
            nombre_usuario,
            pin_hash,
            tipo_colaborador
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.fincaId ?? null,
            dto.rolId,
            dto.nombre,
            dto.apellidos,
            dto.telefono ?? null,
            dto.email ?? null,
            dto.nombreUsuario,
            dto.pinHash,
            dto.tipoColaborador ?? "external_collab"
        ]
    );

    return await findColaboradorById(result.insertId);
}

export async function findAllColaboradores() {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            rol_id,
            nombre,
            apellidos,
            telefono,
            email,
            nombre_usuario,
            pin_hash,
            tipo_colaborador,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM colaboradores
        WHERE deleted_at IS NULL
          AND activo = TRUE
        ORDER BY id DESC
        `
    );

    return rows.map(mapearColaborador);
}

function mapearUsuario(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        rolId: row.rol_id,
        nombre: row.nombre,
        apellidos: row.apellidos,
        email: row.email,
        correo: row.email,
        nombreUsuario: row.nombre_usuario,
        usuario: row.nombre_usuario,
        passwordHash: row.password_hash,
        telefono: row.telefono,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function mapearColaborador(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        rolId: row.rol_id,
        nombre: row.nombre,
        apellidos: row.apellidos,
        telefono: row.telefono,
        email: row.email,
        correo: row.email,
        nombreUsuario: row.nombre_usuario,
        usuario: row.nombre_usuario,
        pinHash: row.pin_hash,
        tipoColaborador: row.tipo_colaborador,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function obtenerGrupoDatos(valor) {
    if (valor === undefined || valor === null || String(valor).trim() === "") {
        return 1;
    }

    return Number(valor);
}
