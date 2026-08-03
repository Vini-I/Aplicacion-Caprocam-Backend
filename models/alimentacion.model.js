/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.model.js
Autor: Wendy Martinez
Fecha: 06/07/2026
Modulo: Alimentacion
Descripcion:
Capa de datos del modulo de alimentacion.
Trabaja con la base de datos principal MySQL.
Contiene las consultas necesarias para obtener, crear,
actualizar y eliminar logicamente registros de alimentacion.
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
    Obtiene todos los registros de alimentacion activos desde la
    base de datos.
    Permite filtrar por finca, estanque y por grupo de datos.

    Parametros:
    - filtros: Objeto con filtros opcionales.
        - idFinca: Identificador de la finca.
        - idEstanque: Identificador del estanque.
        - grupoDatos: Codigo del grupo de datos.

    Retorna:
    - Lista de registros de alimentacion encontrados.
    */

    let sql = `
        SELECT
            id,
            uuid,
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            proveedor_id,
            producto_id,
            fecha,
            hora,
            metodo,
            cantidad_kg,
            presentacion,
            proveedor,
            tipo_alimento,
            observaciones,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM alimentaciones
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

export async function findById(id, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de alimentacion activo por su identificador
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
            proveedor_id,
            producto_id,
            fecha,
            hora,
            metodo,
            cantidad_kg,
            presentacion,
            proveedor,
            tipo_alimento,
            observaciones,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM alimentaciones
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        AND grupo_datos = ?
        LIMIT 1
        `,
        [id, grupoDatos]
    );

    if (rows.length === 0) {
        return null;
    }

    return mapearFila(rows[0]);
}

export async function findByFechaHoraEstanque(fecha, hora, idEstanque, idIgnorado, grupoDatos) {
    /*
    Descripcion:
    Busca un registro de alimentacion por fecha, hora y estanque.
    Se utiliza para evitar registrar dos veces la misma alimentacion
    para el mismo estanque en la misma fecha y hora.
    Permite ignorar un id especifico cuando se esta actualizando un registro.

    Parametros:
    - fecha: Fecha de la alimentacion.
    - hora: Hora de la alimentacion.
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
            colaborador_id,
            proveedor_id,
            producto_id,
            fecha,
            hora,
            metodo,
            cantidad_kg,
            presentacion,
            proveedor,
            tipo_alimento,
            observaciones,
            creado_por_usuario_id,
            creado_por_colaborador_id,
            activo,
            fecha_creacion,
            fecha_actualizacion,
            deleted_at,
            version
        FROM alimentaciones
        WHERE fecha = ?
        AND estanque_id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
    `;

    const params = [fecha, idEstanque, grupoDatos];

    if (hora !== null) {
        if (hora !== undefined) {
            sql = sql + " AND hora = ?";
            params.push(hora);
        }
    }

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
    Inserta un nuevo registro de alimentacion en la base de datos.
    grupoDatos debe venir ya resuelto desde el JWT (ver controller y
    dto): si falta o es invalido, se rechaza la insercion en vez de
    asumir un grupo por defecto. De creadoPorUsuarioId/
    creadoPorColaboradorId debe venir presente exactamente uno.

    Parametros:
    - dto: Objeto AlimentacionDTO con los datos normalizados.

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

    /*
    colaborador_id (quien aplico la alimentacion) es distinto de
    creado_por_colaborador_id (quien autentico la peticion). Si el
    formulario envio un colaborador especifico (dto.idColaborador),
    se usa ese; si no, se asume por defecto el colaborador que
    autentico la peticion (cuando fue registrado desde la APK).
    */
    const idColaboradorEnviado = obtenerNumeroValido(dto.idColaborador);
    const colaboradorId = idColaboradorEnviado !== null ? idColaboradorEnviado : creadoPorColaboradorId;

    const fecha = normalizarFechaMysql(dto.fecha);

    const [result] = await pool.execute(
        `
        INSERT INTO alimentaciones (
            grupo_datos,
            finca_id,
            estanque_id,
            colaborador_id,
            proveedor_id,
            producto_id,
            fecha,
            hora,
            metodo,
            cantidad_kg,
            presentacion,
            proveedor,
            tipo_alimento,
            observaciones,
            creado_por_usuario_id,
            creado_por_colaborador_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.idEstanque,
            colaboradorId,
            dto.idProveedor,
            dto.idProducto,
            fecha,
            dto.hora,
            dto.metodo,
            dto.cantidadKg,
            dto.presentacion,
            dto.proveedor,
            dto.tipoAlimento,
            dto.observaciones,
            creadoPorUsuarioId,
            creadoPorColaboradorId
        ]
    );

    return await findById(result.insertId, grupoDatos);
}

export async function update(id, dto, grupoDatos) {
    /*
    Descripcion:
    Actualiza un registro de alimentacion existente en la base de datos.
    Tambien incrementa la version del registro para control de cambios.

    Parametros:
    - id: Identificador del registro que se desea actualizar.
    - dto: Objeto AlimentacionDTO con los datos actualizados.

    Retorna:
    - El registro actualizado.
    - null si el registro no existe o fue eliminado logicamente.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    const fecha = normalizarFechaMysql(dto.fecha);

    /*
    Si el dto no trae idColaborador (no se reenvio desde el
    formulario), se conserva el valor que ya tenia el registro en
    vez de sobreescribirlo con null.
    */
    const idColaboradorEnviado = obtenerNumeroValido(dto.idColaborador);
    const colaboradorId = idColaboradorEnviado !== null ? idColaboradorEnviado : actual.idColaborador;

    await pool.execute(
        `
        UPDATE alimentaciones
        SET
            grupo_datos = ?,
            finca_id = ?,
            estanque_id = ?,
            colaborador_id = ?,
            proveedor_id = ?,
            producto_id = ?,
            fecha = ?,
            hora = ?,
            metodo = ?,
            cantidad_kg = ?,
            presentacion = ?,
            proveedor = ?,
            tipo_alimento = ?,
            observaciones = ?,
            version = version + 1
        WHERE id = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [
            grupoDatos,
            dto.idFinca,
            dto.idEstanque,
            colaboradorId,
            dto.idProveedor,
            dto.idProducto,
            fecha,
            dto.hora,
            dto.metodo,
            dto.cantidadKg,
            dto.presentacion,
            dto.proveedor,
            dto.tipoAlimento,
            dto.observaciones,
            id
        ]
    );

    return await findById(id, grupoDatos);
}

