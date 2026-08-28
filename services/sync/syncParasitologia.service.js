/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncParasitologia.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de registros de parasitologia
creados, actualizados o eliminados desde la aplicacion movil,
respetando las reglas del modulo normal de Parasitologia.
//////////////////////////////////////////////////////////
*/

import {
    isEmpty,
    isNumeroMayorCero,
    isFechaValida,
    isFechaFutura,
    isParasitoValido,
    isGradoInfeccionValido,
} from "../parasitologias.service.js";

function crearError(mensaje, status = 422) {
    const error = new Error(mensaje);
    error.status = status;
    return error;
}

function obtenerDatosRegistro(registro, normalizarFecha, responsable) {
    return {
        fincaId:
            registro.fincaId ??
            registro.finca_id ??
            registro.finca ??
            null,

        estanqueId:
            registro.estanqueId ??
            registro.estanque_id ??
            registro.estanque ??
            null,

        fechaReporte: normalizarFecha(
            registro.fechaReporte ??
            registro.fecha_reporte
        ),

        responsable,

        parasito: String(
            registro.parasito ?? ""
        ).trim(),

        gradoInfeccion: String(
            registro.gradoInfeccion ??
            registro.grado_infeccion ??
            ""
        ).trim().toLowerCase(),

        observaciones:
            registro.observaciones ??
            null,
    };
}

function validarDatos(datos) {
    const errores = [];

    if (isEmpty(datos.fincaId)) {
        errores.push(
            "El campo fincaId es requerido."
        );
    }

    if (isEmpty(datos.estanqueId)) {
        errores.push(
            "El campo estanqueId es requerido."
        );
    }

    if (isEmpty(datos.fechaReporte)) {
        errores.push(
            "El campo fechaReporte es requerido."
        );
    }

    if (isEmpty(datos.parasito)) {
        errores.push(
            "El campo parasito es requerido."
        );
    }

    if (isEmpty(datos.gradoInfeccion)) {
        errores.push(
            "El campo gradoInfeccion es requerido."
        );
    }

    if (
        !isEmpty(datos.fincaId) &&
        !isNumeroMayorCero(datos.fincaId)
    ) {
        errores.push(
            "El campo fincaId debe ser numerico y mayor que cero."
        );
    }

    if (
        !isEmpty(datos.estanqueId) &&
        !isNumeroMayorCero(datos.estanqueId)
    ) {
        errores.push(
            "El campo estanqueId debe ser numerico y mayor que cero."
        );
    }

    if (
        !isEmpty(datos.fechaReporte) &&
        !isFechaValida(datos.fechaReporte)
    ) {
        errores.push(
            "El campo fechaReporte debe tener formato yyyy-mm-dd o dd/mm/aaaa."
        );
    }

    if (
        !isEmpty(datos.fechaReporte) &&
        isFechaValida(datos.fechaReporte) &&
        isFechaFutura(datos.fechaReporte)
    ) {
        errores.push(
            "El campo fechaReporte no puede ser una fecha futura."
        );
    }

    if (
        !isEmpty(datos.parasito) &&
        !isParasitoValido(datos.parasito)
    ) {
        errores.push(
            "El parasito seleccionado no es valido."
        );
    }

    if (
        !isEmpty(datos.gradoInfeccion) &&
        !isGradoInfeccionValido(
            datos.gradoInfeccion
        )
    ) {
        errores.push(
            "El grado de infeccion seleccionado no es valido."
        );
    }

    if (errores.length > 0) {
        throw crearError(
            `Datos invalidos para la parasitologia: ${errores.join(" ")}`
        );
    }
}

async function obtenerResponsable(
    connection,
    colaboradorId,
    grupoDatos
) {
    if (!colaboradorId) {
        return null;
    }

    const [filas] =
        await connection.execute(
            `
        SELECT
          nombre,
          apellidos
        FROM colaboradores
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1
      `,
            [
                colaboradorId,
                grupoDatos,
            ]
        );

    if (filas.length === 0) {
        return null;
    }

    return `${filas[0].nombre ?? ""} ${filas[0].apellidos ?? ""}`.trim() || null;
}

