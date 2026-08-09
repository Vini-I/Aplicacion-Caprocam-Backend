/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.model.js
Autor: oscar mario
Fecha: 03/08/2026
Modulo: Pre-Cria
Descripcion:
Capa de datos para pre-crias.
//////////////////////////////////////////////////////////
*/

import { EstadoLote } from "../dtos/loteLarva.dto.js";
import pool from '../config/database.js';
import * as loteLarvaModel from './loteLarvas.model.js';


/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos, estadoFiltro = null) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo preCria.
    Parametros:
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.
    - estadoFiltro: Opcional. Si se indica 'Activa' o 'Finalizada', filtra el listado.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    let sql = `
        SELECT *
        FROM   precrias
        WHERE  grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const params = [grupoDatos];

    if (estadoFiltro) {
        sql += " AND LOWER(TRIM(estado)) = LOWER(?)";
        params.push(estadoFiltro);
    }

    sql += " ORDER BY id ASC";

    const [rows] = await pool.execute(sql, params);
    return rows;
}
 
export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de preCria mediante su identificador unico.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [rows] = await pool.execute(`
        SELECT *
        FROM   precrias
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
    return rows[0] || null;
}
 
export async function create(dto, grupoDatos) {
    /*
    Descripcion:
    Registra una nueva entidad de preCria en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */

/*
    Descripcion:
    Crea una pre-cria y transiciona el lote asociado a
    'En PreCria' (solo si estaba 'Disponible'), en una sola
    transaccion.
    */
    const connection = await pool.getConnection();
    let insertId;
    try {
        await connection.beginTransaction();
 
        const [result] = await connection.execute(`
            INSERT INTO precrias (
                grupo_datos, lote_larva_id, finca_id, estanque_id,
                fecha_inicio, fecha_fin, duracion_dias,
                cantidad_inicial, cantidad_final, pl_inicial, pl_final, estado,
                creado_por_usuario_id, creado_por_colaborador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            grupoDatos,
            dto.lote_larva_id,
            dto.finca_id,
            dto.estanque_id,
            dto.fecha_inicio,
            dto.fecha_fin,
            dto.duracion_dias,
            dto.cantidad_inicial,
            dto.cantidad_final,
            dto.pl_inicial,
            dto.pl_final,
            dto.estado || 'Activa',
            dto.creado_por_usuario_id,
            dto.creado_por_colaborador_id,
        ]);
 
        await connection.execute(`
            UPDATE lotes_larva
            SET    estado_lote = ?,
                   version     = version + 1
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    estado_lote = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `, [
            EstadoLote.EN_PRECRIA,
            dto.lote_larva_id,
            grupoDatos,
            EstadoLote.DISPONIBLE,
        ]);
 
        await connection.commit();
        insertId = result.insertId;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }

    // Fuera de la transaccion: el commit() ya se ejecuto, asi que un fallo
    // en esta lectura de confirmacion no debe reportarse como un fallo de
    // creacion.
    return findById(insertId, grupoDatos);
}
 
export async function createConLote(dtoLote, dtoPrecria, grupoDatos) {
    /*
    Descripcion:
    Crea, en una UNICA transaccion, el lote de larva y la pre-cria
    que lo consume. Igual que en siembra, esto evita el "lote
    huerfano" que dejaban las 2 peticiones HTTP separadas
    (POST /lotes-larva y luego POST /precrias): si la pre-cria
    fallaba, el lote ya habia quedado creado sin uso.
 
    Parametros:
    - dtoLote: LoteLarvaDTO con los datos del lote a crear.
    - dtoPrecria: PrecriaDTO con los datos de la pre-cria a crear
      (su lote_larva_id se sobreescribe con el id del lote recien
      creado, sin importar lo que traiga el DTO).
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual.
 
    Retorna:
    - Objeto { lote, precria } con ambos registros ya creados.
    */
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Bloquea la fila del estanque para evitar condiciones de carrera
        // (dos pre-crias creandose al mismo tiempo sobre el mismo estanque).
        const [estanqueRows] = await connection.execute(`
            SELECT id
            FROM   estanques
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
            FOR UPDATE
        `, [dtoPrecria.estanque_id, grupoDatos]);
        if (!estanqueRows[0]) {
            const err = new Error("El estanque indicado no existe.");
            err.codigoNegocio = "ESTANQUE_NO_EXISTE";
            throw err;
        }
 
        // Un estanque solo puede tener una pre-cria Activa a la vez.
        const [precriaActivaRows] = await connection.execute(`
            SELECT id FROM precrias
            WHERE  estanque_id = ?
            AND    grupo_datos = ?
            AND    LOWER(TRIM(estado)) = 'activa'
            AND    activo = TRUE
            AND    deleted_at IS NULL
            LIMIT 1
        `, [dtoPrecria.estanque_id, grupoDatos]);
        if (precriaActivaRows.length > 0) {
            const err = new Error("El estanque indicado ya tiene una pre-cria activa.");
            err.codigoNegocio = "ESTANQUE_CON_PRECRIA_ACTIVA";
            throw err;
        }
 
        // Revalida (dentro de la transaccion, con lock) que el codigo_lote
        // no este duplicado, por si dos peticiones llegaron al mismo tiempo.
        const loteDuplicado = await loteLarvaModel.findByCodigoEnTransaccion(
            connection, dtoLote.codigo_lote, grupoDatos
        );
        if (loteDuplicado) {
            const err = new Error("Ya existe un lote con ese codigo.");
            err.codigoNegocio = "LOTE_CODIGO_DUPLICADO";
            throw err;
        }
 
        // El lote nace directamente en 'En PreCria': nunca pasa por
        // 'Disponible', porque nace atado a esta pre-cria.
        dtoLote.estado_lote = EstadoLote.EN_PRECRIA;
        const loteId = await loteLarvaModel.crearLoteEnTransaccion(connection, dtoLote, grupoDatos);
 
        dtoPrecria.lote_larva_id = loteId;
        const [result] = await connection.execute(`
            INSERT INTO precrias (
                grupo_datos, lote_larva_id, finca_id, estanque_id,
                fecha_inicio, fecha_fin, duracion_dias,
                cantidad_inicial, cantidad_final, pl_inicial, pl_final, estado,
                creado_por_usuario_id, creado_por_colaborador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            grupoDatos,
            dtoPrecria.lote_larva_id,
            dtoPrecria.finca_id,
            dtoPrecria.estanque_id,
            dtoPrecria.fecha_inicio,
            dtoPrecria.fecha_fin,
            dtoPrecria.duracion_dias,
            dtoPrecria.cantidad_inicial,
            dtoPrecria.cantidad_final,
            dtoPrecria.pl_inicial,
            dtoPrecria.pl_final,
            'Activa',
            dtoPrecria.creado_por_usuario_id,
            dtoPrecria.creado_por_colaborador_id,
        ]);
 
        await connection.commit();
 
        const [lote, precria] = await Promise.all([
            loteLarvaModel.findById(loteId, grupoDatos),
            findById(result.insertId, grupoDatos),
        ]);
        return { lote, precria };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
 
export async function update(id, grupoDatos, datos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de preCria, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.
    - datos: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */

/*
    Descripcion:
    Actualiza una pre-cria activa. Solo actualiza los campos
    presentes en "datos" (actualizacion parcial).
    */
    const mapaCampos = {
        lote_larva_id:    'lote_larva_id',
        finca_id:         'finca_id',
        estanque_id:      'estanque_id',
        fecha_inicio:     'fecha_inicio',
        cantidad_inicial: 'cantidad_inicial',
        pl_inicial:       'pl_inicial',
        estado:           'estado',
        fecha_fin:        'fecha_fin',
        cantidad_final:   'cantidad_final',
        pl_final:         'pl_final',
        duracion_dias:    'duracion_dias',
    };
 
    const setParts = [];
    const valores  = [];
 
    for (const [clave, columna] of Object.entries(mapaCampos)) {
        if (datos[clave] !== undefined) {
            setParts.push(`${columna} = ?`);
            valores.push(datos[clave]);
        }
    }
    if (setParts.length === 0) return findById(id, grupoDatos);  // CORREGIDO: agregado grupoDatos
 
    setParts.push('version = version + 1');
    valores.push(Number(id), grupoDatos);
 
    const [result] = await pool.execute(`
        UPDATE precrias
        SET    ${setParts.join(', ')}
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, valores);
 
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}
 
export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de preCria, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const pc = await findById(id, grupoDatos);
    if (!pc) return null;
 
    const [result] = await pool.execute(`
        UPDATE precrias
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
 
    if (result.affectedRows === 0) return null;
    return { ...pc, activo: false };
}
 
 
export async function verificarFincaExiste(fincaId, grupoDatos) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'verificarFincaExiste' en el modulo preCria.
    Parametros:
    - fincaId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
if (!fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM fincas
        WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
    `, [Number(fincaId), grupoDatos]);
    return rows.length > 0;
}
 
export async function verificarEstanqueExiste(estanqueId, fincaId, grupoDatos) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'verificarEstanqueExiste' en el modulo preCria.
    Parametros:
    - estanqueId: Argumento requerido para el procesamiento interno de la logica.
    - fincaId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
if (!estanqueId || !fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM estanques
        WHERE id = ? AND finca_id = ? AND grupo_datos = ?
        AND activo = TRUE AND deleted_at IS NULL
    `, [Number(estanqueId), Number(fincaId), grupoDatos]);
    return rows.length > 0;
}

export async function findActivaByEstanque(estanqueId, grupoDatos, excluirId = null) {
    /*
    Descripcion:
    Busca la pre-cria Activa asociada a un estanque, si existe.
    Segun la regla de negocio, un estanque solo puede tener una
    pre-cria Activa a la vez.
    Parametros:
    - estanqueId: Entero que identifica el estanque a verificar.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual.
    - excluirId: Opcional. Excluye una pre-cria especifica de la busqueda
      (util al actualizar, para no chocar contra si misma).
 
    Retorna:
    - El registro de la pre-cria activa encontrada, o null si no existe ninguna.
    */
    let sql = `
        SELECT *
        FROM   precrias
        WHERE  estanque_id = ?
        AND    grupo_datos = ?
        AND    LOWER(TRIM(estado)) = 'activa'
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const params = [Number(estanqueId), grupoDatos];
    if (excluirId) {
        sql += " AND id <> ?";
        params.push(Number(excluirId));
    }
    sql += " ORDER BY fecha_inicio DESC, id DESC LIMIT 1";
 
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
}
 
export async function finalizarActivasVencidas() {
    /*
    Descripcion:
    Cierre automatico: busca (en TODOS los grupos de datos) las pre-crias
    Activas cuyo duracion_dias (duracion esperada, definida al crear la
    pre-cria) ya se cumplio y las finaliza. Al finalizar, duracion_dias
    se sobreescribe con la duracion real transcurrida.
    No inventa cantidad_final ni pl_final (quedan NULL); esos valores
    reales el biologo los puede completar despues con un PUT,(el ciclo se puede seguir extendiendo
    si el biologo lo decide, o cerrar antes con el boton manual).
    Retorna:
    - Array de IDs de pre-crias finalizadas automaticamente.
    */
    const [vencidas] = await pool.execute(`
        SELECT id, grupo_datos, fecha_inicio, duracion_dias
        FROM   precrias
        WHERE  LOWER(TRIM(estado)) = 'activa'
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    duracion_dias IS NOT NULL
        AND    DATEDIFF(CURDATE(), fecha_inicio) >= duracion_dias
    `);

    const idsFinalizados = [];
    for (const fila of vencidas) {
        const duracionReal = Math.round(
            (new Date() - new Date(fila.fecha_inicio)) / (1000 * 60 * 60 * 24)
        );
        await update(fila.id, fila.grupo_datos, {
            estado: 'Finalizada',
            fecha_fin: new Date().toISOString().slice(0, 10),
            duracion_dias: duracionReal,
        });
        idsFinalizados.push(fila.id);
    }
    return idsFinalizados;
}