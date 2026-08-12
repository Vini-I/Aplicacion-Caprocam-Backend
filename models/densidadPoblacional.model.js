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
poblacional, junto con su detalle tiro por tiro.

ESTRUCTURA DE TABLAS (ver database/init/001_schema.sql):

- densidad_poblacional: la cabecera del conteo. Guarda tanto los
  datos capturados (fecha, area del estanque, area de la atarraya,
  sobrevivencia, notas) como los resultados calculados
  (total_camarones_muestra, tiros_atarraya, area_muestreada,
  promedio_por_tiro, densidad, poblacion_estimada).

- densidad_detalle_tiros: una fila por tiro de atarraya, con
  cuantos camarones salieron en ese tiro. Es el dato crudo del
  muestreo; de ahi se derivan el total y la cantidad de tiros.
  Igual que la cabecera, guarda grupo_datos y quien creo el tiro
  (creado_por_usuario_id / creado_por_colaborador_id), y soporta
  borrado logico (activo, deleted_at, version).

Las dos tablas se escriben SIEMPRE dentro de una misma transaccion:
una cabecera cuyo total no corresponde a su detalle (o un detalle
huerfano) seria un registro imposible de auditar en campo.
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
IMPORTS
//////////////////////////////////////////////////////////

Servicios (formulas y valores de referencia del muestreo)
*/

import {
    M2_POR_HECTAREA,
    AREA_ATARRAYA_DEFECTO,
    calcularTirosRecomendados
} from "../services/densidadPoblacional.service.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////

Columnas seleccionadas en todas las consultas de lectura.
dp = densidad_poblacional, u = usuarios, c = colaboradores.

El nombre de quien hizo el registro sale de un LEFT JOIN doble:
la tabla ya no tiene columna colaborador_id, asi que el autor se
identifica por creado_por_usuario_id (Usuario Web) o
creado_por_colaborador_id (Colaborador APK). Exactamente uno de
los dos viene lleno, por eso COALESCE resuelve el nombre sin
importar cual de los dos fue.
*/

