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
            fecha_ultimo_encendido,
            UNIX_TIMESTAMP(fecha_ultimo_encendido) AS unix_ts,
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
            fecha_ultimo_encendido,
            UNIX_TIMESTAMP(fecha_ultimo_encendido) AS unix_ts,
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
    const fechaUltimoEncendidoMysql = normalizarDatetimeMysql(
        dto.fechaUltimoEncendido || (dto.estado === 'Encendido' ? new Date() : null)
    );

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
            estado,
            fecha_ultimo_encendido
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            dto.estado,
            fechaUltimoEncendidoMysql
        ]
    );

    return await findById(result.insertId, dto.grupoDatos);
}

export async function update(id, dto, grupoDatos, esGlobal = false) {
    /*
    Descripcion:
    Actualiza un equipo del grupo del usuario.
    Lógica de horas de uso:
    - Apagado -> Encendido: registra fecha_ultimo_encendido
    - Encendido -> Apagado: acumula delta de horas y limpia fecha
    - Cambio a Mantenimiento o Inactivo: resetea horas a 0 y apaga
    */

    let actual = null;
    if (esGlobal) {
        const [rows] = await pool.execute(
            `SELECT id, uuid, grupo_datos, identificador, nombre_equipo, descripcion,
                   tipo_equipo, fecha_instalacion, funcion_equipo, estanque_id,
                   horas_mantenimiento, horas_actuales, estado_operativo, estado,
                   fecha_ultimo_encendido, UNIX_TIMESTAMP(fecha_ultimo_encendido) AS unix_ts, activo, fecha_creacion, fecha_actualizacion,
                   deleted_at, version
            FROM equipos WHERE id = ? AND deleted_at IS NULL AND activo = TRUE LIMIT 1`,
            [id]
        );
        if (rows.length > 0) actual = mapearFila(rows[0]);
    } else {
        actual = await findById(id, grupoDatos);
    }
    if (!actual) return null;

    const fechaInstalacion = normalizarFechaMysql(dto.fechaInstalacion);

    const estadoOperativoNuevo = dto.estadoOperativo;
    const estadoNuevo = dto.estado;

    let horasActuales = Number(dto.horasActuales ?? actual.horasActuales ?? 0);
    let estadoFinal = estadoNuevo || actual.estado;
    let fechaUltimoEncendido = dto.fechaUltimoEncendido !== undefined && dto.fechaUltimoEncendido !== null
        ? dto.fechaUltimoEncendido
        : actual.fechaUltimoEncendido;

    // Regla: cambio a Mantenimiento o Inactivo -> resetear horas y apagar
    if (estadoOperativoNuevo === 'Mantenimiento' || estadoOperativoNuevo === 'Inactivo') {
        horasActuales = 0;
        estadoFinal = 'Apagado';
        fechaUltimoEncendido = null;
    }
    // Regla: Encendido -> Apagado -> acumular horas
    else if (actual.estado === 'Encendido' && estadoFinal === 'Apagado') {
        const fechaInicio = actual.fechaUltimoEncendido;
        if (fechaInicio) {
            const msInicio = new Date(fechaInicio).getTime();
            if (!isNaN(msInicio)) {
                const msDelta = Math.max(0, Date.now() - msInicio);
                horasActuales = Number((horasActuales + msDelta / (1000 * 60 * 60)).toFixed(2));
            }
        }
        fechaUltimoEncendido = null;
    }
    // Regla: Apagado -> Encendido -> registrar fecha
    else if (actual.estado === 'Apagado' && estadoFinal === 'Encendido') {
        fechaUltimoEncendido = dto.fechaUltimoEncendido || new Date();
    }

    const fechaUltimoEncendidoMysql = normalizarDatetimeMysql(fechaUltimoEncendido);

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
            fecha_ultimo_encendido = ?,
            fecha_actualizacion = CURRENT_TIMESTAMP,
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
            horasActuales,
            estadoOperativoNuevo,
            estadoFinal,
            fechaUltimoEncendidoMysql,
            id,
            grupoDatos
        ]
    );

    return await findById(id, grupoDatos);
}


