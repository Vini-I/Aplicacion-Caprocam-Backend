/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.model.js
Autor: Andres Gutierrez
Fecha: 03/07/2026
Modulo: Parasitologias
Descripcion:
Capa de datos del modulo de parasitologias.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener, crear,
actualizar y eliminar logicamente registros de parasitologia.
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
    Obtiene todos los registros activos de parasitologias desde
    la base de datos. Permite filtrar por grupo de datos, finca,
    estanque, parasito y fecha de reporte.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - grupoDatos: Codigo del grupo de datos.
        - fincaId: Identificador de la finca.
        - estanqueId: Identificador del estanque.
        - parasito: Tipo de parasito.
        - fechaReporte: Fecha del reporte.

    Retorna:
    - Lista de registros de parasitologias encontrados.
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
        WHERE deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [];

    if (filtros) {
        if (filtros.grupoDatos) {
            sql = sql + " AND grupo_datos = ?";
            params.push(filtros.grupoDatos);
        }

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
            params.push(normalizarFechaMysql(filtros.fechaReporte));
        }
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(sql, params);

    return mapearLista(rows);
}

export async function findById(id) {
    /*
    Descripcion:
    Busca un registro activo de parasitologia por su identificador
    numerico.

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

export async function create(dto) {
    /*
    Descripcion:
    Inserta un nuevo registro de parasitologia en la base de datos.

    Parametros:
    - dto: Objeto ParasitologiaDTO con los datos normalizados.

    Retorna:
    - El registro creado consultado nuevamente desde la base de datos.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fechaReporte = normalizarFechaMysql(dto.fechaReporte);

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
            grupoDatos,
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

    return await findById(result.insertId);
}

export async function update(id, dto) {
    /*
    Descripcion:
    Actualiza un registro de parasitologia existente en la base
    de datos. Tambien incrementa la version del registro para
    control de cambios.

    Parametros:
    - id: Identificador del registro que se desea actualizar.
    - dto: Objeto ParasitologiaDTO con los datos actualizados.

    Retorna:
    - El registro actualizado.
    - null si el registro no existe o fue eliminado logicamente.
    */

    const actual = await findById(id);

    if (!actual) {
        return null;
    }

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fechaReporte = normalizarFechaMysql(dto.fechaReporte);

    await pool.execute(
        `
        UPDATE parasitologias
        SET
            grupo_datos = ?,
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
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            grupoDatos,
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
            id
        ]
    );

    return await findById(id);
}

export async function remove(id) {
    /*
    Descripcion:
    Elimina logicamente un registro de parasitologia.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    Parametros:
    - id: Identificador del registro que se desea eliminar.

    Retorna:
    - El registro eliminado logicamente.
    - null si el registro no existe o ya fue eliminado.
    */

    const actual = await findById(id);

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
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [id]
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
    - Lista de registros mapeados.
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
    - Objeto parasitologia en el formato esperado por el backend/frontend.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueId: row.estanque_id,
        colaboradorId: row.colaborador_id,
        tipoRegistro: row.tipo_registro,
        fechaReporte: formatearFecha(row.fecha_reporte),
        responsable: row.responsable,
        parasito: row.parasito,
        camaronesMuestreados: Number(row.camarones_muestreados),
        camaronesInfectados: Number(row.camarones_infectados),
        porcentajeInfeccion: convertirNumero(row.porcentaje_infeccion),
        gradoInfeccion: row.grado_infeccion,
        observaciones: row.observaciones,
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
    Obtiene el grupo de datos del registro.
    Si no viene definido, utiliza el grupo 1 como valor temporal
    para pruebas mientras se implementa la autenticacion.

    Parametros:
    - valor: Valor recibido como grupo de datos.

    Retorna:
    - Numero del grupo de datos.
    */

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