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

/*
//////////////////////////////////////////////////////////
FUNCIONES DE INVENTARIO
//////////////////////////////////////////////////////////
*/

async function registrarMovimientoInventario(connection, {
    grupoDatos,
    productoId,
    tipoMovimiento,
    cantidad,
    observacion,
    creadoPorUsuarioId,
    creadoPorColaboradorId,
}) {
    const cantidadMovimiento = Number(cantidad);

    if (Number.isNaN(cantidadMovimiento) || cantidadMovimiento <= 0) {
        const err = new Error(
            'La cantidad del movimiento de inventario debe ser mayor que cero.'
        );
        err.status = 422;
        throw err;
    }

    const [rows] = await connection.query(
        `SELECT i.id, i.cantidad, p.nombre AS nombre_producto
         FROM inventario i
         LEFT JOIN productos p ON i.producto_id = p.id
         WHERE i.producto_id = ?
           AND i.grupo_datos = ?
           AND i.activo = TRUE
           AND i.deleted_at IS NULL
         LIMIT 1
         FOR UPDATE`,
        [productoId, grupoDatos]
    );

    if (!rows.length) {
        const err = new Error(
            'No existe un registro de inventario activo para el producto seleccionado.'
        );
        err.status = 422;
        throw err;
    }

    const inventario = rows[0];
    const cantidadActual = Number(inventario.cantidad);
    const nombreProd = inventario.nombre_producto || `ID ${productoId}`;

    let cantidadNueva;

    switch (tipoMovimiento) {
        case 'Entrada':
            cantidadNueva = cantidadActual + cantidadMovimiento;
            break;

        case 'Salida':
            cantidadNueva = cantidadActual - cantidadMovimiento;

            if (cantidadNueva < 0) {
                const err = new Error(
                    `No hay suficiente stock para el producto "${nombreProd}". ` +
                    `Disponible: ${cantidadActual}, requerido: ${cantidadMovimiento}.`
                );
                err.status = 409;
                throw err;
            }
            break;

        case 'Ajuste':
            cantidadNueva = cantidadMovimiento;
            break;

        default: {
            const err = new Error(
                `Tipo de movimiento de inventario invalido: ${tipoMovimiento}`
            );
            err.status = 422;
            throw err;
        }
    }

    await connection.query(
        `UPDATE inventario
         SET cantidad = ?, version = version + 1
         WHERE id = ?`,
        [cantidadNueva, inventario.id]
    );

    await connection.query(
        `INSERT INTO movimientos_inventario (
            grupo_datos,
            inventario_id,
            producto_id,
            tipo_movimiento,
            cantidad,
            observacion,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            grupoDatos,
            inventario.id,
            productoId,
            tipoMovimiento,
            cantidadMovimiento,
            observacion ?? null,
            creadoPorUsuarioId ?? null,
            creadoPorColaboradorId ?? null,
        ]
    );

    return {
        inventarioId: inventario.id,
        cantidadAnterior: cantidadActual,
        cantidadNueva,
    };
}

export async function update(id, dto, grupoDatos, contexto = {}) {
    /*
    Descripcion:
    Actualiza un ticket de mantenimiento dentro de una transaccion.
    Si cambia a 'Terminado', descuenta stock de sus productos.
    Si cambia de 'Terminado' a otro estado, revierte el stock (Entrada).
    codigoTicket no se puede modificar.
    costoProductos no se toca aqui — lo maneja recalcularCostos.

    Parametros:
    - id:         ID del ticket.
    - dto:        Objeto MantenimientoDTO con los nuevos datos.
    - grupoDatos: Grupo de datos del usuario en sesion.
    - contexto:   Objeto con creadoPorUsuarioId y creadoPorColaboradorId.

    Retorna:
    - El ticket actualizado o null si no existe.
    */
    const { creadoPorUsuarioId, creadoPorColaboradorId } = contexto;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [filas] = await connection.query(
            `SELECT * FROM mantenimiento_equipo
             WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
             FOR UPDATE`,
            [id, grupoDatos]
        );

        if (filas.length === 0) {
            await connection.rollback();
            return null;
        }

        const actual = mapearMantenimiento(filas[0]);
        const estadoAnterior = actual.estadoTicket;
        const nuevoEstado = dto.estadoTicket;

        // Si cambia a 'Terminado' y antes no estaba 'Terminado': descontar stock
        if (nuevoEstado === 'Terminado' && estadoAnterior !== 'Terminado') {
            const [prods] = await connection.query(
                `SELECT producto_id, cantidad FROM mantenimiento_equipo_productos
                 WHERE mantenimiento_equipo_id = ? AND grupo_datos = ?
                   AND activo = TRUE AND deleted_at IS NULL`,
                [id, grupoDatos]
            );

            for (const prod of prods) {
                await registrarMovimientoInventario(connection, {
                    grupoDatos,
                    productoId: prod.producto_id,
                    tipoMovimiento: 'Salida',
                    cantidad: prod.cantidad,
                    observacion: `Salida automatica por finalizacion de ticket de mantenimiento #${actual.codigoTicket}.`,
                    creadoPorUsuarioId,
                    creadoPorColaboradorId,
                });
            }
        }

        // Si cambia de 'Terminado' a otro estado: revertir stock (Entrada)
        if (estadoAnterior === 'Terminado' && nuevoEstado !== 'Terminado') {
            const [prods] = await connection.query(
                `SELECT producto_id, cantidad FROM mantenimiento_equipo_productos
                 WHERE mantenimiento_equipo_id = ? AND grupo_datos = ?
                   AND activo = TRUE AND deleted_at IS NULL`,
                [id, grupoDatos]
            );

            for (const prod of prods) {
                await registrarMovimientoInventario(connection, {
                    grupoDatos,
                    productoId: prod.producto_id,
                    tipoMovimiento: 'Entrada',
                    cantidad: prod.cantidad,
                    observacion: `Reversion automatica de stock por reapertura de ticket de mantenimiento #${actual.codigoTicket}.`,
                    creadoPorUsuarioId,
                    creadoPorColaboradorId,
                });
            }
        }

        const [result] = await connection.query(
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

        if (result.affectedRows === 0) {
            await connection.rollback();
            return null;
        }

        await connection.commit();
        return findById(id, grupoDatos);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export async function remove(id, grupoDatos, contexto = {}) {
    /*
    Descripcion:
    Borrado logico del ticket dentro de una transaccion.
    Si el ticket estaba 'Terminado', revierte el stock de sus productos.

    Parametros:
    - id:         ID del ticket.
    - grupoDatos: Grupo de datos del usuario en sesion.
    - contexto:   Objeto con creadoPorUsuarioId y creadoPorColaboradorId.

    Retorna:
    - El ticket antes de ser desactivado, o null si no existe.
    */
    const { creadoPorUsuarioId, creadoPorColaboradorId } = contexto;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [filas] = await connection.query(
            `SELECT * FROM mantenimiento_equipo
             WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
             FOR UPDATE`,
            [id, grupoDatos]
        );

        if (filas.length === 0) {
            await connection.rollback();
            return null;
        }

        const mantenimiento = mapearMantenimiento(filas[0]);

        // Si el ticket a eliminar estaba 'Terminado', revertir el stock de sus productos
        if (mantenimiento.estadoTicket === 'Terminado') {
            const [prods] = await connection.query(
                `SELECT producto_id, cantidad FROM mantenimiento_equipo_productos
                 WHERE mantenimiento_equipo_id = ? AND grupo_datos = ?
                   AND activo = TRUE AND deleted_at IS NULL`,
                [id, grupoDatos]
            );

            for (const prod of prods) {
                await registrarMovimientoInventario(connection, {
                    grupoDatos,
                    productoId: prod.producto_id,
                    tipoMovimiento: 'Entrada',
                    cantidad: prod.cantidad,
                    observacion: `Reversion de stock por eliminacion de ticket de mantenimiento #${mantenimiento.codigoTicket}.`,
                    creadoPorUsuarioId,
                    creadoPorColaboradorId,
                });
            }
        }

        await connection.query(
            `UPDATE mantenimiento_equipo
             SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
             WHERE id = ? AND grupo_datos = ?`,
            [id, grupoDatos]
        );

        await connection.commit();
        return mantenimiento;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
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