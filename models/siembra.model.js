/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: siembra.model.js
Autor: Joan Campos
Fecha: 4/08/2026
Modulo: Siembra
Descripcion:
Capa de datos para siembra.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { EstadoLote }from "../dtos/loteLarva.dto.js";
import { EstadoEstanque } from "../dtos/estanques.dto.js";

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
    Obtiene un listado completo de todos los registros activos del modulo siembra.
    Parametros:
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.
    - estadoFiltro: Opcional. Si se indica 'Activa' o 'Finalizada', filtra el listado
      (usado por el toggle de "ocultar siembras finalizadas" del frontend).

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array,
     o null si la consulta no produce resultados.
    */
    let sql = `
        SELECT *
        FROM   siembras
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
    Busca y retorna un registro especifico de siembra mediante su identificador unico.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const [rows] = await pool.execute(`
        SELECT *
        FROM   siembras
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
    Registra una nueva entidad de siembra en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */

/*
    Descripcion:
    Crea una siembra y transiciona el lote asociado a 'Sembrado',
    en una sola transaccion.
    */
    const connection = await pool.getConnection();
    let insertId;
    try {
        await connection.beginTransaction();

        // Bloquea la fila del estanque para evitar condiciones de carrera
        // (dos siembras creandose al mismo tiempo sobre el mismo estanque).
        const [estanqueRows] = await connection.execute(`
            SELECT id, estado
            FROM   estanques
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
            FOR UPDATE
        `, [dto.estanque_id, grupoDatos]);

        const estanque = estanqueRows[0];
        if (!estanque) {
            const err = new Error("El estanque indicado no existe.");
            err.codigoNegocio = "ESTANQUE_NO_EXISTE";
            throw err;
        }
        if (String(estanque.estado).toLowerCase() !== EstadoEstanque.ACTIVO.toLowerCase()) {
            const err = new Error(
                "Solo se puede crear una siembra en un estanque en estado 'Activo'."
            );
            err.codigoNegocio = "ESTANQUE_NO_ACTIVO";
            throw err;
        }

        // Un estanque solo puede tener una siembra Activa a la vez.
        const [siembraActivaRows] = await connection.execute(`
            SELECT id FROM siembras
            WHERE  estanque_id = ?
            AND    grupo_datos = ?
            AND    LOWER(TRIM(estado)) = 'activa'
            AND    activo = TRUE
            AND    deleted_at IS NULL
            LIMIT 1
        `, [dto.estanque_id, grupoDatos]);
        if (siembraActivaRows.length > 0) {
            const err = new Error("El estanque indicado ya tiene una siembra activa.");
            err.codigoNegocio = "ESTANQUE_CON_SIEMBRA_ACTIVA";
            throw err;
        }

        const [result] = await connection.execute(`
            INSERT INTO siembras (
                grupo_datos, lote_larva_id, precria_id, finca_id, estanque_id,
                fecha_siembra, tecnica_cultivo, densidad_poblacional,
                cantidad_sembrada, pl_siembra, duracion_ciclo, estado,
                creado_por_usuario_id, creado_por_colaborador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            grupoDatos,
            dto.lote_larva_id,
            dto.precria_id,
            dto.finca_id,
            dto.estanque_id,
            dto.fecha_siembra,
            dto.tecnica_cultivo,
            dto.densidad_poblacional,
            dto.cantidad_sembrada,
            dto.pl_siembra,
            dto.duracion_ciclo,
            // Una siembra SIEMPRE nace 'Activa', sin importar lo que el
            // cliente mande en el body. El unico camino hacia 'Finalizada'
            // es finalizarConEstanque(), que ademas sincroniza el estanque.
            'Activa',
            dto.creado_por_usuario_id,
            dto.creado_por_colaborador_id,
        ]);
 
        await connection.execute(`
            UPDATE lotes_larva
            SET    estado_lote = ?,
                   version     = version + 1
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
        `, [EstadoLote.SEMBRADO, dto.lote_larva_id, grupoDatos]);

        // El estanque pasa a 'Engorde' mientras dura la siembra activa.
        await connection.execute(`
            UPDATE estanques
            SET    estado = ?,
                   fecha_siembra = ?,
                   fecha_inicio_engorde = ?,
                   version = version + 1
            WHERE  id = ?
            AND    grupo_datos = ?
        `, [EstadoEstanque.ENGORDE, dto.fecha_siembra, dto.fecha_siembra, dto.estanque_id, grupoDatos]);
 
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
    // creacion (eso haria un rollback() que ya no tiene efecto y le
    // mentiria al frontend diciendole que la siembra no se creo, cuando en
    // realidad si se creo).
    return findById(insertId, grupoDatos);
}

export async function createConLote(dtoLote, dtoSiembra, grupoDatos) {
    /*
    Descripcion:
    Crea, en una UNICA transaccion, el lote de larva y la siembra
    que lo consume (mas la transicion del estanque a 'Engorde').
 
    Este es el endpoint que resuelve el problema del "lote huerfano":
    antes el frontend hacia 2 peticiones HTTP separadas
    (POST /lotes-larva y luego POST /siembras). Si la primera
    exito y la segunda fallaba, el lote quedaba creado en la
    base de datos sin ninguna siembra asociada.
 
    Aqui todo el trabajo ocurre dentro de la misma conexion/
    transaccion: si CUALQUIER paso falla (el estanque no existe,
    ya tiene una siembra activa, el codigo_lote esta duplicado,
    etc.) se hace rollback de TODO, incluyendo el INSERT del lote.
    O se crean ambos registros, o no se crea ninguno.
 
    Parametros:
    - dtoLote: LoteLarvaDTO con los datos del lote a crear.
    - dtoSiembra: SiembraDTO con los datos de la siembra a crear
      (su lote_larva_id se sobreescribe con el id del lote recien
      creado, sin importar lo que traiga el DTO).
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual.
 
    Retorna:
    - Objeto { lote, siembra } con ambos registros ya creados.
    */
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Bloquea la fila del estanque para evitar condiciones de carrera
        // (dos siembras creandose al mismo tiempo sobre el mismo estanque).
        const [estanqueRows] = await connection.execute(`
            SELECT id, estado
            FROM   estanques
            WHERE  id = ?
            AND    grupo_datos = ?
            AND    activo = TRUE
            AND    deleted_at IS NULL
            FOR UPDATE
        `, [dtoSiembra.estanque_id, grupoDatos]);
 
        const estanque = estanqueRows[0];
        if (!estanque) {
            const err = new Error("El estanque indicado no existe.");
            err.codigoNegocio = "ESTANQUE_NO_EXISTE";
            throw err;
        }
        if (String(estanque.estado).toLowerCase() !== EstadoEstanque.ACTIVO.toLowerCase()) {
            const err = new Error(
                "Solo se puede crear una siembra en un estanque en estado 'Activo'."
            );
            err.codigoNegocio = "ESTANQUE_NO_ACTIVO";
            throw err;
        }
 
        // Un estanque solo puede tener una siembra Activa a la vez.
        const [siembraActivaRows] = await connection.execute(`
            SELECT id FROM siembras
            WHERE  estanque_id = ?
            AND    grupo_datos = ?
            AND    LOWER(TRIM(estado)) = 'activa'
            AND    activo = TRUE
            AND    deleted_at IS NULL
            LIMIT 1
        `, [dtoSiembra.estanque_id, grupoDatos]);
        if (siembraActivaRows.length > 0) {
            const err = new Error("El estanque indicado ya tiene una siembra activa.");
            err.codigoNegocio = "ESTANQUE_CON_SIEMBRA_ACTIVA";
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
 
        // El lote nace directamente en 'Sembrado': nunca pasa por
        // 'Disponible', porque nace atado a esta siembra.
        dtoLote.estado_lote = EstadoLote.SEMBRADO;
        const loteId = await loteLarvaModel.crearLoteEnTransaccion(connection, dtoLote, grupoDatos);
 
        dtoSiembra.lote_larva_id = loteId;
        const [siembraResult] = await connection.execute(`
            INSERT INTO siembras (
                grupo_datos, lote_larva_id, precria_id, finca_id, estanque_id,
                fecha_siembra, tecnica_cultivo, densidad_poblacional,
                cantidad_sembrada, pl_siembra, duracion_ciclo, estado,
                creado_por_usuario_id, creado_por_colaborador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            grupoDatos,
            dtoSiembra.lote_larva_id,
            null, // precria_id: este endpoint es para lote nuevo, no aplica pre-cria
            dtoSiembra.finca_id,
            dtoSiembra.estanque_id,
            dtoSiembra.fecha_siembra,
            dtoSiembra.tecnica_cultivo,
            dtoSiembra.densidad_poblacional,
            dtoSiembra.cantidad_sembrada,
            dtoSiembra.pl_siembra,
            dtoSiembra.duracion_ciclo,
            'Activa',
            dtoSiembra.creado_por_usuario_id,
            dtoSiembra.creado_por_colaborador_id,
        ]);
 
        // El estanque pasa a 'Engorde' mientras dura la siembra activa.
        await connection.execute(`
            UPDATE estanques
            SET    estado = ?,
                   fecha_siembra = ?,
                   fecha_inicio_engorde = ?,
                   version = version + 1
            WHERE  id = ?
            AND    grupo_datos = ?
        `, [
            EstadoEstanque.ENGORDE, dtoSiembra.fecha_siembra, dtoSiembra.fecha_siembra,
            dtoSiembra.estanque_id, grupoDatos,
        ]);
 
        await connection.commit();
 
        const [lote, siembra] = await Promise.all([
            loteLarvaModel.findById(loteId, grupoDatos),
            findById(siembraResult.insertId, grupoDatos),
        ]);
        return { lote, siembra };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}
 
