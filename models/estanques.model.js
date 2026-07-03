/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.model.js
Autor: Gerald Alfaro
Fecha: 03/07/2026
Modulo: Estanques
Descripcion:
Capa de datos del modulo de estanques.
Trabaja con la base de datos principal MySQL.
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";

export async function findAll(filtros) {
    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            especie,
            fecha_siembra,
            fecha_inicio_engorde,
            fecha_mantenimiento,
            densidad_siembra,
            usa_precria,
            metodo_alimentacion,
            proveedor_alimento,
            numero_aireadores,
            tiene_alimentador_automatico,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM estanques
        WHERE deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [];

    if (filtros) {
        if (filtros.idFinca) {
            sql = sql + " AND finca_id = ?";
            params.push(filtros.idFinca);
        }

        if (filtros.grupoDatos) {
            sql = sql + " AND grupo_datos = ?";
            params.push(filtros.grupoDatos);
        }
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);

    return mapearLista(rows);
}

export async function findById(id) {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            especie,
            fecha_siembra,
            fecha_inicio_engorde,
            fecha_mantenimiento,
            densidad_siembra,
            usa_precria,
            metodo_alimentacion,
            proveedor_alimento,
            numero_aireadores,
            tiene_alimentador_automatico,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM estanques
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

export async function findByCodigoAndFinca(codigo, idFinca, idIgnorado) {
    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            especie,
            fecha_siembra,
            fecha_inicio_engorde,
            fecha_mantenimiento,
            densidad_siembra,
            usa_precria,
            metodo_alimentacion,
            proveedor_alimento,
            numero_aireadores,
            tiene_alimentador_automatico,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM estanques
        WHERE LOWER(TRIM(codigo)) = LOWER(TRIM(?))
        AND finca_id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [codigo, idFinca];

    if (idIgnorado !== null) {
        if (idIgnorado !== undefined) {
            sql = sql + " AND id <> ?";
            params.push(idIgnorado);
        }
    }

    sql = sql + " LIMIT 1";

    const [rows] = await pool.execute(sql, params);

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function create(dto) {
    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fechaSiembra = normalizarFechaMysqlOpcional(dto.fechaSiembra);
    const fechaInicioEngorde = normalizarFechaMysqlOpcional(dto.fechaInicioEngorde);
    const fechaMantenimiento = normalizarFechaMysqlOpcional(dto.fechaMantenimiento);

    const [result] = await pool.execute(
        `
        INSERT INTO estanques (
            grupo_datos,
            finca_id,
            codigo,
            tipo_estanque,
            estado,
            largo,
            ancho,
            profundidad,
            fuente_agua,
            especie,
            fecha_siembra,
            fecha_inicio_engorde,
            fecha_mantenimiento,
            densidad_siembra,
            usa_precria,
            metodo_alimentacion,
            proveedor_alimento,
            numero_aireadores,
            tiene_alimentador_automatico
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.codigo,
            dto.tipoEstanque,
            dto.estado,
            dto.largo,
            dto.ancho,
            dto.profundidad,
            dto.fuenteAgua,
            dto.especie,
            fechaSiembra,
            fechaInicioEngorde,
            fechaMantenimiento,
            dto.densidadSiembra,
            dto.usaPrecria,
            dto.metodoAlimentacion,
            dto.proveedorAlimento,
            dto.numeroAireadores,
            dto.tieneAlimentadorAutomatico
        ]
    );

    return await findById(result.insertId);
}

export async function update(id, dto) {
    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fechaSiembra = normalizarFechaMysqlOpcional(dto.fechaSiembra);
    const fechaInicioEngorde = normalizarFechaMysqlOpcional(dto.fechaInicioEngorde);
    const fechaMantenimiento = normalizarFechaMysqlOpcional(dto.fechaMantenimiento);

    await pool.execute(
        `
        UPDATE estanques
        SET
            grupo_datos = ?,
            finca_id = ?,
            codigo = ?,
            tipo_estanque = ?,
            estado = ?,
            largo = ?,
            ancho = ?,
            profundidad = ?,
            fuente_agua = ?,
            especie = ?,
            fecha_siembra = ?,
            fecha_inicio_engorde = ?,
            fecha_mantenimiento = ?,
            densidad_siembra = ?,
            usa_precria = ?,
            metodo_alimentacion = ?,
            proveedor_alimento = ?,
            numero_aireadores = ?,
            tiene_alimentador_automatico = ?,
            version = version + 1
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.codigo,
            dto.tipoEstanque,
            dto.estado,
            dto.largo,
            dto.ancho,
            dto.profundidad,
            dto.fuenteAgua,
            dto.especie,
            fechaSiembra,
            fechaInicioEngorde,
            fechaMantenimiento,
            dto.densidadSiembra,
            dto.usaPrecria,
            dto.metodoAlimentacion,
            dto.proveedorAlimento,
            dto.numeroAireadores,
            dto.tieneAlimentadorAutomatico,
            id
        ]
    );

    return await findById(id);
}

export async function remove(id) {
    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE estanques
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
    const resultado = [];

    for (let i = 0; i < rows.length; i++) {
        resultado.push(mapearFila(rows[i]));
    }

    return resultado;
}

function mapearFila(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        codigo: row.codigo,
        tipoEstanque: row.tipo_estanque,
        estado: row.estado,
        largo: Number(row.largo),
        ancho: Number(row.ancho),
        profundidad: Number(row.profundidad),
        fuenteAgua: row.fuente_agua,
        especie: row.especie,
        fechaSiembra: formatearFecha(row.fecha_siembra),
        fechaInicioEngorde: formatearFecha(row.fecha_inicio_engorde),
        fechaMantenimiento: formatearFecha(row.fecha_mantenimiento),
        densidadSiembra: convertirNumero(row.densidad_siembra),
        usaPrecria: Boolean(row.usa_precria),
        metodoAlimentacion: row.metodo_alimentacion,
        proveedorAlimento: row.proveedor_alimento,
        numeroAireadores: row.numero_aireadores,
        tieneAlimentadorAutomatico: Boolean(row.tiene_alimentador_automatico),
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function obtenerGrupoDatos(valor) {
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

function normalizarFechaMysqlOpcional(valor) {
    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim() === "") {
        return null;
    }

    return normalizarFechaMysql(valor);
}

function normalizarFechaMysql(valor) {
    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    const texto = String(valor).trim();

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

function convertirNumero(valor) {
    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    return Number(valor);
}