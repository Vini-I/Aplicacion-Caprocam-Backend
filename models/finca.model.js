/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantFinca.model.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Capa de datos del modulo de finca.
Por ahora trabaja con datos mock.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

// IMPORT DTO
import { FincaDTO } from "../dtos/finca.dto.js";

//IMPORT DE CONEXION DE BASE DE DATOS
import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todos los registros de fincas.

    Parametros:
    - Ninguno

    Retorna:
    - Un arreglo con todos los registros de fincas.
    */

    const [rows] = await pool.execute(
        `SELECT
            id,
            codigo_cbo AS codigoCBO,
            nombre_finca AS nombreFinca,
            provincia,
            canton,
            distrito,
            otras_senas AS otrasSenas,
            propietario_responsable AS propietarioResponsable,
            telefono,
            area_total AS areaTotal,
            espejos_agua AS espejosAgua
        FROM fincas
        WHERE grupo_datos = ?
        AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return rows;
}

export async function findByIdCBO(codigo_cbo, grupoDatos) {
    /*
    Descripcion:
    Obtiene un registro de finca por su ID CBO.

    Parametros:
    - codigo_cbo: ID CBO de la finca a buscar.

    Retorna:
    - El registro de finca encontrado, o null si no se encuentra.
    */
    const [rows] = await pool.execute(
        `SELECT
            id,
            codigo_cbo AS codigoCBO,
            nombre_finca AS nombreFinca,
            provincia,
            canton,
            distrito,
            otras_senas AS otrasSenas,
            propietario_responsable AS propietarioResponsable,
            telefono,
            area_total AS areaTotal,
            espejos_agua AS espejosAgua
        FROM fincas
        WHERE codigo_cbo = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL`,
        [codigo_cbo, grupoDatos]
    );
    return rows[0] || null;
}

export async function create(dto) {
    /*
    Descripcion:
    Crea un nuevo registro de finca.

    Parametros:
    - dto: Objeto con los datos de la finca a crear. 

    Retorna:
    - El registro de finca creado.
    */
    await pool.execute(
        `INSERT INTO fincas (
            codigo_cbo,
            grupo_datos,    
            nombre_finca,
            provincia,
            canton,
            distrito,
            otras_senas,
            propietario_responsable,
            telefono,
            area_total,
            espejos_agua
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [
            dto.codigoCBO,
            dto.grupoDatos,
            dto.nombreFinca,
            dto.provincia,
            dto.canton,
            dto.distrito,
            dto.otrasSenas,
            dto.propietarioResponsable,
            dto.telefono,
            dto.areaTotal,
            dto.espejosAgua
        ]
    );
    return await findByIdCBO(dto.codigoCBO, dto.grupoDatos);
}

export async function update(codigoCBO, grupoDatos, dto){
    /*
    Descripcion:
    Actualiza un registro de finca existente.

    Parametros:
    - codigoCBO: ID CBO de la finca a actualizar.
    - dto: Objeto con los datos de la finca a actualizar.

    Retorna:
    - El registro de finca actualizado, o null si no se encuentra.
    */

    await pool.execute(
        `UPDATE fincas  
        SET
            grupo_datos=?,
            nombre_finca=?,
            provincia=?,
            canton=?,
            distrito=?,
            otras_senas=?,
            propietario_responsable=?,
            telefono=?,
            area_total=?,
            espejos_agua=?
        WHERE codigo_cbo=?`,
        [
            grupoDatos,
            dto.nombreFinca,
            dto.provincia,
            dto.canton,
            dto.distrito,
            dto.otrasSenas,
            dto.propietarioResponsable,
            dto.telefono,
            dto.areaTotal,
            dto.espejosAgua,
            codigoCBO
        ]
    );
    return await findByIdCBO(codigoCBO, grupoDatos);
}

export async function remove(codigoCBO, grupoDatos){
    /*
    Descripcion:
    Elimina un registro de finca existente.

    Parametros:
    - codigoCBO: Codigo CBO de la finca a eliminar.

    Retorna:
    - El registro de finca eliminado, o null si no se encuentra.
    */

    const finca=await findByIdCBO(codigoCBO, grupoDatos);

    if(!finca){
        return null;
    }

    await pool.execute(
        `UPDATE fincas
        SET deleted_at = NOW()
        WHERE codigo_cbo = ?
        AND grupo_datos = ?`,
        [codigoCBO, grupoDatos]
    );
    return finca;
}