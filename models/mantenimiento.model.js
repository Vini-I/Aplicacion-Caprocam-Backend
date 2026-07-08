/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.model.js
Autor: Marco Vásquez
Fecha: 04/07/2026
Modulo: Mantenimientos
Descripcion:
Capa de datos del modulo de mantenimientos.
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

Todas las funciones principales dependen de mapearMantenimiento().
*/

function mapearMantenimiento(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto mantenimiento en camelCase.
    */
    return {
        id:                     fila.id,
        uuid:                   fila.uuid,
        grupoDatos:             fila.grupo_datos,
        equipoId:               fila.equipo_id,
        creadoPorColaboradorId: fila.creado_por_colaborador_id,
        tituloTicket:           fila.titulo_ticket,
        descripcionTicket:      fila.descripcion_ticket,
        estadoTicket:           fila.estado_ticket,
        estadoEquipo:           fila.estado_equipo,
        fechaCreacion:          fila.fecha_creacion,
        fechaActualizacion:     fila.fecha_actualizacion,
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
    Obtiene todos los tickets de mantenimiento activos del grupo.

    Parametros:
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de mantenimientos mapeados a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT * FROM mantenimiento_equipo
         WHERE grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearMantenimiento);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un ticket de mantenimiento por ID dentro del grupo.

    Parametros:
    - id:          ID del ticket.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El ticket encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT * FROM mantenimiento_equipo
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearMantenimiento(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un nuevo ticket de mantenimiento en la DB.

    Parametros:
    - dto:         Objeto MantenimientoDTO con los datos.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El ticket recien creado.
    */
    const [result] = await pool.query(
        `INSERT INTO mantenimiento_equipo
         (grupo_datos, equipo_id, creado_por_colaborador_id, titulo_ticket,
          descripcion_ticket, estado_ticket, estado_equipo)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            grupoDatos,
            dto.equipoId,
            dto.creadoPorColaboradorId,
            dto.tituloTicket,
            dto.descripcionTicket,
            dto.estadoTicket,
            dto.estadoEquipo,
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un ticket de mantenimiento e incrementa version.

    Parametros:
    - id:          ID del ticket.
    - dto:         Objeto MantenimientoDTO con los nuevos datos.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El ticket actualizado o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE mantenimiento_equipo
         SET equipo_id = ?, titulo_ticket = ?, descripcion_ticket = ?,
             estado_ticket = ?, estado_equipo = ?, version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [
            dto.equipoId,
            dto.tituloTicket,
            dto.descripcionTicket,
            dto.estadoTicket,
            dto.estadoEquipo,
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
    Borrado logico del ticket. No elimina el registro.

    Parametros:
    - id:          ID del ticket.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El ticket antes de ser desactivado, o null si no existe.
    */
    const mantenimiento = await findById(id, grupoDatos);
    if (!mantenimiento) return null;

    await pool.query(
        `UPDATE mantenimiento_equipo
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return mantenimiento;
}