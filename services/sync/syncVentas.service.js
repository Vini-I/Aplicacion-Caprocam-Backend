/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncVentas.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de registros de ventas creados,
actualizados o eliminados desde la aplicacion movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function sincronizarVentas({
  connection,
  cambios,
  grupoDatos,
  creadoPorColaboradorId,
  insertarRegistroSync,
  actualizarRegistroSync,
  eliminarLogicoSync,
  normalizarFecha,
}) {
  const resultado = {
    creados: [],
    actualizados: 0,
    eliminados: 0,
  };

  const {
    crear = [],
    actualizar = [],
    eliminar = [],
  } = cambios;

  for (const r of crear) {
    const insertado = await insertarRegistroSync(
      connection,
      "ventas",
      {
        grupo_datos: grupoDatos,
        finca_id:
          r.fincaId ??
          r.finca_id ??
          r.finca ??
          null,
        estanque_id:
          r.estanqueId ??
          r.estanque_id ??
          r.estanque ??
          null,
        comprador_id:
          r.compradorId ??
          r.comprador_id ??
          r.comprador ??
          null,
        peso_promedio:
          r.pesoPromedio ??
          r.peso_promedio ??
          null,
        cantidad_vendida:
          r.cantidadVendida ??
          r.cantVendida ??
          r.cantidad_vendida ??
          null,
        precio_kilo:
          r.precioKilo ??
          r.precio_kilo ??
          null,
        total:
          r.total ??
          null,
        fecha:
          normalizarFecha(r.fecha),
        creado_por_colaborador_id:
          creadoPorColaboradorId,
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

  for (const r of actualizar) {
    const idReal =
      r.servidor_id ??
      r.servidorId ??
      r.id;

    const actualizado =
      await actualizarRegistroSync(
        connection,
        "ventas",
        {
          finca_id:
            r.fincaId ??
            r.finca_id ??
            r.finca,
          estanque_id:
            r.estanqueId ??
            r.estanque_id ??
            r.estanque,
          comprador_id:
            r.compradorId ??
            r.comprador_id ??
            r.comprador,
          peso_promedio:
            r.pesoPromedio ??
            r.peso_promedio,
          cantidad_vendida:
            r.cantidadVendida ??
            r.cantVendida ??
            r.cantidad_vendida,
          precio_kilo:
            r.precioKilo ??
            r.precio_kilo,
          total:
            r.total,
          fecha:
            normalizarFecha(r.fecha),
        },
        {
          id: idReal,
          grupo_datos: grupoDatos,
        }
      );

    resultado.actualizados +=
      actualizado.affectedRows ?? 0;
  }

  for (const id of eliminar) {
    await eliminarLogicoSync(
      connection,
      "ventas",
      id,
      grupoDatos
    );

    resultado.eliminados++;
  }

  return resultado;
}