const SELECT_BASE = `
    SELECT
        dp.id,
        dp.uuid,
        dp.grupo_datos,
        dp.finca_id,
        dp.estanque_id,
        dp.fecha,
        dp.cantidad_siembra,
        dp.area_estanque,
        dp.total_camarones_muestra,
        dp.tiros_atarraya,
        dp.area_atarraya,
        dp.area_muestreada,
        dp.promedio_por_tiro,
        dp.poblacion_estimada,
        dp.sobrevivencia,
        dp.densidad,
        dp.notas_conteo,
        dp.creado_por_usuario_id,
        dp.creado_por_colaborador_id,
        COALESCE(
            CONCAT(u.nombre, ' ', u.apellidos),
            CONCAT(c.nombre, ' ', c.apellidos)
        ) AS creado_por_nombre,
        dp.activo,
        dp.fecha_creacion,
        dp.fecha_actualizacion,
        dp.deleted_at,
        dp.version
    FROM densidad_poblacional dp
    LEFT JOIN usuarios u ON u.id = dp.creado_por_usuario_id
    LEFT JOIN colaboradores c ON c.id = dp.creado_por_colaborador_id
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
    desde la base de datos, con su detalle de tiros incluido.
    Permite filtrar por finca, estanque, grupo de datos y por el
    usuario que hizo el registro.

    El detalle de tiros se trae en UNA sola consulta adicional para
    todos los registros de la pagina, no una por registro: con 50
    registros en pantalla, la version ingenua haria 51 consultas.
    Si no hay registros, se corta antes: no tiene sentido llamar a
    findTirosDeVariosRegistros con un arreglo de ids vacio.

    numeroCamarones se recalcula aqui explicitamente (Number(...) con
    0 por defecto) por encima del alias que ya pone mapearFila: para
    la lista, un registro sin muestra debe verse como 0 camarones,
    no como null.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - idFinca: Identificador de la finca.
        - idEstanque: Identificador del estanque.
        - grupoDatos: Codigo del grupo de datos.
        - idUsuario: Identificador del colaborador que hizo el registro.

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
            sql = sql + " AND dp.creado_por_colaborador_id = ?";
            params.push(filtros.idUsuario);
        }
    }

    sql = sql + " ORDER BY dp.id DESC";

    const [rows] = await pool.execute(sql, params);

    const registros = mapearLista(rows);

    if (registros.length === 0) {
        return [];
    }

    const idsRegistros = registros.map((registro) => registro.id);

    const tirosPorRegistro = await findTirosDeVariosRegistros(idsRegistros);

    for (let i = 0; i < registros.length; i++) {
        const registro = registros[i];

        registro.tiros = tirosPorRegistro[registro.id] || [];
        registro.numeroCamarones = Number(registro.totalCamaronesMuestra || 0);
    }

    return registros;
}

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de densidad poblacional activo por su
    identificador numerico, dentro del grupo de datos del usuario
    autenticado. Incluye el detalle tiro por tiro.

    Parametros:
    - id: Identificador del registro.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - El registro encontrado, con su arreglo de tiros.
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

    const registro = mapearFila(rows[0]);

    registro.tiros = await findTirosPorDensidad(registro.id);

    return registro;
}

export async function findByFechaAndEstanque(fecha, idEstanque, idIgnorado, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de densidad poblacional por fecha y estanque,
    dentro del grupo de datos del usuario autenticado.
    Se utiliza para evitar registrar dos conteos el mismo dia
    para el mismo estanque.
    Permite ignorar un id especifico cuando se esta actualizando un registro.

    No carga el detalle de tiros: esta funcion solo responde "existe
    o no existe", y traer el detalle seria trabajo desperdiciado.

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

    const params = [normalizarFechaMysql(fecha), idEstanque, grupoDatos];

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
    Inserta un nuevo registro de densidad poblacional junto con su
    detalle de tiros, dentro de una misma transaccion.

    grupoDatos debe venir ya resuelto desde el JWT (ver controller y
    dto): si falta o es invalido, se rechaza la insercion en vez de
    asumir un valor por defecto. De creadoPorUsuarioId/
    creadoPorColaboradorId debe venir presente exactamente uno.

    Los valores calculados (total, area muestreada, promedio,
    densidad, poblacion estimada) llegan ya resueltos en el DTO, que
    los deriva con las formulas del service. El model no vuelve a
    calcularlos ni acepta que vengan del cliente.

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

    const fecha = normalizarFechaMysql(dto.fecha);

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [result] = await conexion.execute(
            `
            INSERT INTO densidad_poblacional (
                grupo_datos,
                finca_id,
                estanque_id,
                fecha,
                cantidad_siembra,
                area_estanque,
                total_camarones_muestra,
                tiros_atarraya,
                area_atarraya,
                area_muestreada,
                promedio_por_tiro,
                poblacion_estimada,
                sobrevivencia,
                densidad,
                notas_conteo,
                creado_por_usuario_id,
                creado_por_colaborador_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                grupoDatos,
                dto.idFinca,
                dto.idEstanque,
                fecha,
                aValorSql(dto.cantidadSiembra),
                aValorSql(dto.areaEstanque),
                aValorSql(dto.totalCamaronesMuestra),
                aValorSql(dto.tirosAtarraya),
                aValorSql(dto.areaAtarraya),
                aValorSql(dto.areaMuestreada),
                aValorSql(dto.promedioPorTiro),
                aValorSql(dto.poblacionEstimada),
                aValorSql(dto.sobrevivencia),
                aValorSql(dto.densidad),
                aValorSql(dto.notasConteo),
                creadoPorUsuarioId,
                creadoPorColaboradorId
            ]
        );

        await insertarTiros(conexion, result.insertId, dto.tiros, {
            grupoDatos,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        });

        await conexion.commit();

        return await findById(result.insertId, grupoDatos);
    } catch (err) {
        await conexion.rollback();
        throw err;
    } finally {
        conexion.release();
    }
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un registro de densidad poblacional y reconcilia su
    detalle de tiros contra lo que ya existe en la base, en vez de
    borrar todo el detalle y volver a insertarlo. Mismo patron que
    update() en models/mantCrecimiento.model.js: se compara lo que
    ya estaba activo contra lo que llego en el body, y solo se
    tocan las filas que en verdad cambiaron.

    Por que numeroTiro y no id: a diferencia de los muestreos de
    crecimiento (que si viajan con su id cuando el usuario los
    edita), el detalle de tiros nunca vuelve al cliente con su id
    para reenviarlo: normalizarTiros() en el service siempre
    reasigna numeroTiro por posicion (1, 2, 3...). numeroTiro es
    entonces el unico identificador estable disponible para saber
    "este es el mismo tiro" entre lo que ya habia y lo que se
    acaba de enviar.

    Reconciliacion (ver reconciliarTiros mas abajo):
    - numeroTiro que ya no viene en el body -> se marca inactivo
      (activo = FALSE, deleted_at = NOW()), igual que el borrado
      logico de la cabecera. No se borra fisicamente: sigue siendo
      el dato crudo de un muestreo real que se hizo en campo.
    - numeroTiro que ya existia y sigue viniendo -> se actualiza
      solo cantidad_camarones sobre la misma fila (conserva su id,
      fecha_creacion y autoria original).
    - numeroTiro nuevo (el usuario agrego mas tiros de los que
      habia) -> se inserta una fila nueva, con la autoria del
      registro original (actual.creadoPorUsuarioId /
      actual.creadoPorColaboradorId).

    IMPORTANTE: creado_por_usuario_id / creado_por_colaborador_id
    de la CABECERA (quien hizo el registro originalmente) son
    campos de auditoria y NUNCA se modifican aqui, sin importar
    quien este editando. Por la misma razon, los tiros nuevos que
    se inserten durante una edicion se atribuyen al creador
    ORIGINAL del registro (actual.creadoPor...), no a quien esta
    editando ahora.

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

    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        await conexion.execute(
            `
            UPDATE densidad_poblacional
            SET
                finca_id = ?,
                estanque_id = ?,
                fecha = ?,
                cantidad_siembra = ?,
                area_estanque = ?,
                total_camarones_muestra = ?,
                tiros_atarraya = ?,
                area_atarraya = ?,
                area_muestreada = ?,
                promedio_por_tiro = ?,
                poblacion_estimada = ?,
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
                aValorSql(dto.cantidadSiembra),
                aValorSql(dto.areaEstanque),
                aValorSql(dto.totalCamaronesMuestra),
                aValorSql(dto.tirosAtarraya),
                aValorSql(dto.areaAtarraya),
                aValorSql(dto.areaMuestreada),
                aValorSql(dto.promedioPorTiro),
                aValorSql(dto.poblacionEstimada),
                aValorSql(dto.sobrevivencia),
                aValorSql(dto.densidad),
                aValorSql(dto.notasConteo),
                id,
                grupoDatos
            ]
        );

        await reconciliarTiros(conexion, id, dto.tiros, {
            grupoDatos,
            creadoPorUsuarioId: actual.creadoPorUsuarioId,
            creadoPorColaboradorId: actual.creadoPorColaboradorId
        });

        await conexion.commit();

        return await findById(id, grupoDatos);
    } catch (err) {
        await conexion.rollback();
        throw err;
    } finally {
        conexion.release();
    }
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente un registro de densidad poblacional.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    El detalle de tiros NO se borra: es el dato crudo del muestreo y
    debe seguir disponible si el registro se restaura o si hay que
    auditar por que se elimino.

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

export async function findDatosBaseEstanque(idEstanque, grupoDatos) {
    /*
    Descripcion:
    Obtiene los datos base de un estanque para precargar el
    formulario de densidad poblacional cuando el usuario lo elige:
    el area en hectareas y la cantidad de siembra por metro
    cuadrado.

    De donde sale cada dato:

    - areaEstanque: la tabla estanques no guarda un area, guarda
      largo y ancho. El area en m2 es largo x ancho, y las
      hectareas son ese valor entre 10 000. El formulario pide
      HECTAREAS porque la formula de poblacion total multiplica por
      10 000.

    - cantidadSiembra (larvas por m2): se toma de una siembra real del
      estanque, priorizando la que esta Activa y, entre esas, la mas
      reciente. Si la siembra ya trae su densidad registrada, se usa
      esa; si no, se calcula como cantidad sembrada / area en m2. Si
      no existe una siembra real utilizable, se devuelve null.

    Parametros:
    - idEstanque: Identificador del estanque elegido.
    - grupoDatos: Grupo de datos del usuario autenticado.

    Retorna:
    - Objeto con los datos base del estanque.
    - null si el estanque no existe o no pertenece al grupo.
    */

    const [estanques] = await pool.execute(
        `
        SELECT
            id,
            finca_id,
            codigo,
            largo,
            ancho
        FROM estanques
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        LIMIT 1
        `,
        [idEstanque, grupoDatos]
    );

    if (estanques.length === 0) {
        return null;
    }

    const estanque = estanques[0];

    const largo = convertirNumero(estanque.largo) || 0;
    const ancho = convertirNumero(estanque.ancho) || 0;
    const areaM2 = redondear(largo * ancho);
    const areaHectareas = areaM2 > 0 ? redondear(areaM2 / M2_POR_HECTAREA) : null;

    /*
    Se prefiere la siembra Activa; entre varias, la mas reciente.
    Un estanque puede tener siembras finalizadas de ciclos
    anteriores, y contar el conteo de hoy contra una siembra vieja
    daria una sobrevivencia sin sentido.
    */
    const [siembras] = await pool.execute(
        `
        SELECT
            densidad_poblacional,
            cantidad_sembrada,
            fecha_siembra,
            estado
        FROM siembras
        WHERE estanque_id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY (estado = 'Activa') DESC, fecha_siembra DESC, id DESC
        LIMIT 1
        `,
        [idEstanque, grupoDatos]
    );

    let cantidadSiembra = null;
    let origenCantidadSiembra = "sin_siembra";

    if (siembras.length > 0) {
        const siembra = siembras[0];
        const densidadSembrada = convertirNumero(siembra.densidad_poblacional);
        const cantidadSembrada = convertirNumero(siembra.cantidad_sembrada);

        if (densidadSembrada !== null && densidadSembrada > 0) {
            cantidadSiembra = redondear(densidadSembrada);
            origenCantidadSiembra = "siembra";
        } else if (cantidadSembrada !== null && cantidadSembrada > 0 && areaM2 > 0) {
            cantidadSiembra = redondear(cantidadSembrada / areaM2);
            origenCantidadSiembra = "calculado";
        }
    }

    if (cantidadSiembra === null) {
        origenCantidadSiembra = "sin_siembra";
    }

    return {
        idEstanque: estanque.id,
        idFinca: estanque.finca_id,
        codigoEstanque: estanque.codigo,
        largo,
        ancho,
        areaM2,
        areaEstanque: areaHectareas,
        cantidadSiembra,
        origenCantidadSiembra,
        tirosRecomendados: calcularTirosRecomendados(areaHectareas),
        areaAtarrayaSugerida: AREA_ATARRAYA_DEFECTO
    };
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas usadas por el modelo para mapear,
normalizar y convertir datos, y para manejar el detalle de tiros.
*/

async function insertarTiros(conexion, idDensidad, tiros, autoria) {
    /*
    Descripcion:
    Inserta el detalle tiro por tiro de un registro de densidad
    poblacional. Se ejecuta siempre dentro de la transaccion que
    abrio create() o update(), por eso recibe la conexion y no usa
    el pool directamente.

    Se usa un solo INSERT con multiples VALUES en vez de un INSERT
    por tiro: son hasta 20 filas por registro y hacerlo de a una
    multiplicaria los viajes a la base sin ninguna ganancia.

    grupo_datos y creado_por_usuario_id/creado_por_colaborador_id se
    completan aqui igual que en la cabecera: sin esto, cada fila de
    densidad_detalle_tiros quedaba con esas columnas en NULL aunque
    la tabla ya las tiene (ver database/init/001_schema.sql).

    Parametros:
    - conexion: Conexion activa de la transaccion en curso.
    - idDensidad: Id del registro de densidad al que pertenecen.
    - tiros: Arreglo [{ numeroTiro, cantidadCamarones }].
    - autoria: Objeto { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId }.

    Retorna:
    - undefined. Lanza si la insercion falla (la transaccion revierte).
    */

    if (!Array.isArray(tiros) || tiros.length === 0) {
        return;
    }

    const grupoDatos = obtenerNumeroValido(autoria?.grupoDatos);
    const creadoPorUsuarioId = obtenerNumeroValido(autoria?.creadoPorUsuarioId);
    const creadoPorColaboradorId = obtenerNumeroValido(autoria?.creadoPorColaboradorId);

    const placeholders = tiros.map(() => "(?, ?, ?, ?, ?, ?)").join(", ");

    const params = [];

    for (let i = 0; i < tiros.length; i++) {
        params.push(idDensidad);
        params.push(tiros[i].numeroTiro);
        params.push(Number(tiros[i].cantidadCamarones));
        params.push(grupoDatos);
        params.push(creadoPorUsuarioId);
        params.push(creadoPorColaboradorId);
    }

    await conexion.execute(
        `
        INSERT INTO densidad_detalle_tiros (
            densidad_id,
            numero_tiro,
            cantidad_camarones,
            grupo_datos,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES ${placeholders}
        `,
        params
    );
}

async function reconciliarTiros(conexion, idDensidad, tirosNuevos, autoria) {
    /*
    Descripcion:
    Reconcilia el detalle de tiros de un registro contra lo que ya
    esta activo en la base, en vez de borrar todo y volver a
    insertar. La usa unicamente update() (ver su docstring para el
    por que de usar numeroTiro como llave en vez de id).

    Se ejecuta siempre dentro de la transaccion que abrio update(),
    por eso recibe la conexion y no usa el pool directamente.

    Parametros:
    - conexion: Conexion activa de la transaccion en curso.
    - idDensidad: Id del registro de densidad al que pertenecen.
    - tirosNuevos: Arreglo [{ numeroTiro, cantidadCamarones }] ya
      normalizado (numeroTiro siempre 1, 2, 3... por posicion).
    - autoria: Objeto { grupoDatos, creadoPorUsuarioId, creadoPorColaboradorId }
      que se usa unicamente para las filas nuevas que haya que
      insertar (los tiros que se actualizan conservan su autoria
      original, no se tocan esas columnas).

    Retorna:
    - undefined. Lanza si alguna operacion falla (la transaccion revierte).
    */

    const tiros = Array.isArray(tirosNuevos) ? tirosNuevos : [];

    const [activos] = await conexion.execute(
        `
        SELECT id, numero_tiro
        FROM densidad_detalle_tiros
        WHERE densidad_id = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        `,
        [idDensidad]
    );

    const idExistentePorNumero = new Map();

    for (const fila of activos) {
        idExistentePorNumero.set(fila.numero_tiro, fila.id);
    }

    const numerosEnviados = new Set(tiros.map((tiro) => tiro.numeroTiro));

    /*
    1) Los que ya no vienen en el body -> borrado logico. No se
    borran fisicamente: siguen siendo el dato crudo de un muestreo
    que en verdad se hizo en campo.
    */
    for (const fila of activos) {
        if (!numerosEnviados.has(fila.numero_tiro)) {
            await conexion.execute(
                `
                UPDATE densidad_detalle_tiros
                SET activo = FALSE, deleted_at = NOW()
                WHERE id = ?
                `,
                [fila.id]
            );
        }
    }

    const grupoDatos = obtenerNumeroValido(autoria?.grupoDatos);
    const creadoPorUsuarioId = obtenerNumeroValido(autoria?.creadoPorUsuarioId);
    const creadoPorColaboradorId = obtenerNumeroValido(autoria?.creadoPorColaboradorId);

    /*
    2) Los que ya existian y siguen viniendo -> se actualiza solo
    la cantidad, sobre la misma fila (conserva id, fecha_creacion
    y autoria).
    3) Los que no existian -> se insertan como fila nueva.
    */
    for (const tiro of tiros) {
        const idExistente = idExistentePorNumero.get(tiro.numeroTiro);

        if (idExistente !== undefined) {
            await conexion.execute(
                `
                UPDATE densidad_detalle_tiros
                SET cantidad_camarones = ?
                WHERE id = ?
                `,
                [Number(tiro.cantidadCamarones), idExistente]
            );
        } else {
            await conexion.execute(
                `
                INSERT INTO densidad_detalle_tiros (
                    densidad_id,
                    numero_tiro,
                    cantidad_camarones,
                    grupo_datos,
                    creado_por_usuario_id,
                    creado_por_colaborador_id
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    idDensidad,
                    tiro.numeroTiro,
                    Number(tiro.cantidadCamarones),
                    grupoDatos,
                    creadoPorUsuarioId,
                    creadoPorColaboradorId
                ]
            );
        }
    }
}

