/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncDensidad.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de densidad poblacional y sus
tiros de atarraya, recalculando los resultados en backend.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
    calcularResultados,
    isFechaValida,
    isNumeroMayorCero,
    maxLength,
    validarTiros,
} from "../densidadPoblacional.service.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const M2_POR_HECTAREA = 10000;

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function redondear(valor) {
    return Math.round(Number(valor) * 100) / 100;
}

function obtenerIdServidor(registro) {
    return (
        registro?.servidor_id ??
        registro?.servidorId ??
        registro?.id ??
        null
    );
}

function obtenerIdLocal(registro) {
    return registro?.idLocal ?? registro?.id ?? null;
}

function obtenerNumero(valor) {
    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero
        : null;
}

function validarDatosCabecera({
    fecha,
    areaAtarraya,
    notasConteo,
}) {
    if (!isFechaValida(fecha)) {
        throw new Error(
            "La fecha de densidad poblacional no es valida."
        );
    }

    if (!isNumeroMayorCero(areaAtarraya)) {
        throw new Error(
            "El area de atarraya debe ser mayor que cero."
        );
    }

    if (!maxLength(notasConteo, 255)) {
        throw new Error(
            "Las notas de conteo no pueden superar los 255 caracteres."
        );
    }
}

function validarCantidadTiro(valor) {
    const cantidad = Number(valor);

    if (
        !Number.isInteger(cantidad) ||
        cantidad < 0
    ) {
        throw new Error(
            "La cantidad de camarones de cada tiro debe ser un entero mayor o igual a cero."
        );
    }

    return cantidad;
}

async function obtenerDatosBaseEstanque(
    connection,
    idEstanque,
    grupoDatos
) {
    const [estanques] =
        await connection.execute(
            `SELECT
                id,
                finca_id,
                codigo,
                largo,
                ancho
             FROM estanques
             WHERE id = ?
             AND grupo_datos = ?
             AND activo = TRUE
             AND deleted_at IS NULL
             LIMIT 1`,
            [
                idEstanque,
                grupoDatos,
            ]
        );

    if (estanques.length === 0) {
        return null;
    }

    const estanque =
        estanques[0];

    const largo =
        obtenerNumero(
            estanque.largo
        ) ?? 0;

    const ancho =
        obtenerNumero(
            estanque.ancho
        ) ?? 0;

    const areaM2 =
        redondear(
            largo * ancho
        );

    const areaEstanque =
        areaM2 > 0
            ? redondear(
                areaM2 /
                M2_POR_HECTAREA
            )
            : null;

    const [siembras] =
        await connection.execute(
            `SELECT
                densidad_poblacional,
                cantidad_sembrada,
                fecha_siembra,
                estado
             FROM siembras
             WHERE estanque_id = ?
             AND grupo_datos = ?
             AND activo = TRUE
             AND deleted_at IS NULL
             ORDER BY
                (estado = 'Activa') DESC,
                fecha_siembra DESC,
                id DESC
             LIMIT 1`,
            [
                idEstanque,
                grupoDatos,
            ]
        );

    let cantidadSiembra = null;

    if (siembras.length > 0) {
        const densidadPoblacional =
            obtenerNumero(
                siembras[0]
                    .densidad_poblacional
            );

        const cantidadSembrada =
            obtenerNumero(
                siembras[0]
                    .cantidad_sembrada
            );

        if (
            densidadPoblacional !== null &&
            densidadPoblacional > 0
        ) {
            cantidadSiembra =
                redondear(
                    densidadPoblacional
                );
        } else if (
            cantidadSembrada !== null &&
            cantidadSembrada > 0 &&
            areaM2 > 0
        ) {
            cantidadSiembra =
                redondear(
                    cantidadSembrada /
                    areaM2
                );
        }
    }

    return {
        idEstanque:
            estanque.id,

        idFinca:
            estanque.finca_id,

        areaEstanque,

        cantidadSiembra,
    };
}