export async function existeSiembraPorLote(loteLarvaId, grupoDatos, excluirId = null) {
    /*
    Descripcion:
    Verifica si un lote de larva ya tiene una siembra registrada
    (Activa o Finalizada). Segun la regla de negocio, un mismo lote
    solo puede originar una unica siembra.
    */
    let sql = `
        SELECT id FROM siembras
        WHERE  lote_larva_id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const params = [Number(loteLarvaId), grupoDatos];
    if (excluirId) {
        sql += " AND id <> ?";
        params.push(Number(excluirId));
    }
    const [rows] = await pool.execute(sql, params);
    return rows.length > 0;
}

export async function existeSiembraPorPrecria(precriaId, grupoDatos, excluirId = null) {
    /*
    Descripcion:
    Verifica si una pre-cria ya fue utilizada para crear una siembra.
    Segun la regla de negocio, una pre-cria solo puede originar una
    unica siembra (no se puede repartir entre varias siembras).
    */
    let sql = `
        SELECT id FROM siembras
        WHERE  precria_id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    const params = [Number(precriaId), grupoDatos];
    if (excluirId) {
        sql += " AND id <> ?";
        params.push(Number(excluirId));
    }
    const [rows] = await pool.execute(sql, params);
    return rows.length > 0;
}

export async function obtenerEstanquePorId(estanqueId, fincaId, grupoDatos) {
    /*
    Descripcion:
    Obtiene el estanque completo (incluyendo su estado actual) para
    poder validar reglas de negocio como "solo se siembra en estado Activo".
    */
    if (!estanqueId || !fincaId) return null;
    const [rows] = await pool.execute(`
        SELECT id, estado, precria FROM estanques
        WHERE id = ? AND finca_id = ? AND grupo_datos = ?
        AND activo = TRUE AND deleted_at IS NULL
    `, [Number(estanqueId), Number(fincaId), grupoDatos]);
    return rows[0] || null;
}

