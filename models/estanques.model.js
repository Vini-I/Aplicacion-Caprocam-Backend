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
Contiene las consultas necesarias para obtener, crear,
actualizar y eliminar logicamente estanques.
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
    Obtiene todos los estanques activos desde la base de datos.
    Permite filtrar por finca y por grupo de datos.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - idFinca: Identificador de la finca.
        - grupoDatos: Codigo del grupo de datos.

    Retorna:
    - Lista de estanques encontrados.
    */

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
    /*
    Descripcion:
    Busca un estanque activo por su identificador numerico.

    Parametros:
    - id: Identificador del estanque.

    Retorna:
    - El estanque encontrado.
    - null si no existe o si fue eliminado logicamente.
    */

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
    /*
    Descripcion:
    Busca un estanque por codigo y finca.
    Se utiliza para evitar codigos duplicados dentro de una misma finca.
    Permite ignorar un id especifico cuando se esta actualizando un registro.

    Parametros:
    - codigo: Codigo del estanque.
    - idFinca: Identificador de la finca.
    - idIgnorado: Identificador que se debe ignorar en la busqueda.

    Retorna:
    - El estanque encontrado.
    - null si no existe coincidencia.
    */

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
    /*
    Descripcion:
    Inserta un nuevo estanque en la base de datos.

    Parametros:
    - dto: Objeto EstanqueDTO con los datos normalizados del estanque.

    Retorna:
    - El estanque creado consultado nuevamente desde la base de datos.
    */

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
    /*
    Descripcion:
    Actualiza un estanque existente en la base de datos.
    Tambien incrementa la version del registro para control de cambios.

    Parametros:
    - id: Identificador del estanque que se desea actualizar.
    - dto: Objeto EstanqueDTO con los datos actualizados.

    Retorna:
    - El estanque actualizado.
    - null si el estanque no existe o fue eliminado logicamente.
    */

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
    /*
    Descripcion:
    Elimina logicamente un estanque.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    Parametros:
    - id: Identificador del estanque que se desea eliminar.

    Retorna:
    - El estanque eliminado logicamente.
    - null si el estanque no existe o ya fue eliminado.
    */

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
    - Lista de estanques mapeados.
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
    - Objeto estanque en el formato esperado por el backend/frontend.
    */

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

function normalizarFechaMysqlOpcional(valor) {
    /*
    Descripcion:
    Normaliza una fecha opcional para guardarla en MySQL.
    Si la fecha viene vacia, undefined o null, retorna null.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - Fecha en formato compatible con MySQL o null.
    */

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