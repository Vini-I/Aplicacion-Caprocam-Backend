/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantenimientoProducto.model.js
Autor: Marco Vásquez
Fecha: 22/07/2026
Modulo: MantenimientoProductos
Descripcion:
Capa de datos para mantenimiento_equipo_productos.
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

Todas las funciones principales dependen de mapearMantenimientoProducto().
*/

function mapearMantenimientoProducto(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto mantenimientoProducto en camelCase.
    */
    return {
        id:                    fila.id,
        uuid:                  fila.uuid,
        grupoDatos:            fila.grupo_datos,
        mantenimientoEquipoId: fila.mantenimiento_equipo_id,
        productoId:            fila.producto_id,
        cantidad:              fila.cantidad,
        costoUnitario:         fila.costo_unitario,
        subtotal:              fila.subtotal,
        fechaCreacion:         fila.fecha_creacion,
        fechaActualizacion:    fila.fecha_actualizacion,
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findByMantenimiento(mantenimientoId, grupoDatos) {
    /*
    Descripcion:
    Obtiene todos los productos de un ticket de mantenimiento.

    Parametros:
    - mantenimientoId: ID del ticket de mantenimiento.
    - grupoDatos:      Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de productos del mantenimiento.
    */
    const [filas] = await pool.query(
        `SELECT * FROM mantenimiento_equipo_productos
         WHERE mantenimiento_equipo_id = ? AND grupo_datos = ?
         AND activo = TRUE AND deleted_at IS NULL`,
        [mantenimientoId, grupoDatos]
    );
    return filas.map(mapearMantenimientoProducto);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro por su ID dentro del grupo.

    Parametros:
    - id:         ID del registro.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT * FROM mantenimiento_equipo_productos
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearMantenimientoProducto(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Vincula un producto a un ticket de mantenimiento.

    Parametros:
    - dto:        Objeto MantenimientoProductoDTO con los datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro recien creado.
    */
    const [result] = await pool.query(
        `INSERT INTO mantenimiento_equipo_productos
         (grupo_datos, mantenimiento_equipo_id, producto_id, cantidad, costo_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            grupoDatos,
            dto.mantenimientoEquipoId,
            dto.productoId,
            dto.cantidad,
            dto.costoUnitario,
            dto.subtotal,
        ]
    );
    return findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza cantidad, costo y subtotal de un producto en un mantenimiento.

    Parametros:
    - id:         ID del registro.
    - dto:        Objeto MantenimientoProductoDTO con los nuevos datos.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro actualizado o null si no existe.
    */
    const [result] = await pool.query(
        `UPDATE mantenimiento_equipo_productos
         SET cantidad = ?, costo_unitario = ?, subtotal = ?, version = version + 1
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [dto.cantidad, dto.costoUnitario, dto.subtotal, id, grupoDatos]
    );
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Borrado logico del vinculo producto-mantenimiento.

    Parametros:
    - id:         ID del registro.
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - El registro antes de ser desactivado, o null si no existe.
    */
    const registro = await findById(id, grupoDatos);
    if (!registro) return null;

    await pool.query(
        `UPDATE mantenimiento_equipo_productos
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return registro;
}