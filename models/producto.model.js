/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: producto.model.js
Autor: Jose Espinoza
Fecha: 26/07/2026
Modulo: Productos
Descripcion:
Capa de datos del modulo de productos e inventario.
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

function normalizarFecha(fecha) {
    /*
    Descripcion:
    Parsea una fecha a formato YYYY-MM-DD para MySQL.
    Soporta formato ISO (YYYY-MM-DD) y formato latino (DD/MM/YYYY).

    Parametros:
    - fecha: String o Date a formatear.

    Retorna:
    - Fecha en YYYY-MM-DD o null.
    */
    if (!fecha) return null;

    if (typeof fecha === 'string' && fecha.includes('/')) {
        const partes = fecha.split('/');
        if (partes.length === 3) {
            const [dia, mes, anio] = partes;
            fecha = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }
    }

    const d = new Date(fecha);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
}

function mapearProducto(fila) {
    /*
    Descripcion:
    Convierte una fila MySQL (snake_case) a camelCase para el frontend.

    Parametros:
    - fila: Objeto crudo de MySQL.

    Retorna:
    - Objeto producto en camelCase.
    */
    if (!fila) return null;
    return {
        id:                     fila.id,
        codigo:                 fila.codigo || null,
        uuid:                   fila.uuid || null,
        grupoDatos:             fila.grupo_datos,
        proveedorId:            fila.proveedor_id || null,
        nombre:                 fila.nombre,
        categoria:              fila.categoria || null,
        unidad:                 fila.unidad || 'unidades',
        precioUnidad:           fila.precio_unidad ? Number(fila.precio_unidad) : 0,
        cantidad:               fila.cantidad ? Number(fila.cantidad) : 0,
        stockMinimo:            fila.stock_minimo ? Number(fila.stock_minimo) : 0,
        entryDate:              normalizarFecha(fila.fecha_ingreso),
        expirationDate:         normalizarFecha(fila.fecha_caducidad),
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
    Obtiene todos los productos activos del grupo con stock.

    Parametros:
    - grupoDatos: Grupo de datos de la sesion actual.

    Retorna:
    - Lista de productos mapeados a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT 
            p.id AS id, p.codigo, p.uuid, p.grupo_datos, p.proveedor_id,
            p.nombre, p.categoria, p.unidad, p.precio_unidad,
            p.fecha_ingreso, p.fecha_caducidad, p.estado,
            p.creado_por_usuario_id, p.creado_por_colaborador_id,
            COALESCE(i.cantidad, 0) AS cantidad,
            COALESCE(i.stock_minimo, 0) AS stock_minimo
         FROM productos p
         LEFT JOIN inventario i 
           ON p.id = i.producto_id AND i.grupo_datos = ?
         WHERE p.grupo_datos = ? AND p.estado = "ACTIVO" AND p.deleted_at IS NULL`,
        [grupoDatos, grupoDatos]
    );
    return filas.map(mapearProducto);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un producto por ID dentro del grupo.

    Parametros:
    - id:          ID del producto.
    - grupoDatos:  Grupo de datos de la sesion actual.

    Retorna:
    - El producto encontrado o null.
    */
    const [filas] = await pool.query(
        `SELECT 
            p.id AS id, p.codigo, p.uuid, p.grupo_datos, p.proveedor_id,
            p.nombre, p.categoria, p.unidad, p.precio_unidad,
            p.fecha_ingreso, p.fecha_caducidad, p.estado,
            p.creado_por_usuario_id, p.creado_por_colaborador_id,
            COALESCE(i.cantidad, 0) AS cantidad,
            COALESCE(i.stock_minimo, 0) AS stock_minimo
         FROM productos p
         LEFT JOIN inventario i 
           ON p.id = i.producto_id AND i.grupo_datos = ?
         WHERE p.id = ? AND p.grupo_datos = ? AND p.estado = "ACTIVO" AND p.deleted_at IS NULL`,
        [grupoDatos, id, grupoDatos]
    );
    return filas.length > 0 ? mapearProducto(filas[0]) : null;
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un nuevo producto y su saldo en inventario registrando auditoria.

    Parametros:
    - dto:         Objeto DTO con los datos.
    - grupoDatos:  Grupo de datos de la sesion actual.

    Retorna:
    - El producto recien creado.
    */
    const { codigo, proveedorId, nombre, categoria, unidad,
            precioUnidad, cantidad, stockMinimo, entryDate,
            expirationDate, creadoPorUsuarioId, creadoPorColaboradorId } = dto;

    const fechaIng = normalizarFecha(entryDate);
    const fechaExp = normalizarFecha(expirationDate);

    const [resultProducto] = await pool.query(
        `INSERT INTO productos 
            (codigo, grupo_datos, proveedor_id, nombre, categoria,
             unidad, precio_unidad, fecha_ingreso, fecha_caducidad, estado,
             creado_por_usuario_id, creado_por_colaborador_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "ACTIVO", ?, ?)`,
        [
            codigo || null, grupoDatos, proveedorId || null,
            nombre, categoria || null, unidad || 'unidades',
            precioUnidad || 0, fechaIng, fechaExp,
            creadoPorUsuarioId || null, creadoPorColaboradorId || null
        ]
    );

    const productoId = resultProducto.insertId;

    try {
        await pool.query(
            `INSERT INTO inventario 
                (producto_id, proveedor_id, cantidad, stock_minimo, grupo_datos)
             VALUES (?, ?, ?, ?, ?)`,
            [
                productoId, proveedorId || null,
                cantidad || 0, stockMinimo || 0, grupoDatos
            ]
        );
    } catch (invError) {
        console.warn("Aviso al insertar inventario:", invError.message);
    }

    return findById(productoId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un producto existente y sincroniza inventario.

    Parametros:
    - id:          ID del producto.
    - dto:         Objeto DTO con los nuevos datos.
    - grupoDatos:  Grupo de datos de la sesion actual.

    Retorna:
    - El producto actualizado o null si no existe.
    */
    const { codigo, proveedorId, nombre, categoria, unidad,
            precioUnidad, cantidad, stockMinimo, entryDate,
            expirationDate } = dto;

    const fechaIng = normalizarFecha(entryDate);
    const fechaExp = normalizarFecha(expirationDate);

    const [result] = await pool.query(
        `UPDATE productos 
         SET codigo = ?, proveedor_id = ?, nombre = ?,
             categoria = ?, unidad = ?, precio_unidad = ?,
             fecha_ingreso = ?, fecha_caducidad = ?
         WHERE id = ? AND grupo_datos = ? AND estado = "ACTIVO" AND deleted_at IS NULL`,
        [
            codigo || null, proveedorId || null, nombre,
            categoria || null, unidad || 'unidades',
            precioUnidad || 0, fechaIng, fechaExp, id, grupoDatos
        ]
    );

    if (result.affectedRows === 0) return null;

    try {
        await pool.query(
            `UPDATE inventario 
             SET proveedor_id = ?, cantidad = ?, stock_minimo = ?
             WHERE producto_id = ? AND grupo_datos = ?`,
            [
                proveedorId || null, cantidad || 0,
                stockMinimo || 0, id, grupoDatos
            ]
        );
    } catch (invError) {
        console.warn("Aviso al actualizar inventario:", invError.message);
    }

    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Borrado logico del producto. No elimina el registro.

    Parametros:
    - id:          ID del producto.
    - grupoDatos:  Grupo de datos de la sesion actual.

    Retorna:
    - El producto antes de ser desactivado, o null si no existe.
    */
    const producto = await findById(id, grupoDatos);
    if (!producto) return null;

    await pool.query(
        `UPDATE productos 
         SET estado = "INACTIVO", deleted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return producto;
}