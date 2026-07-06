/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimico.model.js
Autor: Samuel
Fecha: 05/07/2026
Modulo: Fisico Quimico
Descripcion:
Capa de datos del modulo de fisico quimica.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener,
crear y eliminar logicamente las lecturas
fisico quimicas.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos.
*/

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll() {

     /*
    Descripcion:
    Obtiene todas las lecturas fisico quimicas activas
    registradas en la base de datos.

    Parametros:
    No posee.

    Retorna:
    - Lista de lecturas fisico quimicas.
    */

    const [rows] = await pool.execute (

         `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            ph,
            salinidad,
            temperatura,
            oxigeno,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE deleted_at IS NULL
        AND activo = TRUE
        ORDER BY id DESC
        `

    );

     return mapearLista(rows);
}

export async function findById(id) {
    /*
    Descripcion:
    Busca una lectura fisico quimica activa por su
    identificador numerico.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    - La lectura encontrada.
    - null si no existe o fue eliminada logicamente.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            ph,
            salinidad,
            temperatura,
            oxigeno,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM fisico_quimico
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}


export async function create(dto) {
    /*
    Descripcion:
    Inserta una nueva lectura fisico quimica en la
    base de datos.

    Parametros:
    - dto: Objeto FisicoQuimicaDTO.

    Retorna:
    - La lectura creada.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);

    const [result] = await pool.execute(
        `
        INSERT INTO fisico_quimico(
            grupo_datos,
            finca_id,
            estanque_id,
            fecha_registro,
            ph,
            salinidad,
            temperatura,
            oxigeno
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.fincaId,
            dto.estanqueId,
            dto.fecha,
            dto.ph,
            dto.salinidad,
            dto.temperatura,
            dto.oxigenoDisuelto
        ]
    );

    return await findById(result.insertId);
}


export async function remove(id) {
    /*
    Descripcion:
    Elimina logicamente una lectura fisico quimica.

    Parametros:
    - id: Identificador de la lectura.

    Retorna:
    - La lectura eliminada logicamente.
    - null si no existe.
    */

    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE fisico_quimico
        SET
        activo = FALSE,
        deleted_at = CURRENT_TIMESTAMP,
        version = version + 1
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [id]
    );

    return actual;
}


function mapearLista(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato
    utilizado por el backend.

    Parametros:
    - rows: Filas obtenidas desde MySQL.

    Retorna:
    - Lista de lecturas.
    */

    const resultado = [];

    for (let i = 0; i < rows.length; i++) {
        resultado.push(mapearFila(rows[i]));
    }

    return resultado;
}


function mapearFila(row) {
    /*
    Descripcion:
    Convierte una fila de MySQL al formato utilizado
    por el backend.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto lectura.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        fecha: formatearFecha(row.fecha_registro),
        ph: Number(row.ph),
        salinidad: Number(row.salinidad),
        temperatura: Number(row.temperatura),
        oxigenoDisuelto: Number(row.oxigeno),
        activo: Boolean(row.activo),
        creadoEn: row.fecha_creacion,
        actualizadoEn: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}


function obtenerGrupoDatos(valor) {
    /*
    Descripcion:
    Obtiene el grupo de datos del registro.
    Mientras no exista autenticacion utiliza el grupo 1.

    Parametros:
    - valor: Grupo recibido.

    Retorna:
    - Numero del grupo.
    */

    if (valor === undefined) {
        return 1;
    }

    if (valor === null) {
        return 1;
    }

    if (String(valor).trim() === "") {
        return 1;
    }

    return Number(valor);
}


function formatearFecha(valor) {
    /*
    Descripcion:
    Convierte una fecha de MySQL al formato
    YYYY-MM-DD.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - Fecha formateada.
    */

    if (!valor) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}