export async function toggle(id, grupoDatos, esGlobal = false) {
    /*
    Descripcion:
    Cambia el estado de encendido/apagado de un equipo y acumula
    horas de uso al apagar segun fecha_ultimo_encendido.
    Soporta acceso global.
    */
    let actual = null;
    if (esGlobal) {
        const [rows] = await pool.execute(
            `
            SELECT id, uuid, grupo_datos, identificador, nombre_equipo, descripcion,
                   tipo_equipo, fecha_instalacion, funcion_equipo, estanque_id,
                   horas_mantenimiento, horas_actuales, estado_operativo, estado,
                   fecha_ultimo_encendido, UNIX_TIMESTAMP(fecha_ultimo_encendido) AS unix_ts, activo, fecha_creacion, fecha_actualizacion,
                   deleted_at, version
            FROM equipos
            WHERE id = ? AND deleted_at IS NULL AND activo = TRUE
            LIMIT 1
            `,
            [id]
        );
        if (rows.length > 0) actual = mapearFila(rows[0]);
    } else {
        actual = await findById(id, grupoDatos);
    }

    if (!actual) return null;

    const estabaEncendido = actual.estado === "Encendido";

    // Validar que no se pueda encender si está en Mantenimiento o Inactivo
    if (!estabaEncendido && (actual.estadoOperativo === "Mantenimiento" || actual.estadoOperativo === "Inactivo")) {
        const err = new Error(`No se puede encender un equipo en estado ${actual.estadoOperativo.toLowerCase()}.`);
        err.status = 400;
        throw err;
    }

    if (estabaEncendido) {
        // Usar TIMESTAMPDIFF en MySQL para evitar problemas de zona horaria entre Node.js y MySQL
        let sql = `
            UPDATE equipos
            SET estado = 'Apagado',
                horas_actuales = ROUND(horas_actuales + (TIMESTAMPDIFF(SECOND, fecha_ultimo_encendido, NOW()) / 3600.0), 2),
                estado_operativo = IF(
                    horas_mantenimiento IS NOT NULL AND horas_mantenimiento > 0 AND ROUND(horas_actuales + (TIMESTAMPDIFF(SECOND, fecha_ultimo_encendido, NOW()) / 3600.0), 2) >= horas_mantenimiento,
                    'Mantenimiento',
                    estado_operativo
                ),
                fecha_ultimo_encendido = NULL,
                fecha_actualizacion = CURRENT_TIMESTAMP,
                version = version + 1
            WHERE id = ? AND deleted_at IS NULL AND activo = TRUE
        `;
        const params = [id];
        if (!esGlobal && grupoDatos) {
            sql += ` AND grupo_datos = ?`;
            params.push(grupoDatos);
        }

        await pool.execute(sql, params);
    } else {
        let sql = `
            UPDATE equipos
            SET estado = 'Encendido',
                fecha_ultimo_encendido = CURRENT_TIMESTAMP,
                fecha_actualizacion = CURRENT_TIMESTAMP,
                version = version + 1
            WHERE id = ? AND deleted_at IS NULL AND activo = TRUE
        `;
        const params = [id];
        if (!esGlobal && grupoDatos) {
            sql += ` AND grupo_datos = ?`;
            params.push(grupoDatos);
        }

        await pool.execute(sql, params);
    }

    if (esGlobal) {
        const [rows] = await pool.execute(
            `
            SELECT id, uuid, grupo_datos, identificador, nombre_equipo, descripcion,
                   tipo_equipo, fecha_instalacion, funcion_equipo, estanque_id,
                   horas_mantenimiento, horas_actuales, estado_operativo, estado,
                   fecha_ultimo_encendido, UNIX_TIMESTAMP(fecha_ultimo_encendido) AS unix_ts, activo, fecha_creacion, fecha_actualizacion,
                   deleted_at, version
            FROM equipos
            WHERE id = ? AND deleted_at IS NULL AND activo = TRUE
            LIMIT 1
            `,
            [id]
        );
        return rows.length > 0 ? mapearFila(rows[0]) : null;
    }

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
        fechaUltimoEncendido: row.fecha_ultimo_encendido
        ? (row.unix_ts != null
            ? new Date(Number(row.unix_ts) * 1000).toISOString()
            : new Date(row.fecha_ultimo_encendido).toISOString())
        : null,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function normalizarDatetimeMysql(valor) {
    if (!valor) return null;
    if (valor instanceof Date) {
        if (isNaN(valor.getTime())) return null;
        return valor.toISOString().slice(0, 19).replace('T', ' ');
    }
    const str = String(valor).trim();
    if (str === '' || str === 'null' || str === 'undefined') return null;

    if (str.includes('T')) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return d.toISOString().slice(0, 19).replace('T', ' ');
        }
        return str.slice(0, 19).replace('T', ' ');
    }
    return str;
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