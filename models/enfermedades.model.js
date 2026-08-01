/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.model.js
Autor: Isaac Chaves
Fecha: 30/07/2026
Modulo: Enfermedades
Descripcion:
Capa de acceso a datos del modulo de enfermedades.
Protege los registros por grupo de datos y conserva
inmutables los campos de auditoria durante el update.
No utiliza la columna colaborador_id.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import db from '../config/database.js';

import {
    obtenerNombreEnfermedad,
    obtenerNombreSeveridad,
} from '../services/enfermedades.service.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Obtiene enfermedades activas del grupo autenticado y
aplica los filtros funcionales permitidos.

Parametros:
- filtros: Grupo de datos y filtros opcionales.

Retorna:
- Lista de registros mapeados.
*/

export async function findAll(filtros) {
    const valores = [filtros.grupoDatos];
    const condiciones = [
        'grupo_datos = ?',
        'activo = TRUE',
        'deleted_at IS NULL',
    ];

    agregarFiltro(condiciones, valores, 'finca_id', filtros.fincaId);
    agregarFiltro(condiciones, valores, 'estanque_id', filtros.estanqueId);
    agregarFiltro(condiciones, valores, 'enfermedad', filtros.enfermedad);
    agregarFiltro(condiciones, valores, 'severidad', filtros.severidad);
    agregarFiltro(condiciones, valores, 'fecha_reporte', filtros.fechaReporte);

    const sql = seleccionarCampos() +
        ' WHERE ' + condiciones.join(' AND ') +
        ' ORDER BY fecha_reporte DESC, id DESC';

    const [rows] = await db.execute(sql, valores);
    return mapearFilas(rows);
}

/*
Descripcion:
Busca una enfermedad activa por id y grupo de datos.

Parametros:
- id: Identificador del registro.
- grupoDatos: Grupo obtenido desde el JWT.

Retorna:
- Registro mapeado o null.
*/

export async function findById(id, grupoDatos) {
    const sql = seleccionarCampos() + `
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id, grupoDatos]);
    return rows.length > 0 ? mapearFila(rows[0]) : null;
}

/*
Descripcion:
Verifica que finca y estanque existan, esten activos,
pertenezcan al grupo y mantengan relacion entre si.

Retorna:
- true si la relacion es valida o false.
*/

export async function existeRelacionFincaEstanqueGrupo(
    fincaId,
    estanqueId,
    grupoDatos
) {
    const sql = `
        SELECT estanques.id
        FROM estanques
        INNER JOIN fincas
            ON fincas.id = estanques.finca_id
        WHERE fincas.id = ?
        AND estanques.id = ?
        AND fincas.grupo_datos = ?
        AND estanques.grupo_datos = ?
        AND fincas.activo = TRUE
        AND estanques.activo = TRUE
        AND fincas.deleted_at IS NULL
        AND estanques.deleted_at IS NULL
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [
        fincaId,
        estanqueId,
        grupoDatos,
        grupoDatos
    ]);

    return rows.length > 0;
}

/*
Descripcion:
Inserta una enfermedad con auditoria dual.

Registro creado.

Parametros:
- No utiliza colaborador_id.
- El creador se almacena solo en creado_por_usuario_id o
- creado_por_colaborador_id.

Retorna:
- dto: Datos normalizados por EnfermedadDTO.
*/

