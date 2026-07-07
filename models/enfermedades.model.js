/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: enfermedades.model.js
Autor: Isaac
Fecha: 03/07/2026
Modulo: Enfermedades
Descripcion:
Capa de datos del modulo de enfermedades.
Trabaja con MySQL mediante config/database.js.
No realiza DELETE fisico, solo borrado logico.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Base de datos
*/

import db from '../config/database.js';

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con la tabla enfermedades.
*/

export async function findAll(filtros) {
    /*
    Descripcion:
    Obtiene todos los registros activos de enfermedades.
    Filtra por grupo_datos y filtros opcionales.

    Parametros:
    - filtros: Objeto con filtros de busqueda.

    Retorna:
    - Lista con los registros encontrados.
    */

    const valores = [];
    const condiciones = [
        'grupo_datos = ?',
        'activo = TRUE',
        'deleted_at IS NULL',
    ];

    valores.push(filtros.grupoDatos);

    agregarFiltro(condiciones, valores, 'finca_id', filtros.fincaId);
    agregarFiltro(condiciones, valores, 'estanque_id', filtros.estanqueId);
    agregarFiltro(condiciones, valores, 'colaborador_id', filtros.colaboradorId);
    agregarFiltro(condiciones, valores, 'enfermedad', filtros.enfermedad);
    agregarFiltro(condiciones, valores, 'severidad', filtros.severidad);
    agregarFiltro(condiciones, valores, 'fecha_reporte', filtros.fechaReporte);

    const sql = seleccionarCampos() +
        ' WHERE ' + condiciones.join(' AND ') +
        ' ORDER BY fecha_reporte DESC, id DESC';

    const [rows] = await db.execute(sql, valores);

    return mapearFilas(rows);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro activo de enfermedad por su ID y grupo_datos.

    Parametros:
    - id: ID del registro.
    - grupoDatos: Grupo de datos al que pertenece el registro.

    Retorna:
    - Registro encontrado.
    - null si no existe.
    */

    const sql = seleccionarCampos() +
        ' WHERE id = ?' +
        ' AND grupo_datos = ?' +
        ' AND activo = TRUE' +
        ' AND deleted_at IS NULL' +
        ' LIMIT 1';

    const valores = [id, grupoDatos];
    const [rows] = await db.execute(sql, valores);

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function create(dto) {
    /*
    Descripcion:
    Crea un nuevo registro de enfermedad en MySQL.

    Parametros:
    - dto: Objeto EnfermedadDTO con los datos del nuevo registro.

    Retorna:
    - Registro creado.
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

    const valores = [
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
        dto.reporte,
    ];

    const [resultado] = await db.execute(sql, valores);

    return findById(resultado.insertId, dto.grupoDatos);
}

export async function update(id, grupoDatos, dto) {
    /*
    Descripcion:
    Actualiza un registro de enfermedad existente.
    Aumenta la version del registro.

    Parametros:
    - id: ID del registro.
    - grupoDatos: Grupo de datos del registro.
    - dto: Objeto EnfermedadDTO con los nuevos datos.

    Retorna:
    - Registro actualizado.
    - null si no existe.
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

    const valores = [
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
        grupoDatos,
    ];

    const [resultado] = await db.execute(sql, valores);

    if (resultado.affectedRows === 0) {
        return null;
    }

    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente un registro de enfermedad.
    No realiza DELETE fisico.

    Parametros:
    - id: ID del registro.
    - grupoDatos: Grupo de datos del registro.

    Retorna:
    - Registro eliminado logicamente.
    - null si no existe.
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

    const valores = [id, grupoDatos];
    const [resultado] = await db.execute(sql, valores);

    if (resultado.affectedRows === 0) {
        return null;
    }

    return findByIdIncluyendoEliminados(id, grupoDatos);
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Funciones internas para SQL y mapeo de datos.
*/

function seleccionarCampos() {
    /*
    Descripcion:
    Define los campos que se consultan en la tabla enfermedades.

    Parametros:
    No posee.

    Retorna:
    - Fragmento SQL con alias camelCase.
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

function agregarFiltro(condiciones, valores, campo, valor) {
    /*
    Descripcion:
    Agrega un filtro SQL cuando el valor tiene contenido.

    Parametros:
    - condiciones: Lista de condiciones SQL.
    - valores: Lista de valores parametrizados.
    - campo: Campo de la tabla.
    - valor: Valor del filtro.

    Retorna:
    No retorna valor.
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

    condiciones.push(campo + ' = ?');
    valores.push(valor);
}

async function findByIdIncluyendoEliminados(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro incluyendo los eliminados logicamente.
    Se usa para devolver el registro despues del borrado logico.

    Parametros:
    - id: ID del registro.
    - grupoDatos: Grupo de datos.

    Retorna:
    - Registro encontrado.
    - null si no existe.
    */

    const sql = seleccionarCampos() +
        ' WHERE id = ?' +
        ' AND grupo_datos = ?' +
        ' LIMIT 1';

    const valores = [id, grupoDatos];
    const [rows] = await db.execute(sql, valores);

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

function mapearFilas(rows) {
    /*
    Descripcion:
    Convierte una lista de filas MySQL a objetos camelCase.

    Parametros:
    - rows: Filas devueltas por MySQL.

    Retorna:
    - Lista mapeada.
    */

    const lista = [];

    for (let i = 0; i < rows.length; i++) {
        lista.push(mapearFila(rows[i]));
    }

    return lista;
}

function mapearFila(row) {
    /*
    Descripcion:
    Convierte una fila MySQL a un objeto usado por el frontend.

    Parametros:
    - row: Fila devuelta por MySQL.

    Retorna:
    - Objeto camelCase.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupoDatos,
        fincaId: row.fincaId,
        estanqueId: row.estanqueId,
        colaboradorId: row.colaboradorId,
        tipoRegistro: row.tipoRegistro,
        fechaReporte: formatearFecha(row.fechaReporte),
        responsable: row.responsable,
        enfermedad: row.enfermedad,
        severidad: row.severidad,
        severidadNombre: obtenerNombreSeveridad(row.severidad),
        enfermedadNombre: obtenerNombreEnfermedad(row.enfermedad),
        mortalidadRegistrada: row.mortalidadRegistrada,
        reporte: row.reporte,
        activo: row.activo === 1 || row.activo === true,
        fechaCreacion: formatearFechaHora(row.fechaCreacion),
        fechaActualizacion: formatearFechaHora(row.fechaActualizacion),
        deletedAt: formatearFechaHora(row.deletedAt),
        version: row.version,
    };
}

function formatearFecha(valor) {
    /*
    Descripcion:
    Formatea una fecha DATE a yyyy-mm-dd.

    Parametros:
    - valor: Valor fecha recibido desde MySQL.

    Retorna:
    - Fecha formateada o null.
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

    return String(valor).slice(0, 10);
}

function formatearFechaHora(valor) {
    /*
    Descripcion:
    Formatea una fecha DATETIME a ISO string.

    Parametros:
    - valor: Valor fecha recibido desde MySQL.

    Retorna:
    - Fecha formateada o null.
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

function obtenerNombreSeveridad(severidad) {
    /*
    Descripcion:
    Obtiene el nombre visible de la severidad.

    Parametros:
    - severidad: Valor de severidad.

    Retorna:
    - Nombre visible.
    */

    if (severidad === 'medio') {
        return 'Medio';
    }

    if (severidad === 'alto') {
        return 'Alto';
    }

    if (severidad === 'critica') {
        return 'Critica';
    }

    return 'Bajo';
}

function obtenerNombreEnfermedad(enfermedad) {
    if (enfermedad === 'WSSV - Mancha Blanca' || enfermedad === 'wssv') {
        return 'WSSV - Mancha Blanca';
    }

    if (enfermedad === 'AHPND - Necrosis hepatopancreatica aguda' || enfermedad === 'ahpnd') {
        return 'AHPND - Necrosis hepatopancreatica aguda';
    }

    if (enfermedad === 'Vibriosis' || enfermedad === 'vibriosis') {
        return 'Vibriosis';
    }

    if (enfermedad === 'IHHNV' || enfermedad === 'ihhnv') {
        return 'IHHNV';
    }

    if (enfermedad === 'NHP - Hepatobacter penaei' || enfermedad === 'nhp') {
        return 'NHP - Hepatobacter penaei';
    }

    return 'Otro';
}
