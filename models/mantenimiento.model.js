/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimiento.model.js
Autor: Marco Vásquez
Fecha: 28/07/2026
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
        codigoTicket:           fila.codigo_ticket,
        equipoId:               fila.equipo_id,
        creadoPorUsuarioId:     fila.creado_por_usuario_id,
        creadoPorColaboradorId: fila.creado_por_colaborador_id,
        fechaMantenimiento:     fila.fecha_mantenimiento,
        tituloTicket:           fila.titulo_ticket,
        descripcionTicket:      fila.descripcion_ticket,
        tipoPersonal:           fila.tipo_personal,
        costoManoObra:          fila.costo_mano_obra,
        costoProductos:         fila.costo_productos,
        costoTotalEstimado:     fila.costo_total_estimado,
        estadoTicket:           fila.estado_ticket,
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
    - id:         ID del ticket.
    - grupoDatos: Grupo de datos del usuario en sesion.

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
    costoProductos inicia en 0 y se recalcula cuando se
    agregan productos via mantenimientoProducto.controller.

    Parametros:
    - dto:        Objeto MantenimientoDTO con los datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El ticket recien creado.
    */
    const [result] = await pool.query(
        `INSERT INTO mantenimiento_equipo
         (grupo_datos, codigo_ticket, equipo_id, creado_por_usuario_id,
          creado_por_colaborador_id, fecha_mantenimiento, titulo_ticket,
          descripcion_ticket, tipo_personal, costo_mano_obra,
          costo_productos, costo_total_estimado, estado_ticket)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
            grupoDatos,
            dto.codigoTicket,
            dto.equipoId,
            dto.creadoPorUsuarioId,
            dto.creadoPorColaboradorId,
            dto.fechaMantenimiento,
            dto.tituloTicket,
            dto.descripcionTicket,
            dto.tipoPersonal,
            dto.costoManoObra,
            dto.costoManoObra,
            dto.estadoTicket,
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un ticket de mantenimiento e incrementa version.
    codigoTicket no se puede modificar.
    costoProductos no se toca aqui — lo maneja recalcularCostos.

    Parametros:
    - id:         ID del ticket.
    - dto:        Objeto MantenimientoDTO con los nuevos datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El ticket actualizado o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE mantenimiento_equipo
         SET equipo_id = ?, fecha_mantenimiento = ?, titulo_ticket = ?,
             descripcion_ticket = ?, tipo_personal = ?, costo_mano_obra = ?,
             costo_total_estimado = costo_productos + ?,
             estado_ticket = ?, version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [
            dto.equipoId,
            dto.fechaMantenimiento,
            dto.tituloTicket,
            dto.descripcionTicket,
            dto.tipoPersonal,
            dto.costoManoObra,
            dto.costoManoObra,
            dto.estadoTicket,
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
    Borrado logico del ticket.

    Parametros:
    - id:         ID del ticket.
    - grupoDatos: Grupo de datos del usuario en sesion.

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

export async function recalcularCostos(mantenimientoId, grupoDatos) {
    /*
    Descripcion:
    Recalcula costo_productos y costo_total_estimado del ticket
    sumando los subtotales de sus productos vinculados activos.
    Llamado automaticamente desde mantenimientoProducto.controller
    tras agregar, actualizar o eliminar un producto.

    Parametros:
    - mantenimientoId: ID del ticket a recalcular.
    - grupoDatos:      Grupo de datos del usuario en sesion.

    Retorna:
    - No retorna valor.
    */
    await pool.query(
        `UPDATE mantenimiento_equipo m
         SET m.costo_productos = (
             SELECT COALESCE(SUM(p.subtotal), 0)
             FROM mantenimiento_equipo_productos p
             WHERE p.mantenimiento_equipo_id = m.id
             AND p.activo = TRUE AND p.deleted_at IS NULL
         ),
         m.costo_total_estimado = m.costo_mano_obra + (
             SELECT COALESCE(SUM(p.subtotal), 0)
             FROM mantenimiento_equipo_productos p
             WHERE p.mantenimiento_equipo_id = m.id
             AND p.activo = TRUE AND p.deleted_at IS NULL
         ),
         m.version = m.version + 1
         WHERE m.id = ? AND m.grupo_datos = ?`,
        [mantenimientoId, grupoDatos]
    );
}