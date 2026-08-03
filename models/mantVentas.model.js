/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.model.js
Autor: Greivin Arguedas
Fecha: 01/08/2026
Modulo: Ventas
Descripcion:
Capa de datos del modulo de ventas.
Por ahora trabaja con datos mock.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/
import { mantVentaDTO } from '../dtos/mantVentas.dto.js';

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todos los registros de ventas.

    Parametros:
    - grupoDatos: Identificador del grupo de datos para filtrar los registros

    Retorna:
    - Un arreglo con todos los registros de ventas.
    */

    const [rows] = await pool.execute(
        `SELECT
            id,
            grupo_datos AS grupoDatos,
            finca_id AS finca,
            estanque_id AS estanque,
            colaborador_id AS colaborador,
            comprador_id AS comprador,
            peso_promedio AS pesoPromedio,
            tamano_promedio AS tamanoPromedio,
            cantidad_vendida AS cantVendida,
            precio_kilo AS precioKilo,
            total,
            fecha,
            creado_por_usuario_id AS creadoPorUsuarioId,
            creado_por_colaborador_id AS creadoPorColaboradorId
        FROM ventas
        WHERE grupo_datos = ?
        AND deleted_at IS NULL`,
        [grupoDatos]
    );

    return rows;
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Obtiene un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a buscar
    - grupoDatos: Identificador del grupo de datos para filtrar los registros

    Retorna:
    - El registro de ventas si se encuentra, o null si no existe.
    */
    const [rows] = await pool.execute(
        `SELECT
            id,
            grupo_datos AS grupoDatos,
            finca_id AS finca,
            estanque_id AS estanque,
            colaborador_id AS colaborador,
            comprador_id AS comprador,
            peso_promedio AS pesoPromedio,
            tamano_promedio AS tamanoPromedio,
            cantidad_vendida AS cantVendida,
            precio_kilo AS precioKilo,
            total,
            fecha,
            creado_por_usuario_id AS creadoPorUsuarioId,
            creado_por_colaborador_id AS creadoPorColaboradorId
        FROM ventas
        WHERE id = ? 
        AND grupo_datos = ?
        AND deleted_at IS NULL`,
        [id, grupoDatos]

    );

    return rows[0] || null;
}

export async function create(dto) {
    /*
    Descripcion:
    Crea un nuevo registro de ventas.

    Parametros:
    - dto: Objeto de tipo mantVentaDTO con los datos del nuevo registro

    Retorna:
    - El registro de ventas creado
    */

    const [result] = await pool.execute(
        `INSERT INTO ventas (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            comprador_id,
            peso_promedio,
            tamano_promedio,
            cantidad_vendida,
            precio_kilo,
            total,
            fecha,
            creado_por_usuario_id,
            creado_por_colaborador_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
        [
            dto.grupoDatos,
            dto.finca,
            dto.estanque,
            dto.colaborador,
            dto.comprador,
            dto.pesoPromedio,
            dto.tamanoPromedio,
            dto.cantVendida,
            dto.precioKilo,
            dto.total,
            dto.fecha,
            dto.creadoPorUsuarioId,
            dto.creadoPorColaboradorId
        ]
    ); 

    return await findById(result.insertId, dto.grupoDatos);
}

export async function update(id, grupoDatos, dto) {
    /*
    Descripcion:
    Actualiza un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a actualizar
    - grupoDatos: Identificador del grupo de datos para filtrar los registros
    - dto: Objeto de tipo mantVentaDTO con los nuevos datos

    Retorna:
    - El registro de ventas actualizado si se encuentra, o null si no existe.
    */
    const [result] = await pool.execute(
        `UPDATE ventas
        SET
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            comprador_id = ?,
            peso_promedio = ?,
            tamano_promedio = ?,
            cantidad_vendida = ?,
            precio_kilo = ?,
            total = ?,
            fecha = ?
        WHERE id = ?
        AND grupo_datos = ?`,
        [
            dto.finca,
            dto.estanque,
            dto.colaborador,
            dto.comprador,
            dto.pesoPromedio,
            dto.tamanoPromedio,
            dto.cantVendida,
            dto.precioKilo,
            dto.total,
            dto.fecha,
            id,
            grupoDatos
        ]
    );

    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a eliminar
    - grupoDatos: Identificador del grupo de datos para filtrar los registros

    Retorna:
    - El registro de ventas eliminado si se encuentra, o null si no existe.
    */
   const venta = await findById(id, grupoDatos);

   if(!venta)return null;

   await pool.query(
        `UPDATE ventas
        SET deleted_at=NOW()
        WHERE id = ?
        AND grupo_datos = ?`,
        [id, grupoDatos]
   );
   return venta; 
}