async function findTirosPorDensidad(idDensidad) {
    /*
    Descripcion:
    Obtiene el detalle de tiros de un registro de densidad
    poblacional, ordenado por numero de tiro.

    Parametros:
    - idDensidad: Id del registro de densidad.

    Retorna:
    - Arreglo [{ id, uuid, numeroTiro, cantidadCamarones }].
    */

    const [rows] = await pool.execute(
        `
        SELECT
            id,
            uuid,
            grupo_datos,
            densidad_id,
            numero_tiro,
            cantidad_camarones,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM densidad_detalle_tiros
        WHERE densidad_id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        ORDER BY numero_tiro ASC
        `,
        [idDensidad]
    );

    return rows.map(mapearTiro);
}

async function findTirosDeVariosRegistros(idsRegistros) {
    /*
    Descripcion:
    Obtiene el detalle de tiros de varios registros de densidad en
    una sola consulta, y lo devuelve agrupado por registro. Evita el
    problema N+1 en findAll.

    Se usa para el LISTADO, no para el detalle de un registro
    puntual (eso lo sigue resolviendo findTirosPorDensidad, que si
    trae todas las columnas de auditoria via mapearTiro). Aqui solo
    se traen id, numeroTiro y cantidadCamarones: es lo unico que el
    listado necesita para no hacer una consulta por fila.

    Los placeholders se arman a mano (?, ?, ?...) porque
    connection.execute() con sentencias preparadas no expande un
    arreglo dentro de un IN (?).

    Parametros:
    - idsRegistros: Arreglo de ids de registros de densidad.

    Retorna:
    - Objeto { [idDensidad]: [{ id, numeroTiro, cantidadCamarones }] }.
    */

    if (!idsRegistros || idsRegistros.length === 0) {
        return {};
    }

    const placeholders = idsRegistros.map(() => "?").join(", ");

    const [tiros] = await pool.execute(
        `
        SELECT
            id,
            densidad_id AS densidadId,
            numero_tiro AS numeroTiro,
            cantidad_camarones AS cantidadCamarones
        FROM densidad_detalle_tiros
        WHERE densidad_id IN (${placeholders})
        AND activo = TRUE
        AND deleted_at IS NULL
        ORDER BY densidad_id ASC, numero_tiro ASC
        `,
        idsRegistros
    );

    const tirosPorRegistro = {};

    for (const tiro of tiros) {
        const densidadId = tiro.densidadId;

        if (!tirosPorRegistro[densidadId]) {
            tirosPorRegistro[densidadId] = [];
        }

        const datosTiro = {
            id: tiro.id,
            numeroTiro: tiro.numeroTiro,
            cantidadCamarones: tiro.cantidadCamarones
        };

        tirosPorRegistro[densidadId].push(datosTiro);
    }

    return tirosPorRegistro;
}

