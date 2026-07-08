/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.model.js
Autor: Sebastian Villegas Barquero
Fecha: 03/07/2026
Modulo: Raleo
Descripcion:
Capa de datos del modulo de raleo.
Por ahora trabaja con datos mock. Cuando haya DB,
solo este archivo cambia.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

DTOs
*/
import  pool  from '../config/database.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todos los raleos activos desde la base de datos.
    Permite filtrar por finca.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - idFinca: Identificador de la finca.

    Retorna:
    - Lista de raleos encontrados.
    */
    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            fecha,
            porcentaje,
            peso_estimado,
            biomasa_estimada,
            objetivo,
            metodos,
            observaciones,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM raleos
        WHERE deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [];

    if (filtros) {
        if (filtros.idFinca) {
            sql = sql + " AND finca_id = ?";
            params.push(filtros.idFinca);
        }
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);

    return mapearLista(rows);
}

export async function findById(id) {
    /*
    Descripcion:
    Busca un raleo activo por su identificador numerico.

    Parametros:
    - id: Identificador del raleo.

    Retorna:
    - El raleo encontrado.
    - null si no existe o si fue eliminado logicamente.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            fecha,
            porcentaje,
            peso_estimado,
            biomasa_estimada,
            objetivo,
            metodos,
            observaciones,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM raleos
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

export async function findByEstanqueYFecha(grupoDatos, idEstanque, fecha) {
    /*
    Descripcion:
    Busca un raleo activo por estanque y fecha.

    Parametros:
    - idEstanque: Identificador del estanque.
    - fecha: Fecha del raleo.

    Retorna:
    - El raleo encontrado.
    - null si no existe.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            fecha,
            porcentaje,
            peso_estimado,
            biomasa_estimada,
            objetivo,
            metodos,
            observaciones,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM raleos
        WHERE grupo_datos = ?
        AND estanque_id = ?
        AND fecha = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [grupoDatos, idEstanque, fecha]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function create(dto) {
    /*
    Descripcion:
    Inserta un nuevo raleo en la base de datos.

    Parametros:
    - dto: Objeto RaleoDTO con los datos normalizados del raleo.

    Retorna:
    - El raleo creado consultado nuevamente desde la base de datos.
    */
    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);

    const [result] = await pool.execute(
        `
        INSERT INTO raleos (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            fecha,
            porcentaje,
            peso_estimado,
            biomasa_estimada,
            objetivo,
            metodos,
            observaciones
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.idEstanque,
            dto.idColaborador,
            dto.fecha,
            dto.porcentaje,
            dto.pesoEstimado,
            dto.biomasaEstimado,
            dto.objetivo,
            dto.metodo,
            dto.observaciones
        ]
    );

    return await findById(result.insertId);
}

export async function remove(id) {
    /*
    Descripcion:
    Elimina logicamente un raleo.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    Parametros:
    - id: Identificador del raleo que se desea eliminar.

    Retorna:
    - El raleo eliminado logicamente.
    - null si el estanque no existe o ya fue eliminado.
    */
    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE raleos
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
    
    return await findById(id);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas usadas por el modelo.
*/
function mapearFila(row) {
    /*
    Descripcion:
    Convierte una fila de MySQL en un objeto con formato camelCase.
    Tambien convierte tipos de datos como numeros, fechas y booleanos.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto raleo en el formato esperado por el backend/frontend.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        idEstanque: row.estanque_id,
        idColaborador: row.colaborador_id,
        fecha: formatearFecha(row.fecha),
        porcentaje: Number(row.porcentaje),
        pesoEstimado: Number(row.peso_estimado),
        biomasaEstimado: Number(row.biomasa_estimada),
        objetivo: row.objetivo,
        metodo: row.metodos,
        observaciones: row.observaciones,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function formatearFecha(valor) {
    /*
    Descripcion:
    Formatea una fecha recibida desde MySQL para devolverla en
    formato simple YYYY-MM-DD.

    Parametros:
    - valor: Fecha recibida desde MySQL.

    Retorna:
    - Fecha formateada.
    - null si no existe valor.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}

function obtenerGrupoDatos(valor) {
    /*
    Descripcion:
    Obtiene el grupo de datos del registro.
    Si no viene definido, utiliza el grupo 1 como valor temporal
    para pruebas mientras se implementa la autenticacion.

    Parametros:
    - valor: Valor recibido como grupo de datos.

    Retorna:
    - Numero del grupo de datos.
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

function mapearLista(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato usado por
    el backend y el frontend.

    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.

    Retorna:
    - Lista de estanques mapeados.
    */

    const resultado = [];

    for (let i = 0; i < rows.length; i++) {
        resultado.push(mapearFila(rows[i]));
    }

    return resultado;
}

