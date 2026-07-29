/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: fisicoQuimica.model.js
Autor: Samuel Cerdas
Fecha: 27/07/2026
Modulo: Fisico Quimica
Descripcion:
Capa de datos del modulo de fisico quimica.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener,
crear, actualizar y eliminar logicamente las lecturas
fisico quimicas.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos.
*/

import pool from '../config/database.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todas las lecturas fisico quimicas activas
    pertenecientes al grupo de datos recibido.

    Parametros:
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - Lista de lecturas fisico quimicas.
    */
    const grupoNormalizado = normalizarGrupoDatos(grupoDatos);
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
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY id DESC
        `,
        [grupoNormalizado]
    );

    return mapearLista(rows);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca una lectura fisico quimica activa por su ID y
    grupo de datos.

    Parametros:
    - id: Identificador de la lectura.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura encontrada.
    - null si no existe o fue eliminada logicamente.
    */
    const grupoNormalizado = normalizarGrupoDatos(grupoDatos);
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
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [id, grupoNormalizado]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta una nueva lectura fisico quimica dentro del
    grupo de datos recibido.

    Parametros:
    - dto: Objeto FisicoQuimicaDTO.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura creada.
    */
    const grupoNormalizado = normalizarGrupoDatos(grupoDatos);
    const [result] = await pool.execute(
        `
        INSERT INTO fisico_quimico (
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
            grupoNormalizado,
            dto.fincaId,
            dto.estanqueId,
            dto.fecha,
            serializarMediciones(dto.ph),
            serializarMediciones(dto.salinidad),
            serializarMediciones(dto.temperatura),
            serializarMediciones(dto.oxigenoDisuelto)
        ]
    );

    return findById(result.insertId, grupoNormalizado);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza una lectura fisico quimica por su ID y grupo
    de datos.

    Parametros:
    - id: Identificador de la lectura.
    - dto: Objeto FisicoQuimicaDTO.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura actualizada.
    - null si no existe.
    */
    const grupoNormalizado = normalizarGrupoDatos(grupoDatos);
    const actual = await findById(id, grupoNormalizado);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE fisico_quimico
        SET
            finca_id = ?,
            estanque_id = ?,
            fecha_registro = ?,
            ph = ?,
            salinidad = ?,
            temperatura = ?,
            oxigeno = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            dto.fincaId,
            dto.estanqueId,
            dto.fecha,
            serializarMediciones(dto.ph),
            serializarMediciones(dto.salinidad),
            serializarMediciones(dto.temperatura),
            serializarMediciones(dto.oxigenoDisuelto),
            id,
            grupoNormalizado
        ]
    );

    return findById(id, grupoNormalizado);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente una lectura fisico quimica por su
    ID y grupo de datos.

    Parametros:
    - id: Identificador de la lectura.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - La lectura eliminada logicamente.
    - null si no existe.
    */
    const grupoNormalizado = normalizarGrupoDatos(grupoDatos);
    const actual = await findById(id, grupoNormalizado);

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
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [id, grupoNormalizado]
    );

    return actual;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene las funciones internas de mapeo, normalizacion
y serializacion utilizadas por el modelo.
*/

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
    Convierte una fila de MySQL al formato camelCase
    utilizado por el backend y el frontend.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto de lectura fisico quimica.
    */
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        fecha: normalizarFecha(row.fecha_registro),
        ph: normalizarMediciones(row.ph),
        salinidad: normalizarMediciones(row.salinidad),
        temperatura: normalizarMediciones(row.temperatura),
        oxigenoDisuelto: normalizarMediciones(row.oxigeno),
        activo: Boolean(row.activo),
        creadoEn: row.fecha_creacion,
        actualizadoEn: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function normalizarGrupoDatos(valor) {
    /*
    Descripcion:
    Valida y convierte el grupo de datos recibido desde
    el token JWT.

    Parametros:
    - valor: Grupo de datos recibido.

    Retorna:
    - Numero entero correspondiente al grupo de datos.

    Excepciones:
    - Error si el grupo de datos no es valido.
    */
    const grupoDatos = Number(valor);

    if (!Number.isInteger(grupoDatos) || grupoDatos <= 0) {
        throw new Error('El grupoDatos del usuario es obligatorio.');
    }

    return grupoDatos;
}

function normalizarFecha(valor) {
    /*
    Descripcion:
    Convierte una fecha de MySQL al formato YYYY-MM-DD.

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

    return String(valor).slice(0, 10);
}

function normalizarMediciones(valor) {
    /*
    Descripcion:
    Convierte el contenido JSON de MySQL en un arreglo de
    mediciones utilizado por el frontend.

    Parametros:
    - valor: Valor recibido desde MySQL.

    Retorna:
    - Arreglo de mediciones.
    */
    if (Array.isArray(valor)) {
        return valor;
    }

    if (typeof valor === 'string') {
        const mediciones = JSON.parse(valor);

        if (Array.isArray(mediciones)) {
            return mediciones;
        }
    }

    return [];
}

function serializarMediciones(mediciones) {
    /*
    Descripcion:
    Convierte un arreglo de mediciones al formato JSON
    requerido para almacenarlo en MySQL.

    Parametros:
    - mediciones: Arreglo de mediciones.

    Retorna:
    - Cadena JSON con las mediciones.
    */
    return JSON.stringify(mediciones);
}