function mapearTiro(row) {
    /*
    Descripcion:
    Convierte una fila de densidad_detalle_tiros al formato
    camelCase que consume el frontend.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto { id, uuid, grupoDatos, idDensidad, numeroTiro,
      cantidadCamarones, creadoPorUsuarioId, creadoPorColaboradorId,
      activo, fechaCreacion, fechaActualizacion, deletedAt, version }.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idDensidad: row.densidad_id,
        numeroTiro: convertirNumero(row.numero_tiro),
        cantidadCamarones: convertirNumero(row.cantidad_camarones),
        creadoPorUsuarioId: row.creado_por_usuario_id,
        creadoPorColaboradorId: row.creado_por_colaborador_id,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

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

    Sobre los alias de compatibilidad: la columna se llama ahora
    total_camarones_muestra, pero pantallas ya existentes (por
    ejemplo la card de Reporteria) leen el campo como
    numeroCamarones. Se devuelven ambos nombres con el mismo valor
    para no romper esas pantallas mientras se migran. El nombre
    nuevo, totalCamaronesMuestra, es el que refleja la columna real
    y el que deberia usarse de aqui en adelante.

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto densidad poblacional en el formato esperado por el backend/frontend.
    */

    const totalCamaronesMuestra = convertirNumero(row.total_camarones_muestra);

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        idEstanque: row.estanque_id,
        fecha: formatearFecha(row.fecha),
        cantidadSiembra: convertirNumero(row.cantidad_siembra),
        areaEstanque: convertirNumero(row.area_estanque),
        totalCamaronesMuestra,
        numeroCamarones: totalCamaronesMuestra,
        tirosAtarraya: convertirNumero(row.tiros_atarraya),
        areaAtarraya: convertirNumero(row.area_atarraya),
        areaMuestreada: convertirNumero(row.area_muestreada),
        promedioPorTiro: convertirNumero(row.promedio_por_tiro),
        poblacionEstimada: convertirNumero(row.poblacion_estimada),
        sobrevivencia: convertirNumero(row.sobrevivencia),
        densidad: convertirNumero(row.densidad),
        notasConteo: row.notas_conteo,
        creadoPorUsuarioId: row.creado_por_usuario_id,
        creadoPorColaboradorId: row.creado_por_colaborador_id,
        creadoPorNombre: row.creado_por_nombre,
        usuarioNombre: row.creado_por_nombre,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version,
        tiros: []
    };
}

