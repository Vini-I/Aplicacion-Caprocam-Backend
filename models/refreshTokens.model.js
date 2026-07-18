/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: refreshTokens.model.js
Autor: Marco Vásquez
Fecha: 15/07/2026
Modulo: Auth
Descripcion:
Capa de datos para refresh tokens.
Maneja persistencia, busqueda e invalidacion de tokens
en la tabla refresh_tokens.
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
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function guardar(refreshToken, expiraEn, usuarioId = null, colaboradorId = null) {
    /*
    Descripcion:
    Persiste un nuevo Refresh Token en la DB.

    Parametros:
    - refreshToken:  String del token generado.
    - expiraEn:      Date con la fecha de expiracion.
    - usuarioId:     ID del usuario web (opcional).
    - colaboradorId: ID del colaborador movil (opcional).

    Retorna:
    - No retorna valor.
    */
    await pool.query(
        `INSERT INTO refresh_tokens (usuario_id, colaborador_id, token, expira_en)
         VALUES (?, ?, ?, ?)`,
        [usuarioId, colaboradorId, refreshToken, expiraEn]
    );
}

export async function buscar(refreshToken) {
    /*
    Descripcion:
    Busca un Refresh Token activo y no expirado.

    Parametros:
    - refreshToken: String del token a buscar.

    Retorna:
    - El registro encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT * FROM refresh_tokens
         WHERE token = ? AND activo = TRUE AND expira_en > NOW() AND deleted_at IS NULL`,
        [refreshToken]
    );
    return filas.length > 0 ? filas[0] : null;
}

export async function eliminar(refreshToken) {
    /*
    Descripcion:
    Invalida un Refresh Token mediante borrado logico.

    Parametros:
    - refreshToken: String del token a invalidar.

    Retorna:
    - No retorna valor.
    */
    await pool.query(
        `UPDATE refresh_tokens
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE token = ?`,
        [refreshToken]
    );
}