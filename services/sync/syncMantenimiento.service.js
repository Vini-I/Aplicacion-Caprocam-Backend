/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncMantenimiento.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de mantenimientos, tareas y
productos asociados desde la aplicacion movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

async function obtenerEquipo(
  connection,
  equipoId,
  grupoDatos
) {
  if (!equipoId) {
    return null;
  }

  const [filas] = await connection.execute(
    `SELECT id, estado_operativo
     FROM equipos
     WHERE id = ?
     AND grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL
     LIMIT 1`,
    [
      equipoId,
      grupoDatos,
    ]
  );

  return filas.length > 0
    ? filas[0]
    : null;
}

async function actualizarEstadoEquipo(
  connection,
  equipoId,
  estado,
  grupoDatos
) {
  const [resultado] = await connection.execute(
    `UPDATE equipos
     SET estado_operativo = ?,
         version = version + 1
     WHERE id = ?
     AND grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL`,
    [
      estado,
      equipoId,
      grupoDatos,
    ]
  );

  if ((resultado.affectedRows ?? 0) === 0) {
    throw new Error(
      `No se pudo actualizar el estado del equipo ${equipoId}.`
    );
  }
}

async function obtenerPrecioProducto(
  connection,
  productoId,
  grupoDatos
) {
  const [filas] = await connection.execute(
    `SELECT precio_unidad
     FROM productos
     WHERE id = ?
     AND grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL
     LIMIT 1`,
    [
      productoId,
      grupoDatos,
    ]
  );

  if (filas.length === 0) {
    throw new Error(
      `El producto ${productoId} no existe en el grupo de datos activo.`
    );
  }

  return Number(
    filas[0].precio_unidad
  ) || 0;
}