export async function finalizarConEstanque(id, grupoDatos, datosFinalizacion) {
    /*
    Descripcion:
    Finaliza una siembra (manual o automaticamente) y transiciona el
    estanque asociado a 'Cosechado', en una sola transaccion.
    */
    const connection = await pool.getConnection();
    let debeLeerRegistro = false;
    try {
        await connection.beginTransaction();

        const [siembraRows] = await connection.execute(`
            SELECT * FROM siembras
            WHERE id = ? AND grupo_datos = ? AND activo = TRUE AND deleted_at IS NULL
            FOR UPDATE
        `, [Number(id), grupoDatos]);
        const siembra = siembraRows[0];
        if (!siembra) {
            await connection.rollback();
            return null;
        }

        await connection.execute(`
            UPDATE siembras
            SET    estado = ?, version = version + 1
            WHERE  id = ? AND grupo_datos = ?
        `, [datosFinalizacion.estado, Number(id), grupoDatos]);

        await connection.execute(`
            UPDATE estanques
            SET    estado = ?, fecha_mantenimiento = NULL, version = version + 1
            WHERE  id = ? AND grupo_datos = ?
        `, [EstadoEstanque.COSECHADO, siembra.estanque_id, grupoDatos]);

        await connection.commit();
        debeLeerRegistro = true;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }

    // Fuera de la transaccion, misma razon que en create(): el commit()
    // ya se ejecuto, asi que un fallo en esta lectura no debe reportarse
    // como un fallo de la finalizacion.
    return debeLeerRegistro ? findById(id, grupoDatos) : null;
}

