/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: preCria.model.js
Autor: Joan
Fecha: 04/07/2026
Modulo: Pre-Cria
Descripcion:
Capa de datos para pre-crias.
//////////////////////////////////////////////////////////
*/

import { EstadoLote } from "../dtos/loteLarva.dto.js";
import pool from '../config/database.js';


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
    try {
        await connection.beginTransaction();
 
        const [result] = await connection.execute(`
            INSERT INTO precrias (
                grupo_datos, lote_larva_id, finca_id, estanque_id,
                fecha_inicio, fecha_fin, duracion_dias, duracion_dias_esperada,
                cantidad_inicial, cantidad_final, pl_inicial, pl_final, estado,
                creado_por_usuario_id, creado_por_colaborador_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            grupoDatos,
            dto.lote_larva_id,
            dto.finca_id,
            dto.estanque_id,
            dto.fecha_inicio,
            dto.fecha_fin,
            dto.duracion_dias,
            dto.duracion_dias_esperada,
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
        return findById(result.insertId, grupoDatos);
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
        duracion_dias_esperada: 'duracion_dias_esperada',
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

export async function finalizarActivasVencidas() {
    /*
    Descripcion:
    Cierre automatico: busca (en TODOS los grupos de datos) las pre-crias
    Activas cuyo duracion_dias_esperada ya se cumplio y las finaliza.
    No inventa cantidad_final ni pl_final (quedan NULL); esos valores
    reales el biologo los puede completar despues con un PUT,(el ciclo se puede seguir extendiendo
    si el biologo lo decide, o cerrar antes con el boton manual).
    Retorna:
    - Array de IDs de pre-crias finalizadas automaticamente.
    */
    const [vencidas] = await pool.execute(`
        SELECT id, grupo_datos, fecha_inicio, duracion_dias_esperada
        FROM   precrias
        WHERE  LOWER(TRIM(estado)) = 'activa'
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    duracion_dias_esperada IS NOT NULL
        AND    DATEDIFF(CURDATE(), fecha_inicio) >= duracion_dias_esperada
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