async function obtenerProductoMantenimiento(
  connection,
  id,
  grupoDatos
) {
  const [filas] = await connection.execute(
    `SELECT
        producto.id,
        producto.mantenimiento_equipo_id,
        producto.producto_id,
        producto.cantidad,
        producto.costo_unitario,
        producto.subtotal
     FROM mantenimiento_equipo_productos producto
     INNER JOIN mantenimiento_equipo mantenimiento
     ON mantenimiento.id = producto.mantenimiento_equipo_id
     WHERE producto.id = ?
     AND mantenimiento.grupo_datos = ?
     AND producto.activo = TRUE
     AND producto.deleted_at IS NULL
     AND mantenimiento.activo = TRUE
     AND mantenimiento.deleted_at IS NULL
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

async function recalcularCostosMantenimiento(
  connection,
  mantenimientoId,
  grupoDatos
) {
  await connection.execute(
    `UPDATE mantenimiento_equipo mantenimiento
     SET mantenimiento.costo_productos = (
       SELECT COALESCE(SUM(producto.subtotal), 0)
       FROM mantenimiento_equipo_productos producto
       WHERE producto.mantenimiento_equipo_id = mantenimiento.id
       AND producto.activo = TRUE
       AND producto.deleted_at IS NULL
     ),
     mantenimiento.costo_total_estimado = mantenimiento.costo_mano_obra + (
       SELECT COALESCE(SUM(producto.subtotal), 0)
       FROM mantenimiento_equipo_productos producto
       WHERE producto.mantenimiento_equipo_id = mantenimiento.id
       AND producto.activo = TRUE
       AND producto.deleted_at IS NULL
     ),
     mantenimiento.version = mantenimiento.version + 1
     WHERE mantenimiento.id = ?
     AND mantenimiento.grupo_datos = ?
     AND mantenimiento.activo = TRUE
     AND mantenimiento.deleted_at IS NULL`,
    [
      mantenimientoId,
      grupoDatos,
    ]
  );
}

async function eliminarTareaMantenimiento(
  connection,
  id,
  grupoDatos,
  tablaTieneColumna,
  eliminarLogicoSync
) {
  const tieneGrupoDatos =
    await tablaTieneColumna(
      connection,
      "mantenimiento_equipo_tareas",
      "grupo_datos"
    );

  if (tieneGrupoDatos) {
    return await eliminarLogicoSync(
      connection,
      "mantenimiento_equipo_tareas",
      id,
      grupoDatos
    );
  }

  await connection.execute(
    `UPDATE mantenimiento_equipo_tareas tarea
     INNER JOIN mantenimiento_equipo mantenimiento
     ON mantenimiento.id = tarea.mantenimiento_equipo_id
     SET tarea.activo = FALSE,
         tarea.deleted_at = CURRENT_TIMESTAMP
     WHERE tarea.id = ?
     AND mantenimiento.grupo_datos = ?`,
    [
      id,
      grupoDatos,
    ]
  );
}

async function eliminarProductoMantenimiento(
  connection,
  id,
  grupoDatos,
  tablaTieneColumna,
  eliminarLogicoSync
) {
  const tieneGrupoDatos =
    await tablaTieneColumna(
      connection,
      "mantenimiento_equipo_productos",
      "grupo_datos"
    );

  if (tieneGrupoDatos) {
    return await eliminarLogicoSync(
      connection,
      "mantenimiento_equipo_productos",
      id,
      grupoDatos
    );
  }

  await connection.execute(
    `UPDATE mantenimiento_equipo_productos producto
     INNER JOIN mantenimiento_equipo mantenimiento
     ON mantenimiento.id = producto.mantenimiento_equipo_id
     SET producto.activo = FALSE,
         producto.deleted_at = CURRENT_TIMESTAMP
     WHERE producto.id = ?
     AND mantenimiento.grupo_datos = ?`,
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

export async function sincronizarMantenimiento({
  connection,
  cambios,
  grupoDatos,
  creadoPorColaboradorId,
  insertarRegistroSync,
  actualizarRegistroSync,
  buscarRegistroSync,
  eliminarLogicoSync,
  tablaTieneColumna,
  resolverIdForanea,
  normalizarFecha,
}) {
  const resultado = {};
  const mantenimientosParaRecalcular =
    new Set();

  if (cambios.mantenimientos) {
    resultado.mantenimientos = {
      creados: [],
      actualizados: 0,
      eliminados: 0,
    };

    const {
      crear = [],
      actualizar = [],
      eliminar = [],
    } = cambios.mantenimientos;

    for (const r of crear) {
      const equipoId =
        r.equipoId ??
        r.equipo_id ??
        null;

      const equipo =
        await obtenerEquipo(
          connection,
          equipoId,
          grupoDatos
        );

      if (!equipo) {
        throw new Error(
          `El equipo ${equipoId} no existe en el grupo de datos activo.`
        );
      }

      const codigoTicket =
        r.codigoTicket ??
        r.codigo_ticket ??
        `MOB-${grupoDatos}-${Date.now()}`;

      const existente =
        await buscarRegistroSync(
          connection,
          "mantenimiento_equipo",
          {
            grupo_datos: grupoDatos,
            codigo_ticket: codigoTicket,
          }
        );

      if (existente) {
        resultado.mantenimientos.creados.push({
          idLocal:
            r.idLocal ??
            r.id ??
            null,
          idServidor:
            existente.id,
        });

        continue;
      }

      const costoManoObra =
        Number(
          r.costoManoObra ??
          r.costo_mano_obra ??
          0
        ) || 0;

      const insertado =
        await insertarRegistroSync(
          connection,
          "mantenimiento_equipo",
          {
            grupo_datos: grupoDatos,

            equipo_id:
              equipoId,

            codigo_ticket:
              codigoTicket,

            fecha_mantenimiento:
              normalizarFecha(
                r.fechaMantenimiento ??
                r.fecha_mantenimiento
              ),

            titulo_ticket:
              r.tituloTicket ??
              r.titulo_ticket ??
              null,

            descripcion_ticket:
              r.descripcionTicket ??
              r.descripcion_ticket ??
              null,

            tipo_personal:
              r.tipoPersonal ??
              r.tipo_personal ??
              null,

            costo_mano_obra:
              costoManoObra,

            costo_productos:
              0,

            costo_total_estimado:
              costoManoObra,

            estado_ticket:
              r.estadoTicket ??
              r.estado_ticket ??
              "En espera",

            creado_por_colaborador_id:
              r.creadoPorColaboradorId ??
              r.creado_por_colaborador_id ??
              creadoPorColaboradorId,
          }
        );

      resultado.mantenimientos.creados.push({
        idLocal:
          r.idLocal ??
          r.id ??
          null,

        idServidor:
          insertado.insertId,
      });
    }

    for (const r of actualizar) {
      const idReal =
        r.servidor_id ??
        r.servidorId ??
        r.id;

      const equipoId =
        r.equipoId ??
        r.equipo_id;

      const equipo =
        await obtenerEquipo(
          connection,
          equipoId,
          grupoDatos
        );

      if (!equipo) {
        throw new Error(
          `El equipo ${equipoId} no existe en el grupo de datos activo.`
        );
      }

      const estadoTicket =
        r.estadoTicket ??
        r.estado_ticket;

      const nuevoEstadoEquipo =
        r.estadoEquipo ??
        r.estadoOperativo ??
        r.estado_operativo ??
        equipo.estado_operativo;

      if (
        estadoTicket === "Terminado" &&
        nuevoEstadoEquipo === "Mantenimiento"
      ) {
        throw new Error(
          'No se puede finalizar el ticket mientras el equipo continue en estado "Mantenimiento".'
        );
      }

      // Consultar estado anterior antes de actualizar
      const [filasTicket] = await connection.execute(
        `SELECT estado_ticket, codigo_ticket
         FROM mantenimiento_equipo
         WHERE id = ?
         AND grupo_datos = ?
         AND activo = TRUE
         AND deleted_at IS NULL
         LIMIT 1`,
        [idReal, grupoDatos]
      );
      const estadoAnterior = filasTicket[0]?.estado_ticket;
      const codigoTicket = filasTicket[0]?.codigo_ticket;

      const actualizado =
        await actualizarRegistroSync(
          connection,
          "mantenimiento_equipo",
          {
            equipo_id:
              equipoId,

            fecha_mantenimiento:
              normalizarFecha(
                r.fechaMantenimiento ??
                r.fecha_mantenimiento
              ),

            titulo_ticket:
              r.tituloTicket ??
              r.titulo_ticket,

            descripcion_ticket:
              r.descripcionTicket ??
              r.descripcion_ticket,

            tipo_personal:
              r.tipoPersonal ??
              r.tipo_personal,

            costo_mano_obra:
              r.costoManoObra ??
              r.costo_mano_obra,

            estado_ticket:
              estadoTicket,
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

      resultado.mantenimientos.actualizados +=
        actualizado.affectedRows ?? 0;

      // Si pasa a Terminado y antes no lo estaba: descontar stock
      if (
        estadoTicket === "Terminado" &&
        estadoAnterior &&
        estadoAnterior !== "Terminado"
      ) {
        const [prods] = await connection.execute(
          `SELECT producto_id, cantidad
           FROM mantenimiento_equipo_productos
           WHERE mantenimiento_equipo_id = ?
           AND grupo_datos = ?
           AND activo = TRUE
           AND deleted_at IS NULL`,
          [idReal, grupoDatos]
        );

        for (const p of prods) {
          const [invRows] = await connection.execute(
            `SELECT id
             FROM inventario
             WHERE producto_id = ?
             AND grupo_datos = ?
             AND activo = TRUE
             AND deleted_at IS NULL
             LIMIT 1`,
            [p.producto_id, grupoDatos]
          );

          if (invRows.length > 0) {
            await connection.execute(
              `UPDATE inventario
               SET cantidad = cantidad - ?,
                   version = version + 1
               WHERE id = ?
               AND grupo_datos = ?
               AND deleted_at IS NULL`,
              [p.cantidad, invRows[0].id, grupoDatos]
            );

            await insertarRegistroSync(
              connection,
              "movimientos_inventario",
              {
                grupo_datos: grupoDatos,
                inventario_id: invRows[0].id,
                producto_id: p.producto_id,
                tipo_movimiento: "Salida",
                cantidad: p.cantidad,
                observacion: `Salida automatica por sincronizacion de mantenimiento #${codigoTicket ?? idReal}.`,
                creado_por_colaborador_id: creadoPorColaboradorId,
              }
            );
          }
        }
      }

      // Si cambia de Terminado a otro estado: revertir stock (Entrada)
      if (
        estadoAnterior === "Terminado" &&
        estadoTicket &&
        estadoTicket !== "Terminado"
      ) {
        const [prods] = await connection.execute(
          `SELECT producto_id, cantidad
           FROM mantenimiento_equipo_productos
           WHERE mantenimiento_equipo_id = ?
           AND grupo_datos = ?
           AND activo = TRUE
           AND deleted_at IS NULL`,
          [idReal, grupoDatos]
        );

        for (const p of prods) {
          const [invRows] = await connection.execute(
            `SELECT id
             FROM inventario
             WHERE producto_id = ?
             AND grupo_datos = ?
             AND activo = TRUE
             AND deleted_at IS NULL
             LIMIT 1`,
            [p.producto_id, grupoDatos]
          );

          if (invRows.length > 0) {
            await connection.execute(
              `UPDATE inventario
               SET cantidad = cantidad + ?,
                   version = version + 1
               WHERE id = ?
               AND grupo_datos = ?
               AND deleted_at IS NULL`,
              [p.cantidad, invRows[0].id, grupoDatos]
            );

            await insertarRegistroSync(
              connection,
              "movimientos_inventario",
              {
                grupo_datos: grupoDatos,
                inventario_id: invRows[0].id,
                producto_id: p.producto_id,
                tipo_movimiento: "Entrada",
                cantidad: p.cantidad,
                observacion: `Reversion automatica de stock por sincronizacion de mantenimiento #${codigoTicket ?? idReal}.`,
                creado_por_colaborador_id: creadoPorColaboradorId,
              }
            );
          }
        }
      }

      if (
        nuevoEstadoEquipo !==
        equipo.estado_operativo
      ) {
        await actualizarEstadoEquipo(
          connection,
          equipoId,
          nuevoEstadoEquipo,
          grupoDatos
        );
      }

      mantenimientosParaRecalcular.add(
        idReal
      );
    }

    for (const id of eliminar) {
      await eliminarLogicoSync(
        connection,
        "mantenimiento_equipo",
        id,
        grupoDatos
      );

      resultado.mantenimientos.eliminados++;
    }
  }

  if (cambios.tareasMantenimiento) {
    resultado.tareasMantenimiento = {
      creados: [],
      actualizados: 0,
      eliminados: 0,
    };

    const {
      crear = [],
      actualizar = [],
      eliminar = [],
    } = cambios.tareasMantenimiento;

    for (const r of crear) {
      const mantenimientoId =
        resolverIdForanea(
          r.mantenimientoId ??
          r.mantenimiento_id ??
          r.mantenimiento_equipo_id,

          resultado.mantenimientos?.creados,

          cambios.mantenimientos?.actualizar
        );

      const tareaId =
        r.tareaId ??
        r.tarea_id ??
        null;

      const existente =
        await buscarRegistroSync(
          connection,
          "mantenimiento_equipo_tareas",
          {
            grupo_datos:
              grupoDatos,

            mantenimiento_equipo_id:
              mantenimientoId,

            tarea_id:
              tareaId,
          }
        );

      if (existente) {
        resultado.tareasMantenimiento.creados.push({
          idLocal:
            r.idLocal ??
            r.id ??
            null,

          idServidor:
            existente.id,
        });

        continue;
      }

      const insertado =
        await insertarRegistroSync(
          connection,
          "mantenimiento_equipo_tareas",
          {
            grupo_datos:
              grupoDatos,

            mantenimiento_equipo_id:
              mantenimientoId,

            tarea_id:
              tareaId,

            estado_tarea:
              r.estadoTarea ??
              r.estado_tarea ??
              "Pendiente",

            creado_por_colaborador_id:
              r.creadoPorColaboradorId ??
              r.creado_por_colaborador_id ??
              creadoPorColaboradorId,
          }
        );

      resultado.tareasMantenimiento.creados.push({
        idLocal:
          r.idLocal ??
          r.id ??
          null,

        idServidor:
          insertado.insertId,
      });
    }

    for (const r of actualizar) {
      const idReal =
        r.servidor_id ??
        r.servidorId ??
        r.id;

      const actualizado =
        await actualizarRegistroSync(
          connection,
          "mantenimiento_equipo_tareas",
          {
            estado_tarea:
              r.estadoTarea ??
              r.estado_tarea,
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

      resultado.tareasMantenimiento.actualizados +=
        actualizado.affectedRows ?? 0;
    }

    for (const id of eliminar) {
      await eliminarTareaMantenimiento(
        connection,
        id,
        grupoDatos,
        tablaTieneColumna,
        eliminarLogicoSync
      );

      resultado.tareasMantenimiento.eliminados++;
    }
  }

  if (cambios.productosMantenimiento) {
    resultado.productosMantenimiento = {
      creados: [],
      actualizados: 0,
      eliminados: 0,
    };

    const {
      crear = [],
      actualizar = [],
      eliminar = [],
    } = cambios.productosMantenimiento;

    for (const r of crear) {
      const mantenimientoId =
        resolverIdForanea(
          r.mantenimientoId ??
          r.mantenimiento_id ??
          r.mantenimiento_equipo_id,

          resultado.mantenimientos?.creados,

          cambios.mantenimientos?.actualizar
        );

      const productoId =
        r.productoId ??
        r.producto_id ??
        null;

      const cantidad =
        Number(r.cantidad);

      if (
        Number.isNaN(cantidad) ||
        cantidad <= 0
      ) {
        throw new Error(
          "La cantidad del producto de mantenimiento debe ser mayor a 0."
        );
      }

      const costoRecibido =
        r.costoUnitario ??
        r.costo_unitario;

      let costoUnitario =
        Number(costoRecibido);

      if (
        costoRecibido === undefined ||
        costoRecibido === null ||
        Number.isNaN(costoUnitario)
      ) {
        costoUnitario =
          await obtenerPrecioProducto(
            connection,
            productoId,
            grupoDatos
          );
      }

      const subtotalRecibido =
        r.subtotal;

      let subtotal =
        Number(subtotalRecibido);

      if (
        subtotalRecibido === undefined ||
        subtotalRecibido === null ||
        Number.isNaN(subtotal)
      ) {
        subtotal =
          cantidad * costoUnitario;
      }

      const insertado =
        await insertarRegistroSync(
          connection,
          "mantenimiento_equipo_productos",
          {
            grupo_datos:
              grupoDatos,

            mantenimiento_equipo_id:
              mantenimientoId,

            producto_id:
              productoId,

            cantidad:
              cantidad,

            costo_unitario:
              costoUnitario,

            subtotal:
              subtotal,

            creado_por_colaborador_id:
              r.creadoPorColaboradorId ??
              r.creado_por_colaborador_id ??
              creadoPorColaboradorId,
          }
        );

      resultado.productosMantenimiento.creados.push({
        idLocal:
          r.idLocal ??
          r.id ??
          null,

        idServidor:
          insertado.insertId,
      });

      mantenimientosParaRecalcular.add(
        mantenimientoId
      );
    }

    for (const r of actualizar) {
      const idReal =
        r.servidor_id ??
        r.servidorId ??
        r.id;

      const existente =
        await obtenerProductoMantenimiento(
          connection,
          idReal,
          grupoDatos
        );

      if (!existente) {
        throw new Error(
          `El producto de mantenimiento ${idReal} no existe.`
        );
      }

      const cantidad =
        Number(r.cantidad);

      if (
        Number.isNaN(cantidad) ||
        cantidad <= 0
      ) {
        throw new Error(
          "La cantidad del producto de mantenimiento debe ser mayor a 0."
        );
      }

      const costoRecibido =
        r.costoUnitario ??
        r.costo_unitario;

      let costoUnitario;

      if (
        costoRecibido !== undefined &&
        costoRecibido !== null
      ) {
        costoUnitario =
          Number(costoRecibido);
      } else {
        costoUnitario =
          Number(
            existente.costo_unitario
          );
      }

      if (Number.isNaN(costoUnitario)) {
        costoUnitario =
          Number(
            existente.costo_unitario
          ) || 0;
      }

      const subtotalRecibido =
        r.subtotal;

      let subtotal =
        Number(subtotalRecibido);

      if (
        subtotalRecibido === undefined ||
        subtotalRecibido === null ||
        Number.isNaN(subtotal)
      ) {
        subtotal =
          cantidad * costoUnitario;
      }

      const actualizado =
        await actualizarRegistroSync(
          connection,
          "mantenimiento_equipo_productos",
          {
            cantidad:
              cantidad,

            costo_unitario:
              costoUnitario,

            subtotal:
              subtotal,
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

      resultado.productosMantenimiento.actualizados +=
        actualizado.affectedRows ?? 0;

      mantenimientosParaRecalcular.add(
        existente.mantenimiento_equipo_id
      );
    }

    for (const id of eliminar) {
      const existente =
        await obtenerProductoMantenimiento(
          connection,
          id,
          grupoDatos
        );

      if (!existente) {
        continue;
      }

      await eliminarProductoMantenimiento(
        connection,
        id,
        grupoDatos,
        tablaTieneColumna,
        eliminarLogicoSync
      );

      mantenimientosParaRecalcular.add(
        existente.mantenimiento_equipo_id
      );

      resultado.productosMantenimiento.eliminados++;
    }
  }

  for (
    const mantenimientoId
    of mantenimientosParaRecalcular
  ) {
    await recalcularCostosMantenimiento(
      connection,
      mantenimientoId,
      grupoDatos
    );
  }

  return resultado;
}