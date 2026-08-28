/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncMovimientosInventario.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de movimientos de inventario
y actualiza el stock asociado a cada movimiento.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarTipoMovimientoInventario(valor) {
  const texto = normalizarTexto(valor);

  if (
    texto === "entrada" ||
    texto === "ingreso" ||
    texto === "aumento"
  ) {
    return "Entrada";
  }

  if (
    texto === "salida" ||
    texto === "egreso" ||
    texto === "descuento"
  ) {
    return "Salida";
  }

  if (texto === "ajuste") {
    return "Ajuste";
  }

  return valor ?? null;
}

async function actualizarStockPorMovimiento(
  connection,
  {
    grupoDatos,
    inventarioId,
    tipoMovimiento,
    cantidad,
  }
) {
  if (
    !inventarioId ||
    Number.isNaN(Number(cantidad))
  ) {
    return;
  }

  if (tipoMovimiento === "Entrada") {
    await connection.execute(
      `UPDATE inventario
       SET cantidad = cantidad + ?,
           version = version + 1
       WHERE id = ?
       AND grupo_datos = ?
       AND deleted_at IS NULL`,
      [
        cantidad,
        inventarioId,
        grupoDatos,
      ]
    );
  }

  if (tipoMovimiento === "Salida") {
    await connection.execute(
      `UPDATE inventario
       SET cantidad = cantidad - ?,
           version = version + 1
       WHERE id = ?
       AND grupo_datos = ?
       AND deleted_at IS NULL`,
      [
        cantidad,
        inventarioId,
        grupoDatos,
      ]
    );
  }

  if (tipoMovimiento === "Ajuste") {
    await connection.execute(
      `UPDATE inventario
       SET cantidad = ?,
           version = version + 1
       WHERE id = ?
       AND grupo_datos = ?
       AND deleted_at IS NULL`,
      [
        cantidad,
        inventarioId,
        grupoDatos,
      ]
    );
  }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function sincronizarMovimientosInventario({
  connection,
  cambios,
  grupoDatos,
  creadoPorColaboradorId,
  insertarRegistroSync,
  eliminarLogicoSync,
  normalizarFecha,
}) {
  const resultado = {
    creados: [],
    eliminados: 0,
  };

  const {
    crear = [],
    eliminar = [],
  } = cambios;

  for (const r of crear) {
    const inventarioId =
      r.inventarioId ??
      r.inventario_id ??
      null;

    const productoId =
      r.productoId ??
      r.producto_id ??
      null;

    const tipoMovimiento =
      normalizarTipoMovimientoInventario(
        r.tipoMovimiento ??
        r.tipo_movimiento
      );

    const cantidad =
      Number(r.cantidad ?? 0);

    const insertado =
      await insertarRegistroSync(
        connection,
        "movimientos_inventario",
        {
          grupo_datos:
            grupoDatos,

          inventario_id:
            inventarioId,

          producto_id:
            productoId,

          tipo_movimiento:
            tipoMovimiento,

          cantidad:
            cantidad,

          observacion:
            r.observacion ??
            null,

          fecha_movimiento:
            normalizarFecha(
              r.fechaMovimiento ??
              r.fecha_movimiento
            ) ?? null,

          creado_por_colaborador_id:
            r.creadoPorColaboradorId ??
            r.creado_por_colaborador_id ??
            creadoPorColaboradorId,
        }
      );

    await actualizarStockPorMovimiento(
      connection,
      {
        grupoDatos,
        inventarioId,
        tipoMovimiento,
        cantidad,
      }
    );

    resultado.creados.push({
      idLocal:
        r.idLocal ??
        r.id ??
        null,

      idServidor:
        insertado.insertId,
    });
  }

  for (const id of eliminar) {
    await eliminarLogicoSync(
      connection,
      "movimientos_inventario",
      id,
      grupoDatos
    );

    resultado.eliminados++;
  }

  return resultado;
}