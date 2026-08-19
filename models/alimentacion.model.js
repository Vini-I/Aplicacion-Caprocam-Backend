/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.model.js
Autor: Wendy Martinez
Fecha: 06/07/2026
Modulo: Alimentacion
Descripcion:
Capa de datos del modulo de alimentacion.
Maneja registros de alimentacion y movimientos de inventario.
//////////////////////////////////////////////////////////
*/

import pool from "../config/database.js";

const COLUMNAS = `
    id,
    uuid,
    grupo_datos,
    finca_id,
    estanque_id,
    proveedor_id,
    producto_id,
    fecha,
    hora,
    metodo,
    cantidad_kg,
    presentacion,
    proveedor,
    tipo_alimento,
    observaciones,
    creado_por_usuario_id,
    creado_por_colaborador_id,
    activo,
    fecha_creacion,
    fecha_actualizacion,
    deleted_at,
    version
`;

/*
//////////////////////////////////////////////////////////
INVENTARIO
//////////////////////////////////////////////////////////
*/

async function registrarMovimiento(connection, {
    grupoDatos,
    productoId,
    tipoMovimiento,
    cantidad,
    observacion,
    creadoPorUsuarioId,
    creadoPorColaboradorId
}) {
    const cantidadMovimiento = Number(cantidad);

    if (Number.isNaN(cantidadMovimiento) || cantidadMovimiento <= 0) {
        const error = new Error(
            "La cantidad del movimiento de inventario debe ser mayor que cero."
        );
        error.status = 422;
        throw error;
    }

    const [rows] = await connection.execute(
        `
        SELECT id, cantidad
        FROM inventario
        WHERE producto_id = ?
          AND grupo_datos = ?
          AND activo = TRUE
          AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
        `,
        [productoId, grupoDatos]
    );

    if (!rows.length) {
        const error = new Error(
            "No existe un registro de inventario activo para el producto seleccionado."
        );
        error.status = 422;
        throw error;
    }

    const inventario = rows[0];
    const cantidadActual = Number(inventario.cantidad);

    let cantidadNueva;

    switch (tipoMovimiento) {
        case "Entrada":
            cantidadNueva = cantidadActual + cantidadMovimiento;
            break;

        case "Salida":
            cantidadNueva = cantidadActual - cantidadMovimiento;

            if (cantidadNueva < 0) {
                const error = new Error(
                    `No hay suficiente stock. Disponible: ${cantidadActual}, ` +
                    `requerido: ${cantidadMovimiento}.`
                );
                error.status = 409;
                throw error;
            }
            break;

        case "Ajuste":
            cantidadNueva = cantidadMovimiento;
            break;

        default: {
            const error = new Error(
                `Tipo de movimiento de inventario invalido: ${tipoMovimiento}`
            );
            error.status = 422;
            throw error;
        }
    }

    await connection.execute(
        `
        UPDATE inventario
        SET cantidad = ?, version = version + 1
        WHERE id = ?
        `,
        [cantidadNueva, inventario.id]
    );

    await connection.execute(
        `
        INSERT INTO movimientos_inventario (
            grupo_datos,
            inventario_id,
            producto_id,
            tipo_movimiento,
            cantidad,
            observacion,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            inventario.id,
            productoId,
            tipoMovimiento,
            cantidadMovimiento,
            observacion ?? null,
            creadoPorUsuarioId ?? null,
            creadoPorColaboradorId ?? null
        ]
    );

    return {
        inventarioId: inventario.id,
        cantidadAnterior: cantidadActual,
        cantidadNueva
    };
}

/*
//////////////////////////////////////////////////////////
CONSULTAS
//////////////////////////////////////////////////////////
*/

export async function findAll(filtros = {}) {
    let sql = `
        SELECT ${COLUMNAS}
        FROM alimentaciones
        WHERE deleted_at IS NULL
          AND activo = TRUE
    `;

    const params = [];

    if (filtros.idFinca) {
        sql += " AND finca_id = ?";
        params.push(filtros.idFinca);
    }

    if (filtros.idEstanque) {
        sql += " AND estanque_id = ?";
        params.push(filtros.idEstanque);
    }

    if (filtros.grupoDatos) {
        sql += " AND grupo_datos = ?";
        params.push(filtros.grupoDatos);
    }

    sql += " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);

    return rows.map(mapearFila);
}

export async function findById(id, grupoDatos) {
    const [rows] = await pool.execute(
        `
        SELECT ${COLUMNAS}
        FROM alimentaciones
        WHERE id = ?
          AND grupo_datos = ?
          AND deleted_at IS NULL
          AND activo = TRUE
        LIMIT 1
        `,
        [id, grupoDatos]
    );

    return rows.length ? mapearFila(rows[0]) : null;
}

export async function findByFechaHoraEstanque(
    fecha,
    hora,
    idEstanque,
    idIgnorado,
    grupoDatos
) {
    let sql = `
        SELECT ${COLUMNAS}
        FROM alimentaciones
        WHERE fecha = ?
          AND estanque_id = ?
          AND grupo_datos = ?
          AND deleted_at IS NULL
          AND activo = TRUE
    `;

    const params = [fecha, idEstanque, grupoDatos];

    if (hora != null) {
        sql += " AND hora = ?";
        params.push(hora);
    }

    if (idIgnorado != null) {
        sql += " AND id <> ?";
        params.push(idIgnorado);
    }

    sql += " LIMIT 1";

    const [rows] = await pool.execute(sql, params);

    return rows.length ? mapearFila(rows[0]) : null;
}

/*
//////////////////////////////////////////////////////////
CREAR
//////////////////////////////////////////////////////////
*/

export async function create(dto) {
    const grupoDatos = obtenerNumeroValido(dto.grupoDatos);
    const creadoPorUsuarioId = obtenerNumeroValido(dto.creadoPorUsuarioId);
    const creadoPorColaboradorId = obtenerNumeroValido(
        dto.creadoPorColaboradorId
    );
    const idProducto = obtenerNumeroValido(dto.idProducto);

    if (!grupoDatos) {
        throw new Error(
            "No se pudo determinar el grupo de datos del usuario autenticado."
        );
    }

    if (!creadoPorUsuarioId && !creadoPorColaboradorId) {
        throw new Error(
            "No se pudo determinar quien hizo el registro " +
            "(usuario o colaborador autenticado)."
        );
    }

    const fecha = normalizarFechaMysql(dto.fecha);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (idProducto) {
            await registrarMovimiento(connection, {
                grupoDatos,
                productoId: idProducto,
                tipoMovimiento: "Salida",
                cantidad: dto.cantidadKg,
                observacion:
                    `Salida automatica por registro de alimentacion ` +
                    `(finca ${dto.idFinca}, estanque ${dto.idEstanque}, ` +
                    `fecha ${fecha}).`,
                creadoPorUsuarioId,
                creadoPorColaboradorId
            });
        }

        const [result] = await connection.execute(
            `
            INSERT INTO alimentaciones (
                grupo_datos,
                finca_id,
                estanque_id,
                proveedor_id,
                producto_id,
                fecha,
                hora,
                metodo,
                cantidad_kg,
                presentacion,
                proveedor,
                tipo_alimento,
                observaciones,
                creado_por_usuario_id,
                creado_por_colaborador_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                grupoDatos,
                dto.idFinca,
                dto.idEstanque,
                dto.idProveedor,
                idProducto,
                fecha,
                dto.hora,
                dto.metodo,
                dto.cantidadKg,
                dto.presentacion,
                dto.proveedor,
                dto.tipoAlimento,
                dto.observaciones,
                creadoPorUsuarioId,
                creadoPorColaboradorId
            ]
        );

        await connection.commit();

        return findById(result.insertId, grupoDatos);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/*
//////////////////////////////////////////////////////////
ACTUALIZAR
//////////////////////////////////////////////////////////
*/

export async function update(
    id,
    dto,
    grupoDatos,
    creadoPorUsuarioId,
    creadoPorColaboradorId
) {
    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    const fecha = normalizarFechaMysql(dto.fecha);
    const idProductoNuevo = obtenerNumeroValido(dto.idProducto);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (actual.idProducto) {
            await registrarMovimiento(connection, {
                grupoDatos,
                productoId: actual.idProducto,
                tipoMovimiento: "Entrada",
                cantidad: actual.cantidadKg,
                observacion:
                    `Reversion de stock por edicion del registro ` +
                    `de alimentacion #${id}.`,
                creadoPorUsuarioId,
                creadoPorColaboradorId
            });
        }

        if (idProductoNuevo) {
            await registrarMovimiento(connection, {
                grupoDatos,
                productoId: idProductoNuevo,
                tipoMovimiento: "Salida",
                cantidad: dto.cantidadKg,
                observacion:
                    `Salida automatica por edicion del registro ` +
                    `de alimentacion #${id}.`,
                creadoPorUsuarioId,
                creadoPorColaboradorId
            });
        }

        await connection.execute(
            `
            UPDATE alimentaciones
            SET
                grupo_datos = ?,
                finca_id = ?,
                estanque_id = ?,
                proveedor_id = ?,
                producto_id = ?,
                fecha = ?,
                hora = ?,
                metodo = ?,
                cantidad_kg = ?,
                presentacion = ?,
                proveedor = ?,
                tipo_alimento = ?,
                observaciones = ?,
                version = version + 1
            WHERE id = ?
              AND grupo_datos = ?
              AND deleted_at IS NULL
              AND activo = TRUE
            `,
            [
                grupoDatos,
                dto.idFinca,
                dto.idEstanque,
                dto.idProveedor,
                idProductoNuevo,
                fecha,
                dto.hora,
                dto.metodo,
                dto.cantidadKg,
                dto.presentacion,
                dto.proveedor,
                dto.tipoAlimento,
                dto.observaciones,
                id,
                grupoDatos
            ]
        );

        await connection.commit();

        return findById(id, grupoDatos);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/*
//////////////////////////////////////////////////////////
ELIMINAR
//////////////////////////////////////////////////////////
*/

export async function remove(
    id,
    grupoDatos,
    creadoPorUsuarioId,
    creadoPorColaboradorId
) {
    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        if (actual.idProducto) {
            await registrarMovimiento(connection, {
                grupoDatos,
                productoId: actual.idProducto,
                tipoMovimiento: "Entrada",
                cantidad: actual.cantidadKg,
                observacion:
                    `Reversion de stock por eliminacion del registro ` +
                    `de alimentacion #${id}.`,
                creadoPorUsuarioId,
                creadoPorColaboradorId
            });
        }

        await connection.execute(
            `
            UPDATE alimentaciones
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

        await connection.commit();

        return {
            ...actual,
            activo: false
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/*
//////////////////////////////////////////////////////////
UTILIDADES
//////////////////////////////////////////////////////////
*/

function mapearFila(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        idEstanque: row.estanque_id,
        idProveedor: row.proveedor_id,
        idProducto: row.producto_id,
        fecha: formatearFecha(row.fecha),
        hora: row.hora,
        metodo: row.metodo,
        cantidadKg: convertirNumero(row.cantidad_kg),
        presentacion: row.presentacion,
        proveedor: row.proveedor,
        tipoAlimento: row.tipo_alimento,
        observaciones: row.observaciones,
        creadoPorUsuarioId: row.creado_por_usuario_id,
        creadoPorColaboradorId: row.creado_por_colaborador_id,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function obtenerNumeroValido(valor) {
    const numero = Number(valor);

    return valor != null &&
        !Number.isNaN(numero) &&
        numero > 0
        ? numero
        : null;
}

function normalizarFechaMysql(valor) {
    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    const texto = String(valor).trim();

    if (!texto.includes("/")) {
        return texto;
    }

    const partes = texto.split("/");

    if (partes.length !== 3) {
        return texto;
    }

    const [dia, mes, anio] = partes;

    return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function formatearFecha(valor) {
    if (valor == null) {
        return null;
    }

    return valor instanceof Date
        ? valor.toISOString().slice(0, 10)
        : String(valor);
}

function convertirNumero(valor) {
    return valor == null ? null : Number(valor);
}