export async function remove(id, grupoDatos) {
    /*
    Descripcion:
    Elimina logicamente un registro de alimentacion.
    No borra fisicamente el registro de la base de datos.
    Cambia activo a false, llena deleted_at e incrementa version.

    Parametros:
    - id: Identificador del registro que se desea eliminar.
    - grupoDatos: Grupo de datos del usuario.

    Retorna:
    - El registro eliminado logicamente.
    - null si el registro no existe o ya fue eliminado.
    */

    const actual = await findById(id, grupoDatos);

    if (!actual) {
        return null;
    }

    await pool.execute(
        `
        UPDATE alimentaciones
        SET
            activo = FALSE,
            deleted_at = CURRENT_TIMESTAMP,
            version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        AND activo = TRUE
        `,
        [id, grupoDatos]
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
    - Lista de registros de alimentacion mapeados.
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
    Incluye creadoPorUsuarioId/creadoPorColaboradorId (quien hizo el
    registro: exactamente uno de los dos, segun si fue un Usuario Web
    o un Colaborador APK).

    Parametros:
    - row: Fila obtenida desde MySQL.

    Retorna:
    - Objeto alimentacion en el formato esperado por el backend/frontend.
    */

    return {
        id: row.id,
        uuid: row.uuid,
        grupoDatos: row.grupo_datos,
        idFinca: row.finca_id,
        idEstanque: row.estanque_id,
        idColaborador: row.colaborador_id,
        idProveedor: row.proveedor_id,
        idProducto: row.producto_id,
        fecha: formatearFecha(row.fecha),
        hora: row.hora,
        metodo: row.metodo,
        cantidadKg: convertirNumero(row.cantidad_kg),
        presentacion: row.presentacion,
        proveedor: row.proveedor,
        tipoAlimento: row.tipo_alimento,
        observaciones: row.observaciones,
        creadoPorUsuarioId: row.creado_por_usuario_id,
        creadoPorColaboradorId: row.creado_por_colaborador_id,
        activo: Boolean(row.activo),
        fechaCreacion: row.fecha_creacion,
        fechaActualizacion: row.fecha_actualizacion,
        deletedAt: row.deleted_at,
        version: row.version
    };
}

function obtenerNumeroValido(valor) {
    /*
    Descripcion:
    Valida que un valor sea numerico y mayor que cero.
    Se usa para grupoDatos, creadoPorUsuarioId y creadoPorColaboradorId
    antes de insertar: todos deben venir del JWT (nunca del body).

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