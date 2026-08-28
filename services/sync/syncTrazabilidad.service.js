/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncTrazabilidad.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de registros de trazabilidad
creados o eliminados desde la aplicacion movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

async function actualizarEstadoEstanque(
  connection,
  estanqueId,
  estado,
  grupoDatos
) {
  if (
    estanqueId === undefined ||
    estanqueId === null ||
    String(estanqueId).trim() === ""
  ) {
    return;
  }

  const [resultado] = await connection.execute(
    `UPDATE estanques
     SET estado = ?,
         version = version + 1
     WHERE id = ?
     AND grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL`,
    [
      estado,
      estanqueId,
      grupoDatos,
    ]
  );

  if ((resultado.affectedRows ?? 0) === 0) {
    throw new Error(
      `No se pudo actualizar el estado del estanque ${estanqueId}.`
    );
  }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function sincronizarTrazabilidad({
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
    actualizados: 0,
    eliminados: 0,
  };

  const {
    crear = [],
    eliminar = [],
  } = cambios;

  for (const r of crear) {
    const estanqueOrigenId =
      r.estanqueOrigenId ??
      r.estanque_origen_id ??
      null;

    const estanqueDestinoId =
      r.estanqueDestinoId ??
      r.estanque_destino_id ??
      null;

    const insertado = await insertarRegistroSync(
      connection,
      "trazabilidad",
      {
        grupo_datos: grupoDatos,
        finca_id:
          r.fincaId ??
          r.finca_id ??
          null,
        estanque_origen_id:
          estanqueOrigenId,
        estanque_destino_id:
          estanqueDestinoId,
        fecha: normalizarFecha(r.fecha),
        tamano: r.tamano ?? null,
        dias: r.dias ?? null,
        pl: r.pl ?? null,
        tipo_movimiento:
          r.tipoMovimiento ??
          r.tipo_movimiento ??
          null,
        creado_por_colaborador_id:
          r.creadoPorColaboradorId ??
          r.creado_por_colaborador_id ??
          creadoPorColaboradorId,
      }
    );

    await actualizarEstadoEstanque(
      connection,
      estanqueOrigenId,
      "Cosechado",
      grupoDatos
    );

    await actualizarEstadoEstanque(
      connection,
      estanqueDestinoId,
      "Engorde",
      grupoDatos
    );

    resultado.creados.push({
      idLocal:
        r.idLocal ??
        r.id ??
        null,
      idServidor: insertado.insertId,
    });
  }

  for (const id of eliminar) {
    await eliminarLogicoSync(
      connection,
      "trazabilidad",
      id,
      grupoDatos
    );

    resultado.eliminados++;
  }

  return resultado;
}