/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: loteLarvas.model.js
Autor: oscar mario
Fecha: 02/08/2026
Modulo: Lotes de Larva
Descripcion:
Capa de datos para lotes de larva.
//////////////////////////////////////////////////////////
*/

import pool from '../config/database.js';


/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES 
//////////////////////////////////////////////////////////
*/

export async function findAll(grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo loteLarvas.
    Parametros:
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const [rows] = await pool.execute(`
        SELECT 
            ll.*,
            prov.nombre AS nombre_proveedor,
            lab.nombre AS nombre_laboratorio,
            proc.nombre AS nombre_procedencia
        FROM   lotes_larva ll
        LEFT JOIN proveedores_larva prov ON ll.proveedor_larva_id = prov.id
        LEFT JOIN laboratorios lab ON ll.laboratorio_id = lab.id
        LEFT JOIN procedencias proc ON ll.procedencia_id = proc.id
        WHERE  ll.grupo_datos = ?
        AND    ll.activo = TRUE
        AND    ll.deleted_at IS NULL
        ORDER BY ll.id ASC
    `, [grupoDatos]);
    return rows;
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca y retorna un registro especifico de loteLarvas mediante su identificador unico.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const [rows] = await pool.execute(`
        SELECT 
            ll.*,
            prov.nombre AS nombre_proveedor,
            lab.nombre AS nombre_laboratorio,
            proc.nombre AS nombre_procedencia
        FROM   lotes_larva ll
        LEFT JOIN proveedores_larva prov ON ll.proveedor_larva_id = prov.id
        LEFT JOIN laboratorios lab ON ll.laboratorio_id = lab.id
        LEFT JOIN procedencias proc ON ll.procedencia_id = proc.id
        WHERE  ll.id = ?
        AND    ll.grupo_datos = ?
        AND    ll.activo = TRUE
        AND    ll.deleted_at IS NULL
    `, [Number(id), grupoDatos]);
    return rows[0] || null;
}

