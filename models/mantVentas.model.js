/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantVentas.model.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
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

export async function findAll() {
    /*
    Descripcion:
    Obtiene todos los registros de ventas.

    Parametros:
    - Ninguno

    Retorna:
    - Un arreglo con todos los registros de ventas.
    */

    const [rows] = await pool.execute(
        `SELECT
            id,
            finca_id,
            estanque_id,
            colaborador_id,
            comprador_id,
            peso_promedio,
            tamano_promedio,
            cantidad_vendida,
            precio_kilo,
            total,
            fecha
        FROM ventas
        WHERE deleted_at IS NULL`
    );

    return rows;
}

export async function findById(id) {
    /*
    Descripcion:
    Obtiene un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a buscar

    Retorna:
    - El registro de ventas si se encuentra, o null si no existe.
    */
    const [rows] = await pool.execute(
        `SELECT
            id,
            finca_id,
            estanque_id,
            colaborador_id,
            comprador_id,
            peso_promedio,
            tamano_promedio,
            cantidad_vendida,
            precio_kilo,
            total,
            fecha
        FROM ventas
        WHERE id=? 
        AND deleted_at IS NULL`,
        [id]

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
            fecha 
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, 
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
            dto.fecha
        ]
    ); 

    return await findById(result.insertId);
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a actualizar
    - dto: Objeto de tipo mantVentaDTO con los nuevos datos

    Retorna:
    - El registro de ventas actualizado si se encuentra, o null si no existe.
    */
   const [result] = await pool.execute(
        `UPDATE ventas
        SET
            grupo_datos=?,
            finca_id=?,
            estanque_id=?,
            colaborador_id=?,
            comprador_id=?,
            peso_promedio=?,
            tamano_promedio=?,
            cantidad_vendida=?,
            precio_kilo=?,
            total=?,
            fecha=?
        WHERE id=?`,
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
            id
        ]
   );
   
   return await findById(id);
}

export async function remove(id) {
    /*
    Descripcion:
    Elimina un registro de ventas por su ID.

    Parametros:
    - id: ID del registro de ventas a eliminar

    Retorna:
    - El registro de ventas eliminado si se encuentra, o null si no existe.
    */
   const venta = await findById(id);

   if(!venta){
    return null;
   }

   await pool.execute(
        `DELETE FROM ventas
        WHERE id=?`,
        [id]
   )
   return venta; 
}