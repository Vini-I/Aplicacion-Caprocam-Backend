/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.model.js
Autor: Eduard Salas
Modulo: Densidad Poblacional
Descripcion:
Capa de datos del modulo de densidad poblacional.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener, crear,
actualizar y eliminar logicamente registros de densidad
poblacional.
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
CONSTANTES
//////////////////////////////////////////////////////////

Columnas seleccionadas en todas las consultas de lectura.
dp = densidad_poblacional, u = usuarios (LEFT JOIN).
*/

const SELECT_BASE = `
    SELECT
        dp.id,
        dp.uuid,
        dp.grupo_datos,
        dp.finca_id,
        dp.estanque_id,
        dp.colaborador_id,
        c.nombre AS usuario_nombre,
        dp.creado_por_usuario_id,
        dp.creado_por_colaborador_id,
        dp.fecha,
        dp.cantidad_siembra,
        dp.area_estanque,
        dp.numero_camarones,
        dp.tiros_atarraya,
        dp.area_atarraya,
        dp.promedio_por_tiro,
        dp.sobrevivencia,
        dp.densidad,
        dp.notas_conteo,
        dp.creado_por_usuario_id,
        dp.creado_por_colaborador_id,
        dp.activo,
        dp.fecha_creacion,
        dp.fecha_actualizacion,
        dp.deleted_at,
        dp.version
    FROM densidad_poblacional dp
    LEFT JOIN colaboradores c ON c.id = dp.colaborador_id
`;

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
    Obtiene todos los registros de densidad poblacional activos
    desde la base de datos.
    Permite filtrar por finca, estanque, grupo de datos y por el
    usuario que hizo el registro.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - idFinca: Identificador de la finca.
        - idEstanque: Identificador del estanque.
        - grupoDatos: Codigo del grupo de datos.
        - idUsuario: Identificador del usuario que hizo el registro.

    Retorna:
    - Lista de registros de densidad poblacional encontrados.
    */

    let sql = SELECT_BASE + " WHERE dp.deleted_at IS NULL AND dp.activo = TRUE";

    const params = [];

    if (filtros) {
        if (filtros.idFinca) {
            sql = sql + " AND dp.finca_id = ?";
            params.push(filtros.idFinca);
        }

        if (filtros.idEstanque) {
            sql = sql + " AND dp.estanque_id = ?";
            params.push(filtros.idEstanque);
        }

        if (filtros.grupoDatos) {
            sql = sql + " AND dp.grupo_datos = ?";
            params.push(filtros.grupoDatos);
        }

        if (filtros.idUsuario) {
            sql = sql + " AND dp.colaborador_id = ?";
            params.push(filtros.idUsuario);
        }
    }

    sql = sql + " ORDER BY dp.id DESC";

    const [rows] = await pool.execute(sql, params);

    return mapearLista(rows);
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de densidad poblacional activo por su
    identificador numerico, dentro del grupo de datos del usuario
    autenticado.

    Parametros:
    - id: Identificador del registro.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - El registro encontrado.
    - null si no existe, no pertenece al grupo, o fue eliminado logicamente.
    */

    const [rows] = await pool.execute(
        SELECT_BASE + `
        WHERE dp.id = ?
        AND dp.grupo_datos = ?
        AND dp.deleted_at IS NULL
        AND dp.activo = TRUE
        LIMIT 1
        `,
        [id, grupoDatos]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function findByFechaAndEstanque(fecha, idEstanque, idIgnorado, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de densidad poblacional por fecha y estanque,
    dentro del grupo de datos del usuario autenticado.
    Se utiliza para evitar registrar dos conteos el mismo dia
    para el mismo estanque.
    Permite ignorar un id especifico cuando se esta actualizando un registro.

    Parametros:
    - fecha: Fecha del conteo.
    - idEstanque: Identificador del estanque.
    - idIgnorado: Identificador que se debe ignorar en la busqueda.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - El registro encontrado.
    - null si no existe coincidencia.
    */

    let sql = SELECT_BASE + `
        WHERE dp.fecha = ?
        AND dp.estanque_id = ?
        AND dp.grupo_datos = ?
        AND dp.deleted_at IS NULL
        AND dp.activo = TRUE
    `;

    const params = [fecha, idEstanque, grupoDatos];

    if (idIgnorado !== null) {
        if (idIgnorado !== undefined) {
            sql = sql + " AND dp.id <> ?";
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
    /*
    Descripcion:
    Inserta un nuevo registro de densidad poblacional en la base de datos.
    grupoDatos debe venir ya resuelto desde el JWT (ver controller y
    dto): si falta o es invalido, se rechaza la insercion en vez de
    asumir un valor por defecto. De creadoPorUsuarioId/
    creadoPorColaboradorId debe venir presente exactamente uno.

    Parametros:
    - dto: Objeto DensidadPoblacionalDTO con los datos normalizados.

    Retorna:
    - El registro creado consultado nuevamente desde la base de datos.

    Lanza:
    - Error si dto.grupoDatos no es valido.
    - Error si dto.creadoPorUsuarioId y dto.creadoPorColaboradorId
      estan ambos ausentes.
    */

    const grupoDatos = obtenerNumeroValido(dto.grupoDatos);
    const creadoPorUsuarioId = obtenerNumeroValido(dto.creadoPorUsuarioId);
    const creadoPorColaboradorId = obtenerNumeroValido(dto.creadoPorColaboradorId);

    if (grupoDatos === null) {
        throw new Error("No se pudo determinar el grupo de datos del usuario autenticado.");
    }

    if (creadoPorUsuarioId === null && creadoPorColaboradorId === null) {
        throw new Error("No se pudo determinar quien hizo el registro (usuario o colaborador autenticado).");
    }

    /*
    colaborador_id (quien realizo el conteo/medicion) es distinto de
    creado_por_colaborador_id (quien autentico la peticion). Antes
    este valor se llenaba con el id crudo del JWT sin distinguir si
    era un Usuario Web o un Colaborador APK, lo que podia violar la
    llave foranea hacia "colaboradores" o guardar un id equivocado.
    Ahora: si el body trae un colaborador especifico (dto.idColaborador),
    se usa ese; si no, se asume el colaborador que autentico la
    peticion (cuando fue registrado desde la APK). Si fue un Usuario
    Web sin colaborador especificado, queda en NULL (la columna lo
    permite).
    */
    const idColaboradorEnviado = obtenerNumeroValido(dto.idColaborador);
    const colaboradorId = idColaboradorEnviado !== null ? idColaboradorEnviado : creadoPorColaboradorId;

    const fecha = normalizarFechaMysql(dto.fecha);

    const [result] = await pool.execute(
        `
        INSERT INTO densidad_poblacional (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            fecha,
            cantidad_siembra,
            area_estanque,
            numero_camarones,
            tiros_atarraya,
            area_atarraya,
            promedio_por_tiro,
            sobrevivencia,
            densidad,
            notas_conteo,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.idEstanque,
            colaboradorId,
            fecha,
            dto.cantidadSiembra,
            dto.areaEstanque,
            dto.numeroCamarones,
            dto.tirosAtarraya,
            dto.areaAtarraya,
            dto.promedioPorTiro,
            dto.sobrevivencia,
            dto.densidad,
            dto.notasConteo,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        ]
    );

    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un registro de densidad poblacional existente en la base de datos.
    Tambien incrementa la version del registro para control de cambios.

    IMPORTANTE: usuario_id (quien hizo el registro originalmente)
    es un campo de auditoria y NUNCA se modifica aqui, sin importar
    quien este editando el registro.

    Parametros:
    - id: Identificador del registro que se desea actualizar.
    - dto: Objeto DensidadPoblacionalDTO con los datos actualizados.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - El registro actualizado.
    - null si el registro no existe, no pertenece al grupo, o fue eliminado logicamente.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    const fecha = normalizarFechaMysql(dto.fecha);

    /*
    Si el dto no trae idColaborador (no se reenvio desde el
    formulario), se conserva el valor que ya tenia el registro en
    vez de sobreescribirlo con null.
    */
    const idColaboradorEnviado = obtenerNumeroValido(dto.idColaborador);
    const colaboradorId = idColaboradorEnviado !== null ? idColaboradorEnviado : actual.idColaborador;

    await pool.execute(
        `
        UPDATE densidad_poblacional
        SET
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            fecha = ?,
            cantidad_siembra = ?,
            area_estanque = ?,
            numero_camarones = ?,
            tiros_atarraya = ?,
            area_atarraya = ?,
            promedio_por_tiro = ?,
            sobrevivencia = ?,
            densidad = ?,
            notas_conteo = ?,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            dto.idFinca,
            dto.idEstanque,
            colaboradorId,
            fecha,
            dto.cantidadSiembra,
            dto.areaEstanque,
            dto.numeroCamarones,
            dto.tirosAtarraya,
            dto.areaAtarraya,
            dto.promedioPorTiro,
            dto.sobrevivencia,
            dto.densidad,
            dto.notasConteo,
            id,
            grupoDatos
        ]
    );

    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente un registro de densidad poblacional.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    Parametros:
    - id: Identificador del registro que se desea eliminar.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - El registro eliminado logicamente.
    - null si el registro no existe, no pertenece al grupo, o ya fue eliminado.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE densidad_poblacional
        SET
            activo = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            version = version + 1
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        AND grupo_datos = ?
        `,
        [id, grupoDatos]
    );

    return actual;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas usadas por el modelo para mapear,
normalizar y convertir datos.
*/

function mapearLista(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato usado por
    el backend y el frontend.

    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.

    Retorna:
    - Lista de registros de densidad poblacional mapeados.
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
    Convierte una fila de MySQL en un objeto con formato camelCase.
    Tambien convierte tipos de datos como numeros, fechas y booleanos.
    Incluye usuarioId (id de quien hizo el registro) y
    usuarioNombre (su nombre, obtenido por el LEFT JOIN con
    usuarios; viene null si el registro es anterior a esta
    migracion y no tiene usuario_id asignado).

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto densidad poblacional en el formato esperado por el backend/frontend.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        idEstanque: row.estanque_id,
        idColaborador: row.colaborador_id,
        usuarioId: row.colaborador_id,
        usuarioNombre: row.usuario_nombre,
        creadoPorUsuarioId: row.creado_por_usuario_id,
        creadoPorColaboradorId: row.creado_por_colaborador_id,
        fecha: formatearFecha(row.fecha),
        cantidadSiembra: convertirNumero(row.cantidad_siembra),
        areaEstanque: convertirNumero(row.area_estanque),
        numeroCamarones: convertirNumero(row.numero_camarones),
        tirosAtarraya: convertirNumero(row.tiros_atarraya),
        areaAtarraya: convertirNumero(row.area_atarraya),
        promedioPorTiro: convertirNumero(row.promedio_por_tiro),
        sobrevivencia: convertirNumero(row.sobrevivencia),
        densidad: convertirNumero(row.densidad),
        notasConteo: row.notas_conteo,
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
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.
    Se usa para grupoDatos y usuarioId antes de insertar, ya que
    ambos son obligatorios y deben venir del JWT (nunca del body).

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero valido cuando el valor es numerico y mayor que cero.
    - null si el valor no existe, no es numerico o es menor o igual a cero.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero) || numero <= 0) {
        return null;
    }

    return numero;
}

function normalizarFechaMysql(valor) {
    /*
    Descripcion:
    Convierte una fecha al formato YYYY-MM-DD compatible con MySQL.
    Acepta fechas tipo Date, YYYY-MM-DD o DD/MM/YYYY.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - Fecha en formato YYYY-MM-DD.
    */

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

function convertirNumero(valor) {
    /*
    Descripcion:
    Convierte un valor recibido desde MySQL a numero.
    Si el valor no existe, retorna null.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero convertido.
    - null si no existe valor.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    return Number(valor);
}