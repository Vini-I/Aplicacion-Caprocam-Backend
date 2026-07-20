/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.model.js
Autor: Eduard Salas
Fecha: 6/07/2026
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
    Permite filtrar por finca, estanque y por grupo de datos.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - idFinca: Identificador de la finca.
        - idEstanque: Identificador del estanque.
        - grupoDatos: Codigo del grupo de datos.

    Retorna:
    - Lista de registros de densidad poblacional encontrados.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
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
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM densidad_poblacional
        WHERE deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [];

    if (filtros) {
        if (filtros.idFinca) {
            sql = sql + " AND finca_id = ?";
            params.push(filtros.idFinca);
        }

        if (filtros.idEstanque) {
            sql = sql + " AND estanque_id = ?";
            params.push(filtros.idEstanque);
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

export async function findById(id,grupoDatos) {
    /*
    Descripcion:
    Busca un registro de densidad poblacional activo por su
    identificador numerico.

    Parametros:
    - id: Identificador del registro.

    Retorna:
    - El registro encontrado.
    - null si no existe o si fue eliminado logicamente.
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
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
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM densidad_poblacional
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [id,grupoDatos]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function findByFechaAndEstanque(fecha, idEstanque, idIgnorado, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de densidad poblacional por fecha y estanque.
    Se utiliza para evitar registrar dos conteos el mismo dia
    para el mismo estanque.
    Permite ignorar un id especifico cuando se esta actualizando un registro.

    Parametros:
    - fecha: Fecha del conteo.
    - idEstanque: Identificador del estanque.
    - idIgnorado: Identificador que se debe ignorar en la busqueda.

    Retorna:
    - El registro encontrado.
    - null si no existe coincidencia.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
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
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM densidad_poblacional
        WHERE fecha = ?
        AND estanque_id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [fecha, idEstanque,grupoDatos];

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
    /*
    Descripcion:
    Inserta un nuevo registro de densidad poblacional en la base de datos.

    Parametros:
    - dto: Objeto DensidadPoblacionalDTO con los datos normalizados.

    Retorna:
    - El registro creado consultado nuevamente desde la base de datos.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fecha = normalizarFechaMysql(dto.fecha);

    const [result] = await pool.execute(
        `
        INSERT INTO densidad_poblacional (
            grupo_datos,
            finca_id,
            estanque_id,
            fecha,
            cantidad_siembra,
            area_estanque,
            numero_camarones,
            tiros_atarraya,
            area_atarraya,
            promedio_por_tiro,
            sobrevivencia,
            densidad,
            notas_conteo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.idEstanque,
            fecha,
            dto.cantidadSiembra,
            dto.areaEstanque,
            dto.numeroCamarones,
            dto.tirosAtarraya,
            dto.areaAtarraya,
            dto.promedioPorTiro,
            dto.sobrevivencia,
            dto.densidad,
            dto.notasConteo
        ]
    );

    return await findById(result.insertId,grupoDatos);
}

export async function update(id, dto,grupoDatos) {
    /*
    Descripcion:
    Actualiza un registro de densidad poblacional existente en la base de datos.
    Tambien incrementa la version del registro para control de cambios.

    Parametros:
    - id: Identificador del registro que se desea actualizar.
    - dto: Objeto DensidadPoblacionalDTO con los datos actualizados.

    Retorna:
    - El registro actualizado.
    - null si el registro no existe o fue eliminado logicamente.
    */

    const actual = await findById(id,grupoDatos);

    if (!actual) {
        return null;
    }

    const fecha = normalizarFechaMysql(dto.fecha);

    await pool.execute(
        `
        UPDATE densidad_poblacional
        SET
            finca_id = ?,
            estanque_id = ?,
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

    return await findById(id,grupoDatos);
}

export async function remove(id,grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente un registro de densidad poblacional.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    Parametros:
    - id: Identificador del registro que se desea eliminar.

    Retorna:
    - El registro eliminado logicamente.
    - null si el registro no existe o ya fue eliminado.
    */

    const actual = await findById(id,grupoDatos);

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
        AND grupo_datos=?
        `,
        [id,grupoDatos]
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
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function obtenerGrupoDatos(valor) {
/*
Descripcion:
Obtiene y valida el grupo de datos recibido.
Verifica que el valor exista y que corresponda a un numero
mayor que cero antes de utilizarlo en las consultas de la
base de datos.

Parametros:
- valor: Valor recibido como grupo de datos.

Retorna:
- Numero del grupo de datos cuando el valor es valido.
- null si el valor no existe, no es numerico o es menor
  o igual a cero.
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