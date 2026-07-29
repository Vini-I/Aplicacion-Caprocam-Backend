/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: trazabilidad.model.js
Autor: Brandon
Fecha: 05/07/2026
Modulo: Trazabilidad
Descripcion:
Capa de datos del modulo de trazabilidad.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener,
crear y eliminar logicamente registros de
trazabilidad.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Configuracion de base de datos.
*/

import pool from "../config/database.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Constantes utilizadas por el modelo.
*/

const TIPO_MOVIMIENTO = "SIEMBRA";

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
directamente con la base de datos MySQL.
*/

export async function findAll(grupoDatos) {

    /*
    Descripcion:
    Obtiene todos los registros activos de
    trazabilidad que pertenecen al grupo de
    datos del usuario autenticado (JWT).

    Parametros:
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    Lista de registros.
    */

    const [rows] = await pool.execute(`
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_origen_id,
            estanque_destino_id,
            colaborador_id,
            fecha,
            tamano,
            dias,
            pl,
            tipo_movimiento,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM trazabilidad
        WHERE deleted_at IS NULL
        AND activo = TRUE
        AND grupo_datos = ?
        ORDER BY id DESC
    `, [grupoDatos]);

    return mapearLista(rows);
}

export async function findById(id, grupoDatos) {

    /*
    Descripcion:
    Busca un registro por su identificador, limitado
    al grupo de datos del usuario autenticado (JWT).

    Parametros:
    - id: Identificador del registro.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    Registro encontrado o null.
    */

    const [rows] = await pool.execute(`
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_origen_id,
            estanque_destino_id,
            colaborador_id,
            fecha,
            tamano,
            dias,
            pl,
            tipo_movimiento,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM trazabilidad
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        AND grupo_datos = ?
        LIMIT 1
    `, [id, grupoDatos]);

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function obtenerUltimoMovimientoPorEstanque(estanqueId, grupoDatos) {

    /*
    Descripcion:
    Obtiene el ultimo movimiento activo (por fecha, luego
    por id) en el que participa un estanque, ya sea como
    origen o como destino, dentro del grupo de datos del
    usuario autenticado. Permite determinar si el estanque
    quedo ocupado o si ya fue liberado por un movimiento
    posterior.

    Parametros:
    - estanqueId: Identificador del estanque a revisar.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - El ultimo movimiento encontrado (fila cruda).
    - null si el estanque nunca participo en un movimiento.
    */

    const [rows] = await pool.execute(`
        SELECT
            id,
            estanque_origen_id,
            estanque_destino_id
        FROM trazabilidad
        WHERE (estanque_origen_id = ? OR estanque_destino_id = ?)
        AND deleted_at IS NULL
        AND activo = TRUE
        AND grupo_datos = ?
        ORDER BY fecha DESC, id DESC
        LIMIT 1
    `, [estanqueId, estanqueId, grupoDatos]);

    if (rows.length === 0) {
        return null;
    }

    return rows[0];
}

export async function estanqueDestinoOcupado(estanqueId, grupoDatos) {

    /*
    Descripcion:
    Determina si un estanque esta actualmente ocupado.
    Esta ocupado cuando el ultimo movimiento en el que
    participo lo dejo como destino (todavia no existe un
    movimiento posterior que lo saque como origen).

    Parametros:
    - estanqueId: Identificador del estanque a revisar.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - true si el estanque esta ocupado.
    - false si esta libre para recibir un nuevo movimiento.
    */

    const ultimo = await obtenerUltimoMovimientoPorEstanque(estanqueId, grupoDatos);

    if (!ultimo) {
        return false;
    }

    return Number(ultimo.estanque_destino_id) === Number(estanqueId);
}

export async function create(dto) {

    /*
    Descripcion:
    Inserta un nuevo registro de trazabilidad
    en la base de datos.

    Parametros:
    - dto: Objeto TrazabilidadDTO con la
      informacion del registro.

    Retorna:
    - Registro creado consultado nuevamente
      desde la base de datos.
    */

    const grupoDatos = obtenerGrupoDatos(dto.grupoDatos);
    const fecha = normalizarFechaMysql(dto.fecha);

    const [result] = await pool.execute(
        `
        INSERT INTO trazabilidad (
            grupo_datos,
            finca_id,
            estanque_origen_id,
            estanque_destino_id,
            colaborador_id,
            fecha,
            tamano,
            dias,
            pl,
            tipo_movimiento
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.fincaId,
            dto.estanqueOrigenId,
            dto.estanqueDestinoId,
            dto.colaboradorId,
            fecha,
            dto.tamano,
            dto.dias,
            dto.pl,
            TIPO_MOVIMIENTO
        ]
    );

    return await findById(result.insertId, grupoDatos);
}

/*
Se quito remove() (borrado logico) el 19/07 -- trazabilidad
es un historico de movimientos y no estaba en lo que pidio
la companera (Registrar, GetAll, GetPorId).
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas utilizadas para
mapear y normalizar la informacion obtenida
desde la base de datos.
*/

function mapearLista(rows) {

    /*
    Descripcion:
    Convierte una lista de filas obtenidas
    desde MySQL al formato utilizado por el
    backend.

    Parametros:
    - rows: Lista de filas obtenidas desde MySQL.

    Retorna:
    Lista de registros mapeados.
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
    Convierte una fila de MySQL al formato
    camelCase utilizado por el backend.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    Objeto de trazabilidad.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        fincaId: row.finca_id,
        estanqueOrigenId: row.estanque_origen_id,
        estanqueDestinoId: row.estanque_destino_id,
        colaboradorId: row.colaborador_id,
        fecha: formatearFecha(row.fecha),
        tamano: Number(row.tamano),
        dias: Number(row.dias),
        pl: Number(row.pl),
        tipoMovimiento: row.tipo_movimiento,
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
    Valida el grupo de datos recibido desde el
    JWT (req.user.grupoDatos). Ya no se tolera un
    valor ausente: antes se usaba 1 por defecto
    mientras se implementaba la autenticacion, pero
    esa autenticacion ya existe en todos los modulos.

    Parametros:
    - valor: Grupo de datos proveniente del token.

    Retorna:
    - Numero del grupo de datos, si es valido.

    Lanza:
    - Error si el valor no llego o no es numerico.
    */

    if (valor === undefined || valor === null || String(valor).trim() === '') {
        throw new Error(
            'grupoDatos es obligatorio y debe venir del token JWT (req.user.grupoDatos).'
        );
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        throw new Error('grupoDatos debe ser numerico.');
    }

    return numero;
}

function normalizarFechaMysql(valor) {

    /*
    Descripcion:
    Convierte una fecha al formato
    YYYY-MM-DD compatible con MySQL.

    Parametros:
    - valor: Fecha recibida.

    Retorna:
    Fecha normalizada.
    */

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}

function formatearFecha(valor) {

    /*
    Descripcion:
    Convierte una fecha obtenida desde MySQL
    al formato YYYY-MM-DD.

    Parametros:
    - valor: Fecha recibida desde MySQL.

    Retorna:
    Fecha formateada.
    */

    if (!valor) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    return String(valor);
}