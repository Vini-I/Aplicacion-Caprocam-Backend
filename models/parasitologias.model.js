/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.model.js
Autor: Andres Gutierrez
Fecha: 18/07/2026
Modulo: Parasitologias
Descripcion:
Capa de datos del modulo de parasitologias.
Todas las operaciones utilizan el grupo de datos obtenido
desde el JWT para proteger los registros.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(filtros) {
    /*
    Descripcion:
    Obtiene registros activos del grupo autenticado.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            tipo_registro,
            fecha_reporte,
            responsable,
            parasito,
            camarones_muestreados,
            camarones_infectados,
            porcentaje_infeccion,
            grado_infeccion,
            observaciones,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM parasitologias
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [
        filtros.grupoDatos
    ];

    if (filtros.fincaId) {
        sql = sql + " AND finca_id = ?";
        params.push(
            filtros.fincaId
        );
    }

    if (filtros.estanqueId) {
        sql = sql + " AND estanque_id = ?";
        params.push(
            filtros.estanqueId
        );
    }

    if (filtros.parasito) {
        sql = sql + " AND parasito = ?";
        params.push(
            filtros.parasito
        );
    }

    if (filtros.fechaReporte) {
        sql = sql + " AND fecha_reporte = ?";
        params.push(
            normalizarFechaMysql(
                filtros.fechaReporte
            )
        );
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(
        sql,
        params
    );

    return mapearLista(
        rows
    );
}

export async function findById(
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Busca un registro por ID y grupo de datos.
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
            tipo_registro,
            fecha_reporte,
            responsable,
            parasito,
            camarones_muestreados,
            camarones_infectados,
            porcentaje_infeccion,
            grado_infeccion,
            observaciones,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM parasitologias
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [
            id,
            grupoDatos
        ]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(
        rows[0]
    );
}

export async function fincaEstanquePertenecenGrupo(
    fincaId,
    estanqueId,
    grupoDatos
) {
    /*
    Descripcion:
    Verifica que la finca y el estanque pertenezcan al grupo
    y que el estanque se encuentre asociado a la finca.
    */

    const [rows] = await pool.execute(
        `
        SELECT e.id
        FROM estanques e
        INNER JOIN fincas f
            ON f.id = e.finca_id
        WHERE f.id = ?
        AND e.id = ?
        AND f.grupo_datos = ?
        AND e.grupo_datos = ?
        AND f.deleted_at IS NULL
        AND e.deleted_at IS NULL
        AND f.activo = TRUE
        AND e.activo = TRUE
        LIMIT 1
        `,
        [
            fincaId,
            estanqueId,
            grupoDatos,
            grupoDatos
        ]
    );

    if (rows.length === 0) {
        return false;
    }

    return true;
}

export async function create(dto) {
    /*
    Descripcion:
    Inserta un nuevo registro utilizando datos controlados
    por el backend.
    */

    const fechaReporte = normalizarFechaMysql(
        dto.fechaReporte
    );

    const [result] = await pool.execute(
        `
        INSERT INTO parasitologias (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            tipo_registro,
            fecha_reporte,
            responsable,
            parasito,
            camarones_muestreados,
            camarones_infectados,
            porcentaje_infeccion,
            grado_infeccion,
            observaciones
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            dto.grupoDatos,
            dto.fincaId,
            dto.estanqueId,
            dto.colaboradorId,
            dto.tipoRegistro,
            fechaReporte,
            dto.responsable,
            dto.parasito,
            dto.camaronesMuestreados,
            dto.camaronesInfectados,
            dto.porcentajeInfeccion,
            dto.gradoInfeccion,
            dto.observaciones
        ]
    );

    return await findById(
        result.insertId,
        dto.grupoDatos
    );
}

export async function update(
    id,
    dto,
    grupoDatos
) {
    /*
    Descripcion:
    Actualiza un registro del grupo autenticado.
    grupo_datos no puede modificarse.
    */

    const actual = await findById(
        id,
        grupoDatos
    );

    if (!actual) {
        return null;
    }

    const fechaReporte = normalizarFechaMysql(
        dto.fechaReporte
    );

    await pool.execute(
        `
        UPDATE parasitologias
        SET
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            tipo_registro = ?,
            fecha_reporte = ?,
            responsable = ?,
            parasito = ?,
            camarones_muestreados = ?,
            camarones_infectados = ?,
            porcentaje_infeccion = ?,
            grado_infeccion = ?,
            observaciones = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            dto.fincaId,
            dto.estanqueId,
            dto.colaboradorId,
            dto.tipoRegistro,
            fechaReporte,
            dto.responsable,
            dto.parasito,
            dto.camaronesMuestreados,
            dto.camaronesInfectados,
            dto.porcentajeInfeccion,
            dto.gradoInfeccion,
            dto.observaciones,
            id,
            grupoDatos
        ]
    );

    return await findById(
        id,
        grupoDatos
    );
}

export async function remove(
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Elimina logicamente un registro del grupo autenticado.
    */

    const actual = await findById(
        id,
        grupoDatos
    );

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE parasitologias
        SET
            activo = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            id,
            grupoDatos
        ]
    );

    return actual;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function mapearLista(rows) {
    const resultado = [];

    for (let i = 0; i < rows.length; i++) {
        resultado.push(
            mapearFila(rows[i])
        );
    }

    return resultado;
}

function mapearFila(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        colaboradorId: row.colaborador_id,
        tipoRegistro: row.tipo_registro,
        fechaReporte: formatearFecha(
            row.fecha_reporte
        ),
        responsable: row.responsable,
        parasito: row.parasito,
        camaronesMuestreados: Number(
            row.camarones_muestreados
        ),
        camaronesInfectados: Number(
            row.camarones_infectados
        ),
        porcentajeInfeccion: convertirNumero(
            row.porcentaje_infeccion
        ),
        gradoInfeccion:
            row.grado_infeccion,
        observaciones:
            row.observaciones,
        activo: Boolean(
            row.activo
        ),
        fechaCreacion:
            row.fecha_creacion,
        fechaActualizacion:
            row.fecha_actualizacion,
        deletedAt:
            row.deleted_at,
        version:
            row.version
    };
}

function normalizarFechaMysql(valor) {
    if (valor instanceof Date) {
        return valor.toISOString().slice(
            0,
            10
        );
    }

    const texto = String(valor).trim();

    if (texto.includes("/")) {
        const partes = texto.split("/");

        if (partes.length === 3) {
            const dia = partes[0].padStart(
                2,
                "0"
            );

            const mes = partes[1].padStart(
                2,
                "0"
            );

            const anio = partes[2];

            return anio + "-" + mes + "-" + dia;
        }
    }

    return texto;
}

function formatearFecha(valor) {
    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(
            0,
            10
        );
    }

    return String(valor);
}

function convertirNumero(valor) {
    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    return Number(valor);
}