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

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene todos los raleos activos del grupo.

    Parametros:
    - grupoDatos: Grupo de datos del usuario en sesion.

    Retorna:
    - Lista de raleos mapeados a camelCase.
    */
    const [filas] = await pool.query(
        `SELECT * FROM raleos
         WHERE grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [grupoDatos]
    );
    return filas.map(mapearFila);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un raleo activo por su ID dentro del grupo.

    Parametros:
    - id: Identificador del raleo.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El raleo encontrado.
    - null si no existe o si fue eliminado logicamente.
    */

    const [filas] = await pool.query(
        `SELECT * FROM raleos
         WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL`,
        [id, grupoDatos]
    );
    return filas.length > 0 ? mapearFila(filas[0]) : null;
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
            creado_por_usuario_id,
            creado_por_colaborador_id,
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

export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un nuevo raleo en la base de datos.

    Parametros:
    - dto: Objeto RaleoDTO con los datos normalizados del raleo.
    - grupoDatos:  Grupo de datos del usuario en sesion.

    Retorna:
    - El raleo creado consultado nuevamente desde la base de datos.
    */
    const [result] = await pool.execute(
        `
        INSERT INTO raleos (
            grupo_datos,
            finca_id,
            estanque_id,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            fecha,
            porcentaje,
            peso_estimado,
            biomasa_estimada,
            objetivo,
            metodos,
            observaciones
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.idEstanque,
            dto.creadoPorUsuarioId,
            dto.creadoPorColaboradorId,
            dto.fecha,
            dto.porcentaje,
            dto.pesoEstimado,
            dto.biomasaEstimado,
            dto.objetivo,
            dto.metodo,
            dto.observaciones
        ]
    );
    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos, idColaborador) {
    /*
    Descripcion:
    Actualiza un raleo existente en la base de datos.
    Tambien incrementa la version del registro para control de cambios.

    Parametros:
    - id: Identificador del raleo que se desea actualizar.
    - dto: Objeto RaleoDTO con los datos actualizados del raleo.
    - grupoDatos: Grupo de datos del usuario en sesion.
    - idColaborador: Colaborador que realizo el raleo (viene del
      body/dto, no de req.user; ver createRaleo en el controller).
      Puede ser null (campo opcional).

    Retorna:
    - El raleo actualizado.
    - null si el raleo no existe, no pertenece al grupo, o fue eliminado logicamente.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE raleos
        SET
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            fecha = ?,
            porcentaje = ?,
            peso_estimado = ?,
            biomasa_estimada = ?,
            objetivo = ?,
            metodos = ?,
            observaciones = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            dto.idFinca,
            dto.idEstanque,
            idColaborador,
            dto.fecha,
            dto.porcentaje,
            dto.pesoEstimado,
            dto.biomasaEstimado,
            dto.objetivo,
            dto.metodo,
            dto.observaciones,
            id,
            grupoDatos
        ]
    );

    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
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
    const raleo = await findById(id, grupoDatos);
    if (!raleo) return null;

    await pool.query(
        `UPDATE raleos
         SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP, version = version + 1
         WHERE id = ? AND grupo_datos = ?`,
        [id, grupoDatos]
    );
    return raleo;
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
        creadoPorUsuarioId: row.creado_por_usuario_id,
        creadoPorColaboradorId: row.creado_por_colaborador_id,
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