async function validarSiembraReal(
    connection,
    idEstanque,
    grupoDatos
) {
    const datosBase =
        await obtenerDatosBaseEstanque(
            connection,
            idEstanque,
            grupoDatos
        );

    if (!datosBase) {
        throw new Error(
            `El estanque ${idEstanque} no existe en el grupo de datos activo.`
        );
    }

    if (
        !Number.isFinite(
            Number(datosBase.cantidadSiembra)
        ) ||
        Number(datosBase.cantidadSiembra) <= 0
    ) {
        throw new Error(
            `El estanque ${idEstanque} no tiene una siembra real registrada.`
        );
    }

    if (
        !Number.isFinite(
            Number(datosBase.areaEstanque)
        ) ||
        Number(datosBase.areaEstanque) <= 0
    ) {
        throw new Error(
            `El estanque ${idEstanque} no tiene un area valida.`
        );
    }

    return datosBase;
}

async function buscarDensidadActual(
    connection,
    id,
    grupoDatos
) {
    const [filas] =
        await connection.execute(
            `SELECT *
       FROM densidad_poblacional
       WHERE id = ?
       AND grupo_datos = ?
       AND activo = TRUE
       AND deleted_at IS NULL
       LIMIT 1`,
            [
                id,
                grupoDatos,
            ]
        );

    return filas.length > 0
        ? filas[0]
        : null;
}

async function validarDuplicadoFecha(
    connection,
    fecha,
    idEstanque,
    grupoDatos,
    idIgnorado = null
) {
    let sql = `
    SELECT id
    FROM densidad_poblacional
    WHERE fecha = ?
    AND estanque_id = ?
    AND grupo_datos = ?
    AND activo = TRUE
    AND deleted_at IS NULL
  `;

    const valores = [
        fecha,
        idEstanque,
        grupoDatos,
    ];

    if (idIgnorado !== null) {
        sql += " AND id <> ?";
        valores.push(idIgnorado);
    }

    sql += " LIMIT 1";

    const [filas] =
        await connection.execute(
            sql,
            valores
        );

    if (filas.length > 0) {
        throw new Error(
            "Ya existe un registro de densidad poblacional para ese estanque en esa fecha."
        );
    }
}

async function obtenerTirosActivos(
    connection,
    densidadId
) {
    const [filas] =
        await connection.execute(
            `SELECT
          numero_tiro,
          cantidad_camarones
       FROM densidad_detalle_tiros
       WHERE densidad_id = ?
       AND activo = TRUE
       AND deleted_at IS NULL
       ORDER BY numero_tiro ASC`,
            [densidadId]
        );

    return filas.map((fila) => {
        return {
            numeroTiro:
                Number(fila.numero_tiro),

            cantidadCamarones:
                Number(fila.cantidad_camarones),
        };
    });
}

async function recalcularDensidad(
    connection,
    densidadId,
    grupoDatos,
    incrementarVersion
) {
    const actual =
        await buscarDensidadActual(
            connection,
            densidadId,
            grupoDatos
        );

    if (!actual) {
        return;
    }

    const tiros =
        await obtenerTirosActivos(
            connection,
            densidadId
        );

    const erroresTiros =
        validarTiros(tiros);

    if (erroresTiros.length > 0) {
        throw new Error(
            erroresTiros.join(" ")
        );
    }

    const resultados =
        calcularResultados({
            tiros,

            areaAtarraya:
                Number(actual.area_atarraya),

            areaEstanque:
                Number(actual.area_estanque),

            cantidadSiembra:
                Number(actual.cantidad_siembra),
        });

    const versionSql =
        incrementarVersion
            ? ", version = version + 1"
            : "";

    await connection.execute(
        `UPDATE densidad_poblacional
     SET
       total_camarones_muestra = ?,
       tiros_atarraya = ?,
       area_muestreada = ?,
       promedio_por_tiro = ?,
       poblacion_estimada = ?,
       sobrevivencia = ?,
       densidad = ?
       ${versionSql}
     WHERE id = ?
     AND grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL`,
        [
            resultados.totalCamaronesMuestra,
            resultados.tirosAtarraya,
            resultados.areaMuestreada,
            resultados.promedioPorTiro,
            resultados.poblacionEstimada,
            resultados.sobrevivencia,
            resultados.densidad,
            densidadId,
            grupoDatos,
        ]
    );
}