export async function findByCodigo(codigo, grupoDatos) {
    /*
    Descripcion:
    Obtiene un listado completo de todos los registros activos del modulo loteLarvas filtrados por codigo.
    Parametros:
    - codigo: Argumento requerido para el procesamiento interno de la logica.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
    `, [codigo, grupoDatos]);
     return rows[0] || null;
}

export async function findByCodigoIgnorandoId(codigo, id, grupoDatos) {
    /*
    Descripcion:
    Obtiene un registro de loteLarva excluyendo un ID especifico (util para validacion al actualizar).
    Parametros:
    - codigo: Argumento requerido para el procesamiento interno de la logica.
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const [rows] = await pool.execute(`
        SELECT *
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        AND    id != ?
        LIMIT  1
    `, [codigo, grupoDatos, Number(id)]);
    return rows[0] || null;
}

export async function createLote(dto, grupoDatos) {
    /*
    Descripcion:
    Registra una nueva entidad de loteLarvas en la base de datos, estructurando la informacion proveniente del cliente.
    Parametros:
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const sql = `
        INSERT INTO lotes_larva (
            grupo_datos,
            codigo_lote,
            proveedor_larva_id,
            laboratorio_id,
            procedencia_id,
            certificado_larva,
            pl_inicial,
            cantidad_inicial,
            fecha_ingreso,
            estado_lote,
            creado_por_usuario_id,
            creado_por_colaborador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
        grupoDatos,
        dto.codigo_lote,
        dto.proveedor_id  || null,
        dto.laboratorio_id || null,
        dto.procedencia_id || null,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        dto.estado_lote || 'Disponible',
        dto.creado_por_usuario_id,
        dto.creado_por_colaborador_id,
    ]);
    return findById(result.insertId, grupoDatos);
}

export async function crearLoteEnTransaccion(connection, dto, grupoDatos) {
    /*
    Descripcion:
    Inserta un lote de larva usando una conexion/transaccion ya
    abierta por otro modelo (siembra o pre-cria), para que la
    creacion del lote y la operacion que lo consume (siembra o
    pre-cria) ocurran de forma atomica: si cualquier paso
    posterior falla, el rollback de esa transaccion tambien
    revierte este INSERT y no queda un lote huerfano.
    Parametros:
    - connection: Conexion MySQL con una transaccion ya iniciada
      (connection.beginTransaction() ya fue llamado por el caller).
    - dto: Objeto JSON/DTO con la carga util (payload) del lote.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual.
 
    Retorna:
    - El id (insertId) del lote de larva recien creado.
    */
    const sql = `
        INSERT INTO lotes_larva (
            grupo_datos,
            codigo_lote,
            proveedor_larva_id,
            laboratorio_id,
            procedencia_id,
            certificado_larva,
            pl_inicial,
            cantidad_inicial,
            fecha_ingreso,
            estado_lote,
            creado_por_usuario_id,
            creado_por_colaborador_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(sql, [
        grupoDatos,
        dto.codigo_lote,
        dto.proveedor_id  || null,
        dto.laboratorio_id || null,
        dto.procedencia_id || null,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        dto.estado_lote || 'Disponible',
        dto.creado_por_usuario_id,
        dto.creado_por_colaborador_id,
    ]);
    return result.insertId;
}
 
export async function findByCodigoEnTransaccion(connection, codigo, grupoDatos) {
    /*
    Descripcion:
    Igual que findByCodigo, pero usando una conexion/transaccion ya
    abierta (con FOR UPDATE) para evitar condiciones de carrera
    cuando dos peticiones intentan crear el mismo codigo_lote al
    mismo tiempo desde el endpoint combinado de lote+siembra.
    */
    const [rows] = await connection.execute(`
        SELECT id
        FROM   lotes_larva
        WHERE  LOWER(TRIM(codigo_lote)) = LOWER(TRIM(?))
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
        LIMIT  1
        FOR UPDATE
    `, [codigo, grupoDatos]);
    return rows[0] || null;
}
 
export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza parcialmente los datos de un registro existente de loteLarvas, verificando primero su existencia y gestionando conflictos de unicidad.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - dto: Objeto JSON/DTO con la carga util (payload) a procesar en la transaccion.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const sql = `
        UPDATE lotes_larva
        SET    codigo_lote       = ?,
               proveedor_larva_id = ?,
               laboratorio_id    = ?,
               procedencia_id    = ?,
               certificado_larva = ?,
               pl_inicial        = ?,
               cantidad_inicial   = ?,
               fecha_ingreso      = ?,
               version           = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `;
    // estado_lote NO esta en este UPDATE a proposito, aunque el DTO lo
    // acepte como input: este endpoint es de edicion libre de datos del
    // lote y NUNCA debe poder mover su estado (Disponible / En PreCria /
    // Sembrado / Agotado) directamente desde el body. Las unicas
    // transiciones de estado validas son las que ejecutan, en su propia
    // transaccion, preCria.model.js (al crear una pre-cria) y
    // siembra.model.js (al crear una siembra) - cada una con sus propias
    // validaciones de negocio (estanque activo, sin siembra/precria
    // activa, etc.). El controlador ademas bloquea por completo este
    // endpoint si el lote ya no esta 'Disponible', pero se deja tambien
    // fuera del UPDATE aqui como segunda capa de defensa.
    const [result] = await pool.execute(sql, [
        dto.codigo_lote,
        dto.proveedor_id  || null,
        dto.laboratorio_id || null,
        dto.procedencia_id || null,
        dto.certificado_larva,
        dto.pl_inicial,
        dto.cantidad_inicial,
        dto.fecha_ingreso,
        Number(id),
        grupoDatos
    ]);
    if (result.affectedRows === 0) return null;
    return findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Realiza un borrado logico (soft-delete) sobre un registro de loteLarvas, marcandolo como inactivo (activo = FALSE) y dejando rastro en deleted_at.
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - El registro afectado en forma de objeto (mapeado por DTO), una coleccion de registros en un array, o null si la consulta no produce resultados.
    */
    const lote = await findById(id, grupoDatos);
    if (!lote) return null;

    const [result] = await pool.execute(`
        UPDATE lotes_larva
        SET    activo     = FALSE,
               deleted_at = NOW(),
               version    = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(id), grupoDatos]);

    if (result.affectedRows === 0) return null;
    return { ...lote, activo: false };
}

