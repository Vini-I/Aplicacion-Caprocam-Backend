/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncEnfermedades.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de registros de enfermedades
creados, actualizados o eliminados desde la aplicacion movil,
respetando las reglas del modulo normal de Enfermedades.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import {
  normalizarDatosEnfermedad,
  validarDatosEnfermedad,
} from "../enfermedades.service.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function crearErrorValidacion(
  mensaje,
  detalles = null
) {
  const error = new Error(mensaje);

  error.status = 422;
  error.detalles = detalles;

  return error;
}

function construirEntradaEnfermedad(
  registro,
  normalizarFecha,
  responsable
) {
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

    fechaReporte:
      normalizarFecha(
        registro.fechaReporte ??
        registro.fecha_reporte
      ),

    responsable,

    enfermedad:
      registro.enfermedad,

    severidad:
      registro.severidad,

    reporte:
      registro.reporte ??
      null,
  };
}

async function obtenerResponsableColaborador(
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

  const nombre =
    String(
      filas[0].nombre ??
      ""
    ).trim();

  const apellidos =
    String(
      filas[0].apellidos ??
      ""
    ).trim();

  const responsable =
    `${nombre} ${apellidos}`.trim();

  return responsable || null;
}

async function validarRelacionFincaEstanque(
  connection,
  fincaId,
  estanqueId,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT
          estanques.id
        FROM estanques
        INNER JOIN fincas
          ON fincas.id =
             estanques.finca_id
        WHERE fincas.id = ?
        AND estanques.id = ?
        AND fincas.grupo_datos = ?
        AND estanques.grupo_datos = ?
        AND fincas.activo = TRUE
        AND estanques.activo = TRUE
        AND fincas.deleted_at IS NULL
        AND estanques.deleted_at IS NULL
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
    const error = new Error(
      "La finca o el estanque no existe, no pertenece al grupo de datos o no existe relacion entre ambos."
    );

    error.status = 404;

    throw error;
  }
}

async function obtenerEnfermedadActual(
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
        FROM enfermedades
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

  return filas.length > 0
    ? filas[0]
    : null;
}

function normalizarYValidarEnfermedad(
  registro,
  grupoDatos,
  normalizarFecha,
  responsable
) {
  const entrada =
    construirEntradaEnfermedad(
      registro,
      normalizarFecha,
      responsable
    );

  const datos =
    normalizarDatosEnfermedad(
      entrada,
      grupoDatos
    );

  const errores =
    validarDatosEnfermedad(
      datos
    );

  if (errores.length > 0) {
    throw crearErrorValidacion(
      "Datos invalidos para la enfermedad.",
      errores
    );
  }

  return datos;
}

async function actualizarEnfermedad(
  connection,
  id,
  grupoDatos,
  datos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE enfermedades
        SET
          finca_id = ?,
          estanque_id = ?,
          fecha_reporte = ?,
          enfermedad = ?,
          severidad = ?,
          reporte = ?,
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
        datos.enfermedad,
        datos.severidad,
        datos.reporte,
        id,
        grupoDatos,
      ]
    );

  return resultado;
}

async function eliminarEnfermedad(
  connection,
  id,
  grupoDatos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE enfermedades
        SET
          activo = FALSE,
          deleted_at =
            CURRENT_TIMESTAMP,
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

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function sincronizarEnfermedades({
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
    actualizar = [],
    eliminar = [],
  } = cambios;

  const responsableColaborador =
    await obtenerResponsableColaborador(
      connection,
      creadoPorColaboradorId,
      grupoDatos
    );

  for (const r of crear) {
    const datos =
      normalizarYValidarEnfermedad(
        r,
        grupoDatos,
        normalizarFecha,
        responsableColaborador
      );

    await validarRelacionFincaEstanque(
      connection,
      datos.fincaId,
      datos.estanqueId,
      grupoDatos
    );

    const insertado =
      await insertarRegistroSync(
        connection,
        "enfermedades",
        {
          grupo_datos:
            grupoDatos,

          finca_id:
            datos.fincaId,

          estanque_id:
            datos.estanqueId,

          tipo_registro:
            "enfermedad",

          fecha_reporte:
            datos.fechaReporte,

          responsable:
            datos.responsable,

          enfermedad:
            datos.enfermedad,

          severidad:
            datos.severidad,

          reporte:
            datos.reporte,

          creado_por_usuario_id:
            null,

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

    const actual =
      await obtenerEnfermedadActual(
        connection,
        idReal,
        grupoDatos
      );

    if (!actual) {
      const error = new Error(
        "Enfermedad no encontrada."
      );

      error.status = 404;

      throw error;
    }

    const datos =
      normalizarYValidarEnfermedad(
        r,
        grupoDatos,
        normalizarFecha,
        actual.responsable
      );

    await validarRelacionFincaEstanque(
      connection,
      datos.fincaId,
      datos.estanqueId,
      grupoDatos
    );

    const actualizado =
      await actualizarEnfermedad(
        connection,
        idReal,
        grupoDatos,
        datos
      );

    resultado.actualizados +=
      actualizado.affectedRows ??
      0;
  }

  for (const id of eliminar) {
    const eliminado =
      await eliminarEnfermedad(
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