async function validarFincaEstanque(
    connection,
    fincaId,
    estanqueId,
    grupoDatos
) {
    const [filas] =
        await connection.execute(
            `
        SELECT e.id
        FROM estanques e
        INNER JOIN fincas f
          ON f.id = e.finca_id
        WHERE f.id = ?
        AND e.id = ?
        AND f.grupo_datos = ?
        AND e.grupo_datos = ?
        AND f.deleted_at IS NULL
        AND e.deleted_at IS NULL
        AND f.activo = TRUE
        AND e.activo = TRUE
        LIMIT 1
      `,
            [
                fincaId,
                estanqueId,
                grupoDatos,
                grupoDatos,
            ]
        );

    if (filas.length === 0) {
        throw crearError(
            "La finca o el estanque no existen, no pertenecen al grupo de datos o no se encuentran relacionados.",
            404
        );
    }
}

async function obtenerActual(
    connection,
    id,
    grupoDatos
) {
    const [filas] =
        await connection.execute(
            `
        SELECT
          id,
          responsable,
          creado_por_usuario_id,
          creado_por_colaborador_id
        FROM parasitologias
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1
      `,
            [
                id,
                grupoDatos,
            ]
        );

    return filas[0] ?? null;
}

async function actualizar(
    connection,
    id,
    grupoDatos,
    datos
) {
    const [resultado] =
        await connection.execute(
            `
        UPDATE parasitologias
        SET
          finca_id = ?,
          estanque_id = ?,
          fecha_reporte = ?,
          parasito = ?,
          grado_infeccion = ?,
          observaciones = ?,
          version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
      `,
            [
                datos.fincaId,
                datos.estanqueId,
                datos.fechaReporte,
                datos.parasito,
                datos.gradoInfeccion,
                datos.observaciones,
                id,
                grupoDatos,
            ]
        );

    return resultado;
}

async function eliminar(
    connection,
    id,
    grupoDatos
) {
    const [resultado] =
        await connection.execute(
            `
        UPDATE parasitologias
        SET
          activo = FALSE,
          deleted_at = CURRENT_TIMESTAMP,
          version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
      `,
            [
                id,
                grupoDatos,
            ]
        );

    return resultado;
}

export async function sincronizarParasitologias({
    connection,
    cambios,
    grupoDatos,
    creadoPorColaboradorId,
    insertarRegistroSync,
    normalizarFecha,
}) {
    const resultado = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
    };

    const {
        crear = [],
        actualizar: actualizaciones = [],
        eliminar: eliminaciones = [],
    } = cambios;

    const responsable =
        await obtenerResponsable(
            connection,
            creadoPorColaboradorId,
            grupoDatos
        );

    for (const registro of crear) {
        const datos =
            obtenerDatosRegistro(
                registro,
                normalizarFecha,
                responsable
            );

        validarDatos(datos);

        await validarFincaEstanque(
            connection,
            datos.fincaId,
            datos.estanqueId,
            grupoDatos
        );

        const insertado =
            await insertarRegistroSync(
                connection,
                "parasitologias",
                {
                    grupo_datos:
                        grupoDatos,

                    finca_id:
                        datos.fincaId,

                    estanque_id:
                        datos.estanqueId,

                    creado_por_usuario_id:
                        null,

                    creado_por_colaborador_id:
                        creadoPorColaboradorId,

                    tipo_registro:
                        "parasitologia",

                    fecha_reporte:
                        datos.fechaReporte,

                    responsable:
                        datos.responsable,

                    parasito:
                        datos.parasito,

                    grado_infeccion:
                        datos.gradoInfeccion,

                    observaciones:
                        datos.observaciones,
                }
            );

        resultado.creados.push({
            idLocal:
                registro.idLocal ??
                registro.id ??
                null,

            idServidor:
                insertado.insertId,
        });
    }

    for (const registro of actualizaciones) {
        const idReal =
            registro.servidor_id ??
            registro.servidorId ??
            registro.id;

        const actual =
            await obtenerActual(
                connection,
                idReal,
                grupoDatos
            );

        if (!actual) {
            throw crearError(
                "Parasitologia no encontrada.",
                404
            );
        }

        const datos =
            obtenerDatosRegistro(
                registro,
                normalizarFecha,
                actual.responsable
            );

        validarDatos(datos);

        await validarFincaEstanque(
            connection,
            datos.fincaId,
            datos.estanqueId,
            grupoDatos
        );

        const actualizado =
            await actualizar(
                connection,
                idReal,
                grupoDatos,
                datos
            );

        resultado.actualizados +=
            actualizado.affectedRows ??
            0;
    }

    for (const id of eliminaciones) {
        const eliminado =
            await eliminar(
                connection,
                id,
                grupoDatos
            );

        resultado.eliminados +=
            eliminado.affectedRows ??
            0;
    }

    return resultado;
}