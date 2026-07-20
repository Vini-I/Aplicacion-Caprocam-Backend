/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.model.js
Autor: Isaac Chaves
Fecha: 18/07/2026
Modulo: Enfermedades
Descripcion:
Capa de acceso a datos del modulo de enfermedades.
Todas las consultas protegen los registros mediante
el grupo de datos obtenido desde el JWT.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos
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

export async function findAll(filtros) {
    /*
    Descripcion:
    Obtiene enfermedades activas del grupo autenticado.
    */

    const valores = [];

    const condiciones = [
        'grupo_datos = ?',
        'activo = TRUE',
        'deleted_at IS NULL',
    ];

    valores.push(
        filtros.grupoDatos
    );

    agregarFiltro(
        condiciones,
        valores,
        'finca_id',
        filtros.fincaId
    );

    agregarFiltro(
        condiciones,
        valores,
        'estanque_id',
        filtros.estanqueId
    );

    agregarFiltro(
        condiciones,
        valores,
        'colaborador_id',
        filtros.colaboradorId
    );

    agregarFiltro(
        condiciones,
        valores,
        'enfermedad',
        filtros.enfermedad
    );

    agregarFiltro(
        condiciones,
        valores,
        'severidad',
        filtros.severidad
    );

    agregarFiltro(
        condiciones,
        valores,
        'fecha_reporte',
        filtros.fechaReporte
    );

    const sql =
        seleccionarCampos() +
        ' WHERE ' +
        condiciones.join(' AND ') +
        ' ORDER BY fecha_reporte DESC, id DESC';

    const [rows] = await db.execute(
        sql,
        valores
    );

    return mapearFilas(
        rows
    );
}

export async function findById(
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Busca una enfermedad por ID y grupo de datos.
    */

    const sql =
        seleccionarCampos() +
        ` WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1`;

    const [rows] = await db.execute(
        sql,
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

export async function existeRelacionFincaEstanqueGrupo(
    fincaId,
    estanqueId,
    grupoDatos
) {
    /*
    Descripcion:
    Verifica que la finca y el estanque existan, se encuentren
    activos, pertenezcan al grupo y tengan relacion entre si.

    Parametros:
    - fincaId: Identificador de la finca.
    - estanqueId: Identificador del estanque.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - true si la relacion es valida.
    - false si alguno no existe o pertenece a otro grupo.
    */

    const sql = `
        SELECT
            estanques.id
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

    const [rows] = await db.execute(
        sql,
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
    Inserta una nueva enfermedad utilizando los datos
    normalizados por el controller y el service.
    */

    const sql = `
        INSERT INTO enfermedades (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            tipo_registro,
            fecha_reporte,
            responsable,
            enfermedad,
            severidad,
            mortalidad_registrada,
            reporte
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await db.execute(
        sql,
        [
            dto.grupoDatos,
            dto.fincaId,
            dto.estanqueId,
            dto.colaboradorId,
            dto.tipoRegistro,
            dto.fechaReporte,
            dto.responsable,
            dto.enfermedad,
            dto.severidad,
            dto.mortalidadRegistrada,
            dto.reporte
        ]
    );

    return await findById(
        resultado.insertId,
        dto.grupoDatos
    );
}

export async function update(
    id,
    grupoDatos,
    dto
) {
    /*
    Descripcion:
    Actualiza una enfermedad perteneciente al grupo
    autenticado.

    El campo grupo_datos no puede modificarse.
    */

    const sql = `
        UPDATE enfermedades
        SET
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            tipo_registro = ?,
            fecha_reporte = ?,
            responsable = ?,
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

    const [resultado] = await db.execute(
        sql,
        [
            dto.fincaId,
            dto.estanqueId,
            dto.colaboradorId,
            dto.tipoRegistro,
            dto.fechaReporte,
            dto.responsable,
            dto.enfermedad,
            dto.severidad,
            dto.mortalidadRegistrada,
            dto.reporte,
            id,
            grupoDatos
        ]
    );

    if (resultado.affectedRows === 0) {
        return null;
    }

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
    Elimina logicamente una enfermedad perteneciente
    al grupo autenticado.
    */

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

    const [resultado] = await db.execute(
        sql,
        [
            id,
            grupoDatos
        ]
    );

    if (resultado.affectedRows === 0) {
        return null;
    }

    return await findByIdIncluyendoEliminados(
        id,
        grupoDatos
    );
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function seleccionarCampos() {
    /*
    Descripcion:
    Define los campos retornados por las consultas SELECT.
    */

    return `
        SELECT
            id,
            uuid,
            grupo_datos AS grupoDatos,
            finca_id AS fincaId,
            estanque_id AS estanqueId,
            colaborador_id AS colaboradorId,
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

function agregarFiltro(
    condiciones,
    valores,
    campo,
    valor
) {
    /*
    Descripcion:
    Agrega un filtro parametrizado cuando el valor
    contiene informacion.
    */

    if (valor === undefined) {
        return;
    }

    if (valor === null) {
        return;
    }

    if (String(valor).trim().length === 0) {
        return;
    }

    condiciones.push(
        campo + ' = ?'
    );

    valores.push(
        valor
    );
}

async function findByIdIncluyendoEliminados(
    id,
    grupoDatos
) {
    /*
    Descripcion:
    Busca un registro incluyendo los eliminados logicamente.
    Se utiliza para devolver el registro luego del DELETE.
    */

    const sql =
        seleccionarCampos() +
        ` WHERE id = ?
        AND grupo_datos = ?
        LIMIT 1`;

    const [rows] = await db.execute(
        sql,
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

function mapearFilas(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL.
    */

    const lista = [];

    for (
        let i = 0;
        i < rows.length;
        i++
    ) {
        lista.push(
            mapearFila(rows[i])
        );
    }

    return lista;
}

function mapearFila(row) {
    /*
    Descripcion:
    Convierte una fila de MySQL al formato camelCase.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupoDatos,
        fincaId: row.fincaId,
        estanqueId: row.estanqueId,
        colaboradorId: row.colaboradorId,
        tipoRegistro: row.tipoRegistro,
        fechaReporte: formatearFecha(
            row.fechaReporte
        ),
        responsable: row.responsable,
        enfermedad: row.enfermedad,
        severidad: row.severidad,
        severidadNombre: obtenerNombreSeveridad(
            row.severidad
        ),
        enfermedadNombre: obtenerNombreEnfermedad(
            row.enfermedad
        ),
        mortalidadRegistrada: row.mortalidadRegistrada,
        reporte: row.reporte,
        activo:
            row.activo === 1 ||
            row.activo === true,
        fechaCreacion: formatearFechaHora(
            row.fechaCreacion
        ),
        fechaActualizacion: formatearFechaHora(
            row.fechaActualizacion
        ),
        deletedAt: formatearFechaHora(
            row.deletedAt
        ),
        version: row.version,
    };
}

function formatearFecha(valor) {
    /*
    Descripcion:
    Formatea una fecha en formato YYYY-MM-DD.
    */

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

    return String(valor).slice(
        0,
        10
    );
}

function formatearFechaHora(valor) {
    /*
    Descripcion:
    Formatea una fecha y hora recibida desde MySQL.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString();
    }

    return String(valor);
}