export async function finalizarActivasVencidas() {
    /*
    Descripcion:
    Cierre automatico: busca (en TODOS los grupos de datos) las siembras
    Activas cuyo duracion_ciclo ya se cumplio y las finaliza, transicionando
    tambien el estanque asociado a 'Cosechado'. Pensado para ser invocado
    periodicamente por un job/scheduler.
    Retorna:
    - Array de IDs de siembras finalizadas automaticamente.
    */
    const [vencidas] = await pool.execute(`
        SELECT id, grupo_datos
        FROM   siembras
        WHERE  LOWER(TRIM(estado)) = 'activa'
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    duracion_ciclo IS NOT NULL
        AND    DATEDIFF(CURDATE(), fecha_siembra) >= duracion_ciclo
    `);

    const idsFinalizados = [];
    for (const fila of vencidas) {
        await finalizarConEstanque(fila.id, fila.grupo_datos, { estado: 'Finalizada' });
        idsFinalizados.push(fila.id);
    }
    return idsFinalizados;
}
 
export async function update(id, grupoDatos, datos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de siembra, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.
    - datos: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */

/*
    Descripcion:
    Actualiza una siembra activa. Solo actualiza los campos
    presentes en "datos" (actualizacion parcial).
    */
    const mapaCampos = {
        lote_larva_id:         'lote_larva_id',
        precria_id:            'precria_id',
        finca_id:              'finca_id',
        estanque_id:           'estanque_id',
        fecha_siembra:         'fecha_siembra',
        tecnica_cultivo:       'tecnica_cultivo',
        densidad_poblacional:  'densidad_poblacional',
        cantidad_sembrada:     'cantidad_sembrada',
        pl_siembra:            'pl_siembra',
        duracion_ciclo:        'duracion_ciclo',
        // estado NO esta aqui a proposito: el PUT generico nunca debe poder
        // cambiar el estado de una siembra, porque dejaria el estanque
        // desincronizado (el estanque solo cambia dentro de
        // finalizarConEstanque()). El unico camino a 'Finalizada' es
        // POST /siembras/:id/finalizar.
    };
 
    const setParts = [];
    const valores  = [];
 
    for (const [clave, columna] of Object.entries(mapaCampos)) {
        if (datos[clave] !== undefined) {
            setParts.push(`${columna} = ?`);
            valores.push(datos[clave]);
        }
    }
    if (setParts.length === 0) return findById(id, grupoDatos);
 
    setParts.push('version = version + 1');
    valores.push(Number(id), grupoDatos);
 
    const [result] = await pool.execute(`
        UPDATE siembras
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
    Realiza un borrado logico (soft-delete) sobre un registro de siembra, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
const siembra = await findById(id, grupoDatos);
    if (!siembra) return null;
 
    const [result] = await pool.execute(`
        UPDATE siembras
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);
 
    if (result.affectedRows === 0) return null;
    return { ...siembra, activo: false };
}
 
 
export async function verificarFincaExiste(fincaId, grupoDatos) {
    /*
    Descripcion:
    Gestiona logica de negocio para la operacion 'verificarFincaExiste' en el modulo siembra.
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
    Gestiona logica de negocio para la operacion 'verificarEstanqueExiste' en el modulo siembra.
    Parametros:
    - estanqueId: Argumento requerido para el procesamiento interno de la logica.
    - fincaId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array,
    o null si la consulta no produce resultados.
    */
if (!estanqueId || !fincaId) return false;
    const [rows] = await pool.execute(`
        SELECT id FROM estanques
        WHERE id = ? AND finca_id = ? AND grupo_datos = ?
        AND activo = TRUE AND deleted_at IS NULL
    `, [Number(estanqueId), Number(fincaId), grupoDatos]);
    return rows.length > 0;
}

export async function findActivaByEstanque(estanqueId, grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo siembra.
    Parametros:
    - estanqueId: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual,
    usado para  segmentarla informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array,
     o null si la consulta no produce resultados.
    */
const [rows] = await pool.execute(`
        SELECT *
        FROM   siembras
        WHERE  estanque_id = ?
        AND    grupo_datos = ?
        AND    LOWER(TRIM(estado)) = 'activa'
        AND    activo = TRUE
        AND    deleted_at IS NULL
        ORDER BY fecha_siembra DESC, id DESC
        LIMIT 1
    `, [Number(estanqueId), grupoDatos]);
    return rows[0] || null;
}