export async function create(dto) {
    const sql = `
        INSERT INTO enfermedades (
            grupo_datos,
            finca_id,
            estanque_id,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            tipo_registro,
            fecha_reporte,
            responsable,
            enfermedad,
            severidad,
            mortalidad_registrada,
            reporte
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await db.execute(sql, [
        dto.grupoDatos,
        dto.fincaId,
        dto.estanqueId,
        dto.creadoPorUsuarioId,
        dto.creadoPorColaboradorId,
        dto.tipoRegistro,
        dto.fechaReporte,
        dto.responsable,
        dto.enfermedad,
        dto.severidad,
        dto.mortalidadRegistrada,
        dto.reporte
    ]);

    return findById(resultado.insertId, dto.grupoDatos);
}

/*
Descripcion:
Actualiza solamente los campos funcionales del registro.

Registro actualizado o null.

Parametros:
- Los campos de auditoria no forman parte del UPDATE.
*/

export async function update(id, grupoDatos, dto) {
    const sql = `
        UPDATE enfermedades
        SET
            finca_id = ?,
            estanque_id = ?,
            fecha_reporte = ?,
            enfermedad = ?,
            severidad = ?,
            mortalidad_registrada = ?,
            reporte = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
    `;

    const [resultado] = await db.execute(sql, [
        dto.fincaId,
        dto.estanqueId,
        dto.fechaReporte,
        dto.enfermedad,
        dto.severidad,
        dto.mortalidadRegistrada,
        dto.reporte,
        id,
        grupoDatos
    ]);

    return resultado.affectedRows === 0
        ? null
        : findById(id, grupoDatos);
}

/*
Descripcion:
Realiza la eliminacion logica de una enfermedad.

Retorna:
- Registro eliminado logicamente o null.
*/

export async function remove(id, grupoDatos) {
    const sql = `
        UPDATE enfermedades
        SET
            activo = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
    `;

    const [resultado] = await db.execute(sql, [id, grupoDatos]);

    return resultado.affectedRows === 0
        ? null
        : findByIdIncluyendoEliminados(id, grupoDatos);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Centraliza los campos y alias usados por las consultas.

Retorna:
- Fragmento SELECT del modulo.
*/

function seleccionarCampos() {
    return `
        SELECT
            id,
            uuid,
            grupo_datos AS grupoDatos,
            finca_id AS fincaId,
            estanque_id AS estanqueId,
            creado_por_usuario_id AS creadoPorUsuarioId,
            creado_por_colaborador_id AS creadoPorColaboradorId,
            tipo_registro AS tipoRegistro,
            fecha_reporte AS fechaReporte,
            responsable,
            enfermedad,
            severidad,
            mortalidad_registrada AS mortalidadRegistrada,
            reporte,
            activo,
            fecha_creacion AS fechaCreacion,
            fecha_actualizacion AS fechaActualizacion,
            deleted_at AS deletedAt,
            version
        FROM enfermedades
    `;
}

/*
Descripcion:
Agrega una condicion SQL cuando el filtro tiene valor.
*/

function agregarFiltro(condiciones, valores, campo, valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim().length === 0
    ) {
        return;
    }

    condiciones.push(campo + ' = ?');
    valores.push(valor);
}

/*
Descripcion:
Busca un registro incluyendo los eliminados logicamente.

Retorna:
- Registro mapeado o null.
*/

async function findByIdIncluyendoEliminados(id, grupoDatos) {
    const sql = seleccionarCampos() + `
        WHERE id = ?
        AND grupo_datos = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(sql, [id, grupoDatos]);
    return rows.length > 0 ? mapearFila(rows[0]) : null;
}

/*
Descripcion:
Convierte una lista de filas MySQL a objetos del dominio.

Parametros:
- rows: Filas devueltas por mysql2.

Retorna:
- Lista mapeada.
*/

function mapearFilas(rows) {
    return rows.map(mapearFila);
}

/*
Descripcion:
Mapea una fila MySQL y agrega los nombres visibles de
enfermedad y severidad.

Parametros:
- row: Fila devuelta por MySQL.

Retorna:
- Objeto de enfermedad.
*/

function mapearFila(row) {
    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupoDatos,
        fincaId: row.fincaId,
        estanqueId: row.estanqueId,
        creadoPorUsuarioId: row.creadoPorUsuarioId,
        creadoPorColaboradorId: row.creadoPorColaboradorId,
        tipoRegistro: row.tipoRegistro,
        fechaReporte: formatearFecha(row.fechaReporte),
        responsable: row.responsable,
        enfermedad: row.enfermedad,
        enfermedadNombre: obtenerNombreEnfermedad(row.enfermedad),
        severidad: row.severidad,
        severidadNombre: obtenerNombreSeveridad(row.severidad),
        mortalidadRegistrada: row.mortalidadRegistrada,
        reporte: row.reporte,
        activo: row.activo === 1 || row.activo === true,
        fechaCreacion: formatearFechaHora(row.fechaCreacion),
        fechaActualizacion: formatearFechaHora(row.fechaActualizacion),
        deletedAt: formatearFechaHora(row.deletedAt),
        version: row.version,
    };
}

/*
Descripcion:
Convierte una fecha al formato yyyy-mm-dd.

Parametros:
- valor: Fecha recibida.

Retorna:
- Fecha formateada o null.
*/

function formatearFecha(valor) {
    if (valor === undefined || valor === null) return null;

    return valor instanceof Date
        ? valor.toISOString().slice(0, 10)
        : String(valor).slice(0, 10);
}

/*
Descripcion:
Convierte una fecha y hora a texto serializable.

Parametros:
- valor: Fecha y hora recibida.

Retorna:
- Texto serializable o null.
*/

function formatearFechaHora(valor) {
    if (valor === undefined || valor === null) return null;

    return valor instanceof Date
        ? valor.toISOString()
        : String(valor);
}