export async function actualizarEstado(id, estado, grupoDatos) {
    /*
    Descripcion:
    Actualiza el estado de un registro existente de loteLarvas (ej. de Disponible a Sembrado).
    Parametros:
    - id: Entero que representa el identificador unico primario (PK) del registro.
    - estado: String requerido con el nuevo estado a setear.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - Booleano (true si afecto alguna fila, false si no).
    */
    const [result] = await pool.execute(`
        UPDATE lotes_larva
        SET    estado_lote = ?,
               version     = version + 1
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [estado, Number(id), grupoDatos]);
    return result.affectedRows > 0;
}

export async function verificarProveedorExiste(proveedorId, grupoDatos) {
    /*
    Descripcion:
    Verifica de forma rapida si un proveedor de larva existe y esta activo.
    Parametros:
    - proveedorId: Identificador del proveedor a verificar.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - Booleano indicando si el proveedor existe (true) o no (false).
    */
    if (!proveedorId) return false;
    const [rows] = await pool.execute(`
        SELECT id
        FROM   proveedores_larva
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(proveedorId), grupoDatos]);
    return rows.length > 0;
}

export async function verificarLaboratorioExiste(laboratorioId, grupoDatos) {
    /*
    Descripcion:
    Verifica de forma rapida si un laboratorio (catalogo) existe y esta activo.
    Parametros:
    - laboratorioId: Identificador del laboratorio a verificar.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - Booleano indicando si el laboratorio existe (true) o no (false).
    */
    if (!laboratorioId) return false;
    const [rows] = await pool.execute(`
        SELECT id
        FROM   laboratorios
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(laboratorioId), grupoDatos]);
    return rows.length > 0;
}

export async function verificarProcedenciaExiste(procedenciaId, grupoDatos) {
    /*
    Descripcion:
    Verifica de forma rapida si una procedencia (catalogo) existe y esta activa.
    Parametros:
    - procedenciaId: Identificador de la procedencia a verificar.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - Booleano indicando si la procedencia existe (true) o no (false).
    */
    if (!procedenciaId) return false;
    const [rows] = await pool.execute(`
        SELECT id
        FROM   procedencias
        WHERE  id = ?
        AND    grupo_datos = ?
        AND    activo = TRUE
        AND    deleted_at IS NULL
    `, [Number(procedenciaId), grupoDatos]);
    return rows.length > 0;
}

export async function esLoteHeredado(loteLarvaId, grupoDatos) {
    /*
    Descripcion:
    Verifica si un lote de larva es "heredado", es decir, si existe una
    Siembra que provino de una Pre-Cria (precria_id no nulo) y que usa
    este mismo lote. En ese caso, sus datos de origen deben quedar fijos
    porque son compartidos entre la Pre-Cria y la Siembra derivada.
    Parametros:
    - loteLarvaId: Identificador del lote de larva a verificar.
    - grupoDatos: Entero que identifica el tenant (grupo de datos) del usuario actual, usado para segmentar la informacion.

    Retorna:
    - Booleano indicando si el lote es heredado (true) o no (false).
    */
    const [rows] = await pool.execute(`
        SELECT id
        FROM   siembras
        WHERE  lote_larva_id = ? AND grupo_datos = ? AND precria_id IS NOT NULL
               AND activo = TRUE AND deleted_at IS NULL
        LIMIT  1
    `, [loteLarvaId, grupoDatos]);
    return rows.length > 0;
}