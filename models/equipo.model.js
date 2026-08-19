/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.model.js
Autor: Rodolfo Chaves
Fecha: 20/07/2026
Modulo: Equipo
Descripcion:
Capa de datos del modulo de equipos.
Trabaja con la base de datos principal MySQL.
Todas las operaciones utilizan el grupo de datos obtenido
desde el JWT para proteger los registros.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos
*/

import pool from "../config/database.js";

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
    Obtiene los equipos activos que pertenecen al grupo
    de datos del usuario autenticado.
    Permite filtrar opcionalmente por estanque.

    Parametros:
    - filtros: Objeto con grupoDatos y estanqueId opcional.

    Retorna:
    - Lista de equipos encontrados.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            identificador,
            nombre_equipo,
            descripcion,
            tipo_equipo,
            fecha_instalacion,
            funcion_equipo,
            estanque_id,
            horas_mantenimiento,
            horas_actuales,
            estado_operativo,
            estado,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM equipos
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [filtros.grupoDatos];

    if (filtros.estanqueId) {
        sql = sql + " AND estanque_id = ?";
        params.push(filtros.estanqueId);
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);

    return mapearLista(rows);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un equipo activo por su identificador numerico
    y por el grupo de datos del usuario autenticado.

    Parametros:
    - id: Identificador del equipo.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El equipo encontrado.
    - null si no existe, fue eliminado o pertenece a otro grupo.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            identificador,
            nombre_equipo,
            descripcion,
            tipo_equipo,
            fecha_instalacion,
            funcion_equipo,
            estanque_id,
            horas_mantenimiento,
            horas_actuales,
            estado_operativo,
            estado,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM equipos
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [id, grupoDatos]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function findByIdentificador(identificador, idIgnorado, grupoDatos) {
    /*
    Descripcion:
    Busca un equipo por identificador y grupo de datos
    para validar unicidad. Permite ignorar un id especifico
    al actualizar.

    Parametros:
    - identificador: Identificador del equipo a buscar.
    - idIgnorado: Identificador que se debe ignorar (update).
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El equipo encontrado.
    - null si no existe coincidencia.
    */

    let sql = `
        SELECT id, identificador
        FROM equipos
        WHERE LOWER(TRIM(identificador)) = LOWER(TRIM(?))
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [identificador, grupoDatos];

    if (idIgnorado !== null && idIgnorado !== undefined) {
        sql = sql + " AND id <> ?";
        params.push(idIgnorado);
    }

    sql = sql + " LIMIT 1";

    const [rows] = await pool.execute(sql, params);

    return rows.length === 0 ? null : rows[0];
}

export async function create(dto) {
    /*
    Descripcion:
    Inserta un nuevo equipo utilizando el grupo de datos
    recibido desde el controller.

    Parametros:
    - dto: Objeto EquipoDTO con los datos normalizados.

    Retorna:
    - El equipo recien creado consultado desde la base de datos.
    */

    const fechaInstalacion = normalizarFechaMysql(dto.fechaInstalacion);

    const [result] = await pool.execute(
        `
        INSERT INTO equipos (
            grupo_datos,
            identificador,
            nombre_equipo,
            descripcion,
            tipo_equipo,
            fecha_instalacion,
            funcion_equipo,
            estanque_id,
            horas_mantenimiento,
            horas_actuales,
            estado_operativo,
            estado
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            dto.grupoDatos,
            dto.identificador,
            dto.nombreEquipo,
            dto.descripcion,
            dto.tipoEquipo,
            fechaInstalacion,
            dto.funcionEquipo,
            dto.estanqueId,
            dto.horasMantenimiento,
            dto.horasActuales,
            dto.estadoOperativo,
            dto.estado
        ]
    );

    return await findById(result.insertId, dto.grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un equipo que pertenece al grupo del usuario.
    Incrementa version para control de cambios.
    El campo grupo_datos no se modifica.

    Parametros:
    - id: Identificador del equipo a actualizar.
    - dto: Objeto EquipoDTO con los datos actualizados.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El equipo actualizado.
    - null si no existe o pertenece a otro grupo.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    const fechaInstalacion = normalizarFechaMysql(dto.fechaInstalacion);

    await pool.execute(
        `
        UPDATE equipos
        SET
            identificador = ?,
            nombre_equipo = ?,
            descripcion = ?,
            tipo_equipo = ?,
            fecha_instalacion = ?,
            funcion_equipo = ?,
            estanque_id = ?,
            horas_mantenimiento = ?,
            horas_actuales = ?,
            estado_operativo = ?,
            estado = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            dto.identificador,
            dto.nombreEquipo,
            dto.descripcion,
            dto.tipoEquipo,
            fechaInstalacion,
            dto.funcionEquipo,
            dto.estanqueId,
            dto.horasMantenimiento,
            dto.horasActuales,
            dto.estadoOperativo,
            dto.estado,
            id,
            grupoDatos
        ]
    );

    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente un equipo que pertenece al grupo
    del usuario. No borra fisicamente el registro.
    Cambia activo a FALSE, llena deleted_at e incrementa
    version.

    Parametros:
    - id: Identificador del equipo a eliminar.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El equipo antes de ser eliminado.
    - null si no existe, ya fue eliminado o pertenece a otro grupo.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE equipos
        SET
            activo = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [id, grupoDatos]
    );

    return actual;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas de mapeo y normalizacion.
Las funciones findAll(), findById(), create(), update()
y remove() dependen de estas funciones para trabajar.
*/

function mapearLista(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato
    camelCase esperado por el frontend.

    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.

    Retorna:
    - Lista de equipos mapeados.
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
    Convierte una fila de MySQL en un objeto camelCase.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto equipo en el formato esperado por el frontend.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        identificador: row.identificador,
        nombreEquipo: row.nombre_equipo,
        descripcion: row.descripcion,
        tipoEquipo: row.tipo_equipo,
        fechaInstalacion: formatearFecha(row.fecha_instalacion),
        funcionEquipo: row.funcion_equipo,
        estanqueId: row.estanque_id,
        horasMantenimiento: row.horas_mantenimiento,
        horasActuales: Number(row.horas_actuales),
        estadoOperativo: row.estado_operativo,
        estado: row.estado,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function normalizarFechaMysql(valor) {
    /*
    Descripcion:
    Convierte una fecha al formato YYYY-MM-DD compatible
    con MySQL. Acepta formato dd/mm/aaaa o YYYY-MM-DD.

    Parametros:
    - valor: Fecha recibida desde el body.

    Retorna:
    - Fecha en formato YYYY-MM-DD o null si no existe.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();

    if (texto === "") {
        return null;
    }

    if (texto.includes("/")) {
        const partes = texto.split("/");

        if (partes.length === 3) {
            const dia = partes[0].padStart(2, "0");
            const mes = partes[1].padStart(2, "0");
            const anio = partes[2];

            return anio + "-" + mes + "-" + dia;
        }
    }

    return texto;
}

function formatearFecha(valor) {
    /*
    Descripcion:
    Formatea una fecha recibida desde MySQL para devolverla
    en formato YYYY-MM-DD al frontend.

    Parametros:
    - valor: Fecha recibida desde MySQL.

    Retorna:
    - Fecha formateada o null si no existe.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}