function obtenerNumeroValido(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.
    Se usa para grupoDatos y para los identificadores de creador
    antes de insertar, ya que deben venir del JWT (nunca del body).

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

function aValorSql(valor) {
    /*
    Descripcion:
    Convierte undefined en null antes de mandar el valor a MySQL.
    mysql2 lanza "Bind parameters must not contain undefined" si un
    parametro de una sentencia preparada llega como undefined, asi
    que todos los campos opcionales pasan por aqui.

    Parametros:
    - valor: Valor a enviar como parametro.

    Retorna:
    - El mismo valor, o null si era undefined.
    */

    return valor === undefined ? null : valor;
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
    - null si no hay valor (la columna es NOT NULL, asi que MySQL
      rechazara la operacion en vez de guardar la cadena "null").
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    if (valor instanceof Date) {
        return valor.toISOString().slice(0, 10);
    }

    const texto = String(valor).trim();

    if (texto === "") {
        return null;
    }

    if (texto.includes("/")) {
        const partes = texto.split("/");

        if (partes.length === 3) {
            const dia = partes[0].padStart(2, "0");
            const mes = partes[1].padStart(2, "0");
            const anio = partes[2];

            return anio + "-" + mes + "-" + dia;
        }
    }

    return texto.slice(0, 10);
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

function redondear(valor) {
    /*
    Descripcion:
    Redondea a 2 decimales, la precision de las columnas
    DECIMAL(10,2) del modulo.

    Parametros:
    - valor: Numero a redondear.

    Retorna:
    - Numero con 2 decimales.
    */

    return Math.round(valor * 100) / 100;
}