/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncRaleos.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de registros de raleo creados,
actualizados o eliminados desde la aplicacion movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function sincronizarRaleos({
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
      "raleos",
      {
        grupo_datos: grupoDatos,
        finca_id:
          r.fincaId ??
          r.finca_id ??
          null,
        estanque_id:
          r.estanqueId ??
          r.estanque_id ??
          null,
        siembra_id:
          r.siembraId ??
          r.siembra_id ??
          null,
        fecha:
          normalizarFecha(r.fecha),
        porcentaje:
          r.porcentaje ??
          null,
        kg_retirados:
          r.kgRetirados ??
          r.kg_retirados ??
          null,
        biomasa_restante:
          r.biomasaRestante ??
          r.biomasa_restante ??
          null,
        biomasa_estimada:
          r.biomasaEstimada ??
          r.biomasa_estimada ??
          null,
        observaciones:
          r.observaciones ??
          null,
        creado_por_colaborador_id:
          r.creadoPorColaboradorId ??
          r.creado_por_colaborador_id ??
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
        "raleos",
        {
          finca_id:
            r.fincaId ??
            r.finca_id,
          estanque_id:
            r.estanqueId ??
            r.estanque_id,
          siembra_id:
            r.siembraId ??
            r.siembra_id,
          fecha:
            normalizarFecha(r.fecha),
          porcentaje:
            r.porcentaje,
          kg_retirados:
            r.kgRetirados ??
            r.kg_retirados,
          biomasa_restante:
            r.biomasaRestante ??
            r.biomasa_restante,
          biomasa_estimada:
            r.biomasaEstimada ??
            r.biomasa_estimada,
          observaciones:
            r.observaciones,
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
      "raleos",
      id,
      grupoDatos
    );

    resultado.eliminados++;
  }

  return resultado;
}