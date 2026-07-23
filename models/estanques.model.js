/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.model.js
Autor: Gerald Alfaro
Fecha: 18/07/2026
Modulo: Estanques
Descripcion:
Capa de datos del modulo de estanques.
Trabaja con la base de datos principal MySQL.
Todas las operaciones utilizan el grupo de datos obtenido
desde el JWT para proteger los registros.
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
    Obtiene los estanques activos que pertenecen al grupo
    de datos del usuario autenticado.
    Permite filtrar opcionalmente por finca.

    Parametros:
    - filtros: Objeto con grupoDatos e idFinca opcional.

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
        WHERE grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [
        filtros.grupoDatos
    ];

    if (filtros.idFinca) {
        sql = sql + " AND finca_id = ?";
        params.push(
            filtros.idFinca
        );
    }

    sql = sql + " ORDER BY id DESC";

    const [rows] = await pool.execute(
        sql,
        params
    );

    return mapearLista(
        rows
    );
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un estanque activo por su identificador numerico
    y por el grupo de datos del usuario autenticado.

    Parametros:
    - id: Identificador del estanque.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El estanque encontrado.
    - null si no existe, fue eliminado o pertenece a otro grupo.
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
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
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

export async function findByCodigoAndFinca(
    codigo,
    idFinca,
    idIgnorado,
    grupoDatos
) {
    /*
    Descripcion:
    Busca un estanque por codigo, finca y grupo de datos.
    Permite ignorar un id durante una actualizacion.

    Parametros:
    - codigo: Codigo del estanque.
    - idFinca: Identificador de la finca.
    - idIgnorado: Identificador que se debe ignorar.
    - grupoDatos: Grupo obtenido desde el JWT.

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
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [
        codigo,
        idFinca,
        grupoDatos
    ];

    if (idIgnorado !== null) {
        if (idIgnorado !== undefined) {
            sql = sql + " AND id <> ?";
            params.push(
                idIgnorado
            );
        }
    }

    sql = sql + " LIMIT 1";

    const [rows] = await pool.execute(
        sql,
        params
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(
        rows[0]
    );
}

export async function fincaPerteneceGrupo(
    idFinca,
    grupoDatos
) {
    /*
    Descripcion:
    Verifica que una finca exista, se encuentre activa
    y pertenezca al grupo de datos del usuario.

    Parametros:
    - idFinca: Identificador de la finca.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - true si la finca pertenece al grupo.
    - false si no existe o pertenece a otro grupo.
    */

    const [rows] = await pool.execute(
        `
        SELECT id
        FROM fincas
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [
            idFinca,
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
    Inserta un nuevo estanque utilizando el grupo de datos
    recibido desde el controller.

    Parametros:
    - dto: Objeto EstanqueDTO con datos normalizados.

    Retorna:
    - El estanque creado.
    */

    const fechaSiembra = normalizarFechaMysqlOpcional(
        dto.fechaSiembra
    );

    const fechaInicioEngorde = normalizarFechaMysqlOpcional(
        dto.fechaInicioEngorde
    );

    const fechaMantenimiento = normalizarFechaMysqlOpcional(
        dto.fechaMantenimiento
    );

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
            dto.grupoDatos,
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

    return await findById(
        result.insertId,
        dto.grupoDatos
    );
}

export async function update(
    id,
    dto,
    grupoDatos
) {
    /*
    Descripcion:
    Actualiza un estanque que pertenece al grupo del usuario.
    El campo grupo_datos no se modifica.

    Parametros:
    - id: Identificador del estanque.
    - dto: Datos actualizados.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El estanque actualizado.
    - null si no existe o pertenece a otro grupo.
    */

    const actual = await findById(
        id,
        grupoDatos
    );

    if (!actual) {
        return null;
    }

    const fechaSiembra = normalizarFechaMysqlOpcional(
        dto.fechaSiembra
    );

    const fechaInicioEngorde = normalizarFechaMysqlOpcional(
        dto.fechaInicioEngorde
    );

    const fechaMantenimiento = normalizarFechaMysqlOpcional(
        dto.fechaMantenimiento
    );

    await pool.execute(
        `
        UPDATE estanques
        SET
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
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
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
            id,
            grupoDatos
        ]
    );

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
    Elimina logicamente un estanque que pertenece al grupo
    de datos del usuario autenticado.

    Parametros:
    - id: Identificador del estanque.
    - grupoDatos: Grupo obtenido desde el JWT.

    Retorna:
    - El estanque eliminado logicamente.
    - null si no existe o pertenece a otro grupo.
    */

    const actual = await findById(
        id,
        grupoDatos
    );

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

Contiene funciones internas usadas por el modelo para
mapear, normalizar y convertir datos.
*/

function mapearLista(rows) {
    /*
    Descripcion:
    Convierte una lista de filas de MySQL al formato usado
    por el backend y el frontend.

    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.

    Retorna:
    - Lista de estanques mapeados.
    */

    const resultado = [];

    for (let i = 0; i < rows.length; i++) {
        resultado.push(
            mapearFila(rows[i])
        );
    }

    return resultado;
}

function mapearFila(row) {
    /*
    Descripcion:
    Convierte una fila de MySQL en un objeto camelCase.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto estanque.
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
        fechaSiembra: formatearFecha(
            row.fecha_siembra
        ),
        fechaInicioEngorde: formatearFecha(
            row.fecha_inicio_engorde
        ),
        fechaMantenimiento: formatearFecha(
            row.fecha_mantenimiento
        ),
        densidadSiembra: convertirNumero(
            row.densidad_siembra
        ),
        usaPrecria: Boolean(
            row.usa_precria
        ),
        metodoAlimentacion: row.metodo_alimentacion,
        proveedorAlimento: row.proveedor_alimento,
        numeroAireadores: row.numero_aireadores,
        tieneAlimentadorAutomatico: Boolean(
            row.tiene_alimentador_automatico
        ),
        activo: Boolean(
            row.activo
        ),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function normalizarFechaMysqlOpcional(valor) {
    /*
    Descripcion:
    Normaliza una fecha opcional para guardarla en MySQL.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - Fecha compatible con MySQL o null.
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

    return normalizarFechaMysql(
        valor
    );
}

function normalizarFechaMysql(valor) {
    /*
    Descripcion:
    Convierte una fecha al formato YYYY-MM-DD.
    Acepta Date, YYYY-MM-DD o DD/MM/YYYY.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    - Fecha en formato YYYY-MM-DD.
    */

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

            const anio = partes[2];

            return anio + "-" + mes + "-" + dia;
        }
    }

    return texto;
}

function formatearFecha(valor) {
    /*
    Descripcion:
    Formatea una fecha recibida desde MySQL.

    Parametros:
    - valor: Fecha recibida desde MySQL.

    Retorna:
    - Fecha YYYY-MM-DD o null.
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

    return String(valor);
}

function convertirNumero(valor) {
    /*
    Descripcion:
    Convierte un valor recibido desde MySQL a numero.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero convertido o null.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    return Number(valor);
}