async function obtenerDensidadIdDeDetalle(
    connection,
    id,
    grupoDatos
) {
    const [filas] =
        await connection.execute(
            `SELECT detalle.densidad_id
       FROM densidad_detalle_tiros detalle
       INNER JOIN densidad_poblacional densidad
       ON densidad.id = detalle.densidad_id
       WHERE detalle.id = ?
       AND densidad.grupo_datos = ?
       AND detalle.activo = TRUE
       AND detalle.deleted_at IS NULL
       LIMIT 1`,
            [
                id,
                grupoDatos,
            ]
        );

    return filas.length > 0
        ? filas[0].densidad_id
        : null;
}

async function eliminarDetalleDensidad(
    connection,
    id,
    grupoDatos
) {
    await connection.execute(
        `UPDATE densidad_detalle_tiros detalle
     INNER JOIN densidad_poblacional densidad
     ON densidad.id = detalle.densidad_id
     SET
       detalle.activo = FALSE,
       detalle.deleted_at = CURRENT_TIMESTAMP,
       detalle.version = detalle.version + 1
     WHERE detalle.id = ?
     AND densidad.grupo_datos = ?
     AND detalle.activo = TRUE
     AND detalle.deleted_at IS NULL`,
        [
            id,
            grupoDatos,
        ]
    );
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function sincronizarDensidad({
    connection,
    cambios,
    grupoDatos,
    creadoPorColaboradorId,
    insertarRegistroSync,
    actualizarRegistroSync,
    buscarRegistroSync,
    resolverIdForanea,
    normalizarFecha,
}) {
    const resultado = {};

    const cambiosDensidad =
        cambios.densidadPoblacional ??
        null;

    const cambiosTiros =
        cambios.detalleTirosDensidad ??
        null;

    const densidadesCreadas =
        new Set();

    const densidadesModificadas =
        new Set();

    const densidadesEliminadas =
        new Set();

    /*
    //////////////////////////////////////////////////////////
    DENSIDAD POBLACIONAL
    //////////////////////////////////////////////////////////
    */

    if (cambiosDensidad) {
        resultado.densidadPoblacional = {
            creados: [],
            actualizados: 0,
            eliminados: 0,
        };

        const {
            crear = [],
            actualizar = [],
            eliminar = [],
        } = cambiosDensidad;

        /*
        //////////////////////////////////////////////////////////
        CREAR
        //////////////////////////////////////////////////////////
        */

        for (const r of crear) {
            const idEstanque =
                r.estanqueId ??
                r.estanque_id ??
                null;

            const fecha =
                normalizarFecha(r.fecha);

            const areaAtarraya =
                r.areaAtarraya ??
                r.area_atarraya ??
                null;

            const notasConteo =
                r.notasConteo ??
                r.notas_conteo ??
                null;

            validarDatosCabecera({
                fecha,
                areaAtarraya,
                notasConteo,
            });

            const datosBase =
                await validarSiembraReal(
                    connection,
                    idEstanque,
                    grupoDatos
                );

            await validarDuplicadoFecha(
                connection,
                fecha,
                idEstanque,
                grupoDatos
            );

            const insertado =
                await insertarRegistroSync(
                    connection,
                    "densidad_poblacional",
                    {
                        grupo_datos:
                            grupoDatos,

                        finca_id:
                            r.fincaId ??
                            r.finca_id ??
                            datosBase.idFinca,

                        estanque_id:
                            idEstanque,

                        fecha:
                            fecha,

                        cantidad_siembra:
                            datosBase.cantidadSiembra,

                        area_estanque:
                            datosBase.areaEstanque,

                        total_camarones_muestra:
                            null,

                        tiros_atarraya:
                            null,

                        area_atarraya:
                            Number(areaAtarraya),

                        area_muestreada:
                            null,

                        promedio_por_tiro:
                            null,

                        poblacion_estimada:
                            null,

                        sobrevivencia:
                            null,

                        densidad:
                            null,

                        notas_conteo:
                            notasConteo,

                        creado_por_usuario_id:
                            r.creadoPorUsuarioId ??
                            r.creado_por_usuario_id ??
                            null,

                        creado_por_colaborador_id:
                            r.creadoPorColaboradorId ??
                            r.creado_por_colaborador_id ??
                            creadoPorColaboradorId,
                    }
                );

            resultado.densidadPoblacional.creados.push({
                idLocal:
                    obtenerIdLocal(r),

                idServidor:
                    insertado.insertId,
            });

            densidadesCreadas.add(
                Number(insertado.insertId)
            );
        }

        /*
        //////////////////////////////////////////////////////////
        ACTUALIZAR
        //////////////////////////////////////////////////////////
        */

        for (const r of actualizar) {
            const idReal =
                obtenerIdServidor(r);

            const actual =
                await buscarDensidadActual(
                    connection,
                    idReal,
                    grupoDatos
                );

            if (!actual) {
                throw new Error(
                    `La densidad ${idReal} no existe en el grupo de datos activo.`
                );
            }

            const idEstanque =
                r.estanqueId ??
                r.estanque_id ??
                actual.estanque_id;

            const fecha =
                normalizarFecha(
                    r.fecha ??
                    actual.fecha
                );

            const areaAtarraya =
                r.areaAtarraya ??
                r.area_atarraya ??
                actual.area_atarraya;

            const notasConteo =
                r.notasConteo ??
                r.notas_conteo ??
                actual.notas_conteo;

            validarDatosCabecera({
                fecha,
                areaAtarraya,
                notasConteo,
            });

            const datosBase =
                await validarSiembraReal(
                    connection,
                    idEstanque,
                    grupoDatos
                );

            await validarDuplicadoFecha(
                connection,
                fecha,
                idEstanque,
                grupoDatos,
                idReal
            );

            const actualizado =
                await actualizarRegistroSync(
                    connection,
                    "densidad_poblacional",
                    {
                        finca_id:
                            r.fincaId ??
                            r.finca_id ??
                            actual.finca_id,

                        estanque_id:
                            idEstanque,

                        fecha:
                            fecha,

                        cantidad_siembra:
                            datosBase.cantidadSiembra,

                        area_estanque:
                            datosBase.areaEstanque,

                        area_atarraya:
                            Number(areaAtarraya),

                        notas_conteo:
                            notasConteo,
                    },
                    {
                        id:
                            idReal,

                        grupo_datos:
                            grupoDatos,

                        activo:
                            true,
                    }
                );

            resultado.densidadPoblacional.actualizados +=
                actualizado.affectedRows ?? 0;

            densidadesModificadas.add(
                Number(idReal)
            );
        }

        /*
        //////////////////////////////////////////////////////////
        ELIMINAR
        //////////////////////////////////////////////////////////
        */

        for (const id of eliminar) {
            const idReal =
                typeof id === "object"
                    ? obtenerIdServidor(id)
                    : id;

            await connection.execute(
                `UPDATE densidad_poblacional
         SET
           activo = FALSE,
           deleted_at = CURRENT_TIMESTAMP,
           version = version + 1
         WHERE id = ?
         AND grupo_datos = ?
         AND activo = TRUE
         AND deleted_at IS NULL`,
                [
                    idReal,
                    grupoDatos,
                ]
            );

            resultado.densidadPoblacional.eliminados++;

            densidadesEliminadas.add(
                Number(idReal)
            );
        }
    }

    /*
    //////////////////////////////////////////////////////////
    DETALLE DE TIROS
    //////////////////////////////////////////////////////////
    */

    if (cambiosTiros) {
        resultado.detalleTirosDensidad = {
            creados: [],
            actualizados: 0,
            eliminados: 0,
        };

        const {
            crear = [],
            actualizar = [],
            eliminar = [],
        } = cambiosTiros;

        /*
        //////////////////////////////////////////////////////////
        CREAR
        //////////////////////////////////////////////////////////
        */

        for (const r of crear) {
            const densidadId =
                resolverIdForanea(
                    r.densidadId ??
                    r.densidad_id,

                    resultado
                        .densidadPoblacional
                        ?.creados,

                    cambiosDensidad
                        ?.actualizar
                );

            const numeroTiro =
                Number(
                    r.numeroTiro ??
                    r.numero_tiro
                );

            const cantidadCamarones =
                validarCantidadTiro(
                    r.cantidadCamarones ??
                    r.cantidad_camarones
                );

            const padre =
                await buscarDensidadActual(
                    connection,
                    densidadId,
                    grupoDatos
                );

            if (!padre) {
                throw new Error(
                    `La densidad ${densidadId} no existe en el grupo de datos activo.`
                );
            }

            const existente =
                await buscarRegistroSync(
                    connection,
                    "densidad_detalle_tiros",
                    {
                        densidad_id:
                            densidadId,

                        numero_tiro:
                            numeroTiro,
                    }
                );

            if (existente) {
                await actualizarRegistroSync(
                    connection,
                    "densidad_detalle_tiros",
                    {
                        cantidad_camarones:
                            cantidadCamarones,
                    },
                    {
                        id:
                            existente.id,
                    }
                );

                resultado
                    .detalleTirosDensidad
                    .creados
                    .push({
                        idLocal:
                            obtenerIdLocal(r),

                        idServidor:
                            existente.id,
                    });
            } else {
                const insertado =
                    await insertarRegistroSync(
                        connection,
                        "densidad_detalle_tiros",
                        {
                            grupo_datos:
                                grupoDatos,

                            densidad_id:
                                densidadId,

                            numero_tiro:
                                numeroTiro,

                            cantidad_camarones:
                                cantidadCamarones,

                            creado_por_usuario_id:
                                r.creadoPorUsuarioId ??
                                r.creado_por_usuario_id ??
                                null,

                            creado_por_colaborador_id:
                                r.creadoPorColaboradorId ??
                                r.creado_por_colaborador_id ??
                                creadoPorColaboradorId,
                        }
                    );

                resultado
                    .detalleTirosDensidad
                    .creados
                    .push({
                        idLocal:
                            obtenerIdLocal(r),

                        idServidor:
                            insertado.insertId,
                    });
            }

            if (
                !densidadesCreadas.has(
                    Number(densidadId)
                )
            ) {
                densidadesModificadas.add(
                    Number(densidadId)
                );
            }
        }

        /*
        //////////////////////////////////////////////////////////
        ACTUALIZAR
        //////////////////////////////////////////////////////////
        */

        for (const r of actualizar) {
            const idReal =
                obtenerIdServidor(r);

            const densidadId =
                await obtenerDensidadIdDeDetalle(
                    connection,
                    idReal,
                    grupoDatos
                );

            if (!densidadId) {
                throw new Error(
                    `El tiro ${idReal} no existe en el grupo de datos activo.`
                );
            }

            const cantidadCamarones =
                validarCantidadTiro(
                    r.cantidadCamarones ??
                    r.cantidad_camarones
                );

            const actualizado =
                await actualizarRegistroSync(
                    connection,
                    "densidad_detalle_tiros",
                    {
                        cantidad_camarones:
                            cantidadCamarones,
                    },
                    {
                        id:
                            idReal,

                        activo:
                            true,
                    }
                );

            resultado.detalleTirosDensidad.actualizados +=
                actualizado.affectedRows ?? 0;

            if (
                !densidadesCreadas.has(
                    Number(densidadId)
                )
            ) {
                densidadesModificadas.add(
                    Number(densidadId)
                );
            }
        }

        /*
        //////////////////////////////////////////////////////////
        ELIMINAR
        //////////////////////////////////////////////////////////
        */

        for (const id of eliminar) {
            const idReal =
                typeof id === "object"
                    ? obtenerIdServidor(id)
                    : id;

            const densidadId =
                await obtenerDensidadIdDeDetalle(
                    connection,
                    idReal,
                    grupoDatos
                );

            if (densidadId) {
                await eliminarDetalleDensidad(
                    connection,
                    idReal,
                    grupoDatos
                );

                resultado.detalleTirosDensidad.eliminados++;

                if (
                    !densidadesCreadas.has(
                        Number(densidadId)
                    )
                ) {
                    densidadesModificadas.add(
                        Number(densidadId)
                    );
                }
            }
        }
    }

    /*
    //////////////////////////////////////////////////////////
    RECALCULO DE RESULTADOS
    //////////////////////////////////////////////////////////
    */

    for (const densidadId of densidadesCreadas) {
        if (
            !densidadesEliminadas.has(
                densidadId
            )
        ) {
            await recalcularDensidad(
                connection,
                densidadId,
                grupoDatos,
                false
            );
        }
    }

    for (
        const densidadId
        of densidadesModificadas
    ) {
        if (
            !densidadesCreadas.has(
                densidadId
            ) &&
            !densidadesEliminadas.has(
                densidadId
            )
        ) {
            await recalcularDensidad(
                connection,
                densidadId,
                grupoDatos,
                true
            );
        }
    }

    return resultado;
}