/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.model.js
Autor: Andres Gutierrez
Fecha: 30/07/2026
Modulo: Parasitologias
Descripcion:
Capa de datos del modulo de parasitologias con auditoria
dual y proteccion por grupo de datos.
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

/*
Descripcion:
Obtiene parasitologias activas del grupo autenticado y
aplica filtros opcionales.

Parametros:
- filtros: Grupo de datos y filtros funcionales.

Retorna:
- Lista de registros mapeados.
*/

export async function findAll(filtros) {
    let sql = seleccionarCampos() + `
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [
        filtros.grupoDatos
    ];

    if (filtros.fincaId) {
        sql = sql + " AND finca_id = ?";
        params.push(filtros.fincaId);
    }

    if (filtros.estanqueId) {
        sql = sql + " AND estanque_id = ?";
        params.push(filtros.estanqueId);
    }

    if (filtros.parasito) {
        sql = sql + " AND parasito = ?";
        params.push(filtros.parasito);
    }

    if (filtros.fechaReporte) {
        sql = sql + " AND fecha_reporte = ?";
        params.push(
            normalizarFechaMysql(
                filtros.fechaReporte
            )
        );
    }

    sql = sql +
        " ORDER BY fecha_reporte DESC, id DESC";

    const [rows] = await pool.execute(
        sql,
        params
    );

    return mapearLista(rows);
}

/*
Descripcion:
Busca una parasitologia por id y grupo de datos.

Retorna:
- Registro mapeado o null.
*/

export async function findById(
    id,
    grupoDatos
) {
    const sql =
        seleccionarCampos() +
        ` WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1`;

    const [rows] = await pool.execute(
        sql,
        [
            id,
            grupoDatos
        ]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

/*
Descripcion:
Verifica que finca y estanque pertenezcan al grupo
autenticado y mantengan relacion entre si.

Retorna:
- true si la relacion es valida o false.
*/

export async function fincaEstanquePertenecenGrupo(
    fincaId,
    estanqueId,
    grupoDatos
) {
    const [rows] = await pool.execute(
        `
        SELECT
            e.id
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

    return rows.length > 0;
}

/*
Descripcion:
Inserta una parasitologia con auditoria dual.

Registro creado.

Parametros:
- No utiliza colaborador_id.
- El creador se guarda solo en creado_por_usuario_id o
- creado_por_colaborador_id.

Retorna:
- dto: Datos normalizados por ParasitologiaDTO.
*/

export async function create(dto) {
    const fechaReporte = normalizarFechaMysql(
        dto.fechaReporte
    );

    const [result] = await pool.execute(
        `
        INSERT INTO parasitologias (
            grupo_datos,
            finca_id,
            estanque_id,
            creado_por_usuario_id,
            creado_por_colaborador_id,
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            dto.grupoDatos,
            dto.fincaId,
            dto.estanqueId,
            dto.creadoPorUsuarioId,
            dto.creadoPorColaboradorId,
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

    return findById(
        result.insertId,
        dto.grupoDatos
    );
}

/*
Descripcion:
Actualiza los campos funcionales de la parasitologia.

Registro actualizado o null.

Parametros:
- El UPDATE no modifica los campos de auditoria.
*/

export async function update(
    id,
    dto,
    grupoDatos
) {
    const fechaReporte = normalizarFechaMysql(
        dto.fechaReporte
    );

    const [result] = await pool.execute(
        `
        UPDATE parasitologias
        SET
            finca_id = ?,
            estanque_id = ?,
            fecha_reporte = ?,
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
            fechaReporte,
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

    if (result.affectedRows === 0) {
        return null;
    }

    return findById(
        id,
        grupoDatos
    );
}

/*
Descripcion:
Realiza la eliminacion logica de una parasitologia.

Retorna:
- Registro eliminado logicamente o null.
*/

export async function remove(
    id,
    grupoDatos
) {
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

/*
Descripcion:
Centraliza el SELECT y los alias utilizados por el model.

Retorna:
- Fragmento SQL del modulo.
*/

function seleccionarCampos() {
    return `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            creado_por_usuario_id,
            creado_por_colaborador_id,
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
    `;
}

/*
Descripcion:
Mapea una lista de filas MySQL.

Parametros:
- rows: Filas devueltas por mysql2.

Retorna:
- Lista de objetos de parasitologia.
*/

function mapearLista(rows) {
    const resultado = [];

    for (
        let i = 0;
        i < rows.length;
        i++
    ) {
        resultado.push(
            mapearFila(rows[i])
        );
    }

    return resultado;
}

/*
Descripcion:
Convierte una fila MySQL a la estructura del modulo.

Parametros:
- row: Fila devuelta por MySQL.

Retorna:
- Objeto de parasitologia.
*/

function mapearFila(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        creadoPorUsuarioId:
            row.creado_por_usuario_id,
        creadoPorColaboradorId:
            row.creado_por_colaborador_id,
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
        activo:
            row.activo === 1 ||
            row.activo === true,
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

/*
Descripcion:
Convierte fechas al formato aceptado por MySQL.

Parametros:
- valor: Fecha recibida.

Retorna:
- Fecha yyyy-mm-dd o null.
*/

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

            return (
                partes[2] +
                "-" +
                mes +
                "-" +
                dia
            );
        }
    }

    return texto;
}

/*
Descripcion:
Convierte una fecha MySQL al formato yyyy-mm-dd.

Parametros:
- valor: Fecha recibida.

Retorna:
- Fecha formateada o null.
*/

function formatearFecha(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(
            0,
            10
        );
    }

    return String(valor).slice(
        0,
        10
    );
}

/*
Descripcion:
Convierte valores numericos provenientes de MySQL.

Parametros:
- valor: Valor recibido.

Retorna:
- Numero o null.
*/

function convertirNumero(valor) {
    if (
        valor === undefined ||
        valor === null
    ) {
        return null;
    }

    return Number(valor);
}
