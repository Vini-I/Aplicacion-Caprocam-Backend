/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncCrecimiento.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de crecimiento y sus muestreos
desde la aplicacion movil, manteniendo la relacion entre
crecimientos y calculos_crecimiento.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
HELPERS GENERALES
//////////////////////////////////////////////////////////
*/

function crearError(mensaje, status = 422) {
  const error = new Error(mensaje);
  error.status = status;

  return error;
}

function tieneValor(valor) {
  return (
    valor !== undefined &&
    valor !== null &&
    String(valor).trim() !== ""
  );
}

function obtenerValor(
  registro,
  campos,
  valorDefecto = null
) {
  for (const campo of campos) {
    if (
      registro?.[campo] !== undefined &&
      registro?.[campo] !== null
    ) {
      return registro[campo];
    }
  }

  return valorDefecto;
}

/*
//////////////////////////////////////////////////////////
NORMALIZACION
//////////////////////////////////////////////////////////
*/

function construirCrecimiento(
  registro,
  normalizarFecha
) {
  return {
    fincaId: obtenerValor(
      registro,
      [
        "finca",
        "fincaId",
        "finca_id",
      ]
    ),

    estanqueId: obtenerValor(
      registro,
      [
        "estanque",
        "estanqueId",
        "estanque_id",
      ]
    ),

    fechaRegistro:
      normalizarFecha(
        obtenerValor(
          registro,
          [
            "fechaRegistro",
            "fecha_registro",
          ]
        )
      ),

    pesoActual: Number(
      obtenerValor(
        registro,
        [
          "pesoActual",
          "peso_actual",
        ],
        0
      )
    ),
  };
}

function construirCalculo(
  registro,
  crecimientoId
) {
  return {
    crecimientoId,

    cantidadIndividuos:
      obtenerValor(
        registro,
        [
          "cantidad",
          "cantidadIndividuos",
          "cantidad_individuos",
        ],
        null
      ),

    pesoTotal:
      obtenerValor(
        registro,
        [
          "pesoTotal",
          "peso_total",
        ],
        null
      ),

    pesoPromedioIndividual:
      obtenerValor(
        registro,
        [
          "pesoPromedio",
          "pesoPromedioIndividual",
          "peso_promedio_individual",
        ],
        null
      ),
  };
}

/*
//////////////////////////////////////////////////////////
VALIDACIONES
//////////////////////////////////////////////////////////
*/

function validarCrecimiento(datos) {
  if (
    !tieneValor(datos.fincaId) ||
    Number(datos.fincaId) <= 0
  ) {
    throw crearError(
      "La finca es obligatoria y debe ser valida."
    );
  }

  if (
    !tieneValor(datos.estanqueId) ||
    Number(datos.estanqueId) <= 0
  ) {
    throw crearError(
      "El estanque es obligatorio y debe ser valido."
    );
  }

  if (!tieneValor(datos.fechaRegistro)) {
    throw crearError(
      "La fecha de registro es obligatoria."
    );
  }

  const fechaIngresada =
    new Date(datos.fechaRegistro);

  if (
    Number.isNaN(
      fechaIngresada.getTime()
    )
  ) {
    throw crearError(
      "La fecha de registro debe ser valida."
    );
  }

  const ahoraCR =
    new Date(
      new Date().toLocaleString(
        "en-US",
        {
          timeZone:
            "America/Costa_Rica",
        }
      )
    );

  const fechaActualCR =
    new Date(
      Date.UTC(
        ahoraCR.getFullYear(),
        ahoraCR.getMonth(),
        ahoraCR.getDate()
      )
    );

  if (
    fechaIngresada.getTime() >
    fechaActualCR.getTime()
  ) {
    throw crearError(
      "La fecha de registro no puede ser futura."
    );
  }

  if (
    !Number.isFinite(
      Number(datos.pesoActual)
    )
  ) {
    throw crearError(
      "El peso actual debe ser numerico."
    );
  }

  if (
    Number(datos.pesoActual) <= 0
  ) {
    throw crearError(
      "El peso actual debe ser mayor que cero."
    );
  }

  if (
    Number(datos.pesoActual) > 1000
  ) {
    throw crearError(
      "El peso actual no puede ser mayor a 1000 gramos."
    );
  }
}

/*
//////////////////////////////////////////////////////////
CRECIMIENTO
//////////////////////////////////////////////////////////
*/

async function buscarCrecimiento(
  connection,
  id,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT
          id,
          creado_por_usuario_id,
          creado_por_colaborador_id
        FROM crecimientos
        WHERE id = ?
        AND grupo_datos = ?
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

async function actualizarCrecimiento(
  connection,
  id,
  grupoDatos,
  datos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE crecimientos
        SET
          finca_id = ?,
          estanque_id = ?,
          fecha_registro = ?,
          peso_actual = ?
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
      `,
      [
        datos.fincaId,
        datos.estanqueId,
        datos.fechaRegistro,
        datos.pesoActual,
        id,
        grupoDatos,
      ]
    );

  return resultado;
}

async function eliminarCalculosPorCrecimiento(
  connection,
  crecimientoId,
  grupoDatos
) {
  await connection.execute(
    `
      UPDATE calculos_crecimiento
      SET
        deleted_at = CURRENT_TIMESTAMP
      WHERE crecimiento_id = ?
      AND grupo_datos = ?
      AND deleted_at IS NULL
    `,
    [
      crecimientoId,
      grupoDatos,
    ]
  );
}

async function eliminarCrecimiento(
  connection,
  id,
  grupoDatos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE crecimientos
        SET
          deleted_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND grupo_datos = ?
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
CALCULOS DE CRECIMIENTO
//////////////////////////////////////////////////////////
*/

async function validarCrecimientoCalculo(
  connection,
  crecimientoId,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT id
        FROM crecimientos
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
        LIMIT 1
      `,
      [
        crecimientoId,
        grupoDatos,
      ]
    );

  if (filas.length === 0) {
    throw crearError(
      "El crecimiento asociado al muestreo no existe.",
      404
    );
  }
}

async function buscarCalculo(
  connection,
  id,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT id
        FROM calculos_crecimiento
        WHERE id = ?
        AND grupo_datos = ?
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

async function actualizarCalculo(
  connection,
  id,
  grupoDatos,
  datos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE calculos_crecimiento
        SET
          crecimiento_id = ?,
          cantidad_individuos = ?,
          peso_total = ?,
          peso_promedio_individual = ?
        WHERE id = ?
        AND grupo_datos = ?
        AND deleted_at IS NULL
      `,
      [
        datos.crecimientoId,
        datos.cantidadIndividuos,
        datos.pesoTotal,
        datos.pesoPromedioIndividual,
        id,
        grupoDatos,
      ]
    );

  return resultado;
}

async function eliminarCalculo(
  connection,
  id,
  grupoDatos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE calculos_crecimiento
        SET
          activo = FALSE,
          deleted_at = CURRENT_TIMESTAMP
        WHERE id = ?
        AND grupo_datos = ?
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
SINCRONIZACION
//////////////////////////////////////////////////////////
*/

export async function sincronizarCrecimiento({
  connection,
  cambios,
  grupoDatos,
  creadoPorColaboradorId,
  insertarRegistroSync,
  resolverIdForanea,
  normalizarFecha,
}) {
  const resultadoCrecimiento = {
    creados: [],
    actualizados: 0,
    eliminados: 0,
  };

  const resultadoCalculos = {
    creados: [],
    actualizados: 0,
    eliminados: 0,
  };

  const cambiosCrecimiento =
    cambios.crecimiento ?? {};

  const cambiosCalculos =
    cambios.calculosCrecimiento ?? {};

  const {
    crear: crearCrecimientos = [],
    actualizar: actualizarCrecimientos = [],
    eliminar: eliminarCrecimientos = [],
  } = cambiosCrecimiento;

  const {
    crear: crearCalculos = [],
    actualizar: actualizarCalculos = [],
    eliminar: eliminarCalculos = [],
  } = cambiosCalculos;

  /*
  //////////////////////////////////////////////////////////
  CREATE CRECIMIENTO
  //////////////////////////////////////////////////////////
  */

  for (
    const registro
    of crearCrecimientos
  ) {
    const datos =
      construirCrecimiento(
        registro,
        normalizarFecha
      );

    validarCrecimiento(datos);

    const insertado =
      await insertarRegistroSync(
        connection,
        "crecimientos",
        {
          grupo_datos:
            grupoDatos,

          finca_id:
            datos.fincaId,

          estanque_id:
            datos.estanqueId,

          fecha_registro:
            datos.fechaRegistro,

          peso_actual:
            datos.pesoActual,

          creado_por_usuario_id:
            null,

          creado_por_colaborador_id:
            creadoPorColaboradorId,
        }
      );

    resultadoCrecimiento.creados.push({
      idLocal:
        registro.idLocal ??
        registro.id ??
        null,

      idServidor:
        insertado.insertId,
    });
  }

  /*
  //////////////////////////////////////////////////////////
  UPDATE CRECIMIENTO
  //////////////////////////////////////////////////////////
  */

  for (
    const registro
    of actualizarCrecimientos
  ) {
    const idReal =
      registro.servidor_id ??
      registro.servidorId ??
      registro.id;

    const existente =
      await buscarCrecimiento(
        connection,
        idReal,
        grupoDatos
      );

    if (!existente) {
      throw crearError(
        "Registro de crecimiento no encontrado.",
        404
      );
    }

    const datos =
      construirCrecimiento(
        registro,
        normalizarFecha
      );

    validarCrecimiento(datos);

    const actualizado =
      await actualizarCrecimiento(
        connection,
        idReal,
        grupoDatos,
        datos
      );

    resultadoCrecimiento.actualizados +=
      actualizado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  DELETE CRECIMIENTO
  //////////////////////////////////////////////////////////
  */

  for (
    const id
    of eliminarCrecimientos
  ) {
    const existente =
      await buscarCrecimiento(
        connection,
        id,
        grupoDatos
      );

    if (!existente) {
      throw crearError(
        "Registro de crecimiento no encontrado.",
        404
      );
    }

    await eliminarCalculosPorCrecimiento(
      connection,
      id,
      grupoDatos
    );

    const eliminado =
      await eliminarCrecimiento(
        connection,
        id,
        grupoDatos
      );

    resultadoCrecimiento.eliminados +=
      eliminado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  CREATE CALCULOS
  //////////////////////////////////////////////////////////
  */

  for (
    const registro
    of crearCalculos
  ) {
    const crecimientoId =
      resolverIdForanea(
        registro.crecimientoId ??
        registro.crecimiento_id,
        resultadoCrecimiento.creados,
        actualizarCrecimientos
      );

    await validarCrecimientoCalculo(
      connection,
      crecimientoId,
      grupoDatos
    );

    const datos =
      construirCalculo(
        registro,
        crecimientoId
      );

    const insertado =
      await insertarRegistroSync(
        connection,
        "calculos_crecimiento",
        {
          grupo_datos:
            grupoDatos,

          crecimiento_id:
            datos.crecimientoId,

          cantidad_individuos:
            datos.cantidadIndividuos,

          peso_total:
            datos.pesoTotal,

          peso_promedio_individual:
            datos.pesoPromedioIndividual,

          creado_por_usuario_id:
            null,

          creado_por_colaborador_id:
            creadoPorColaboradorId,
        }
      );

    resultadoCalculos.creados.push({
      idLocal:
        registro.idLocal ??
        registro.id ??
        null,

      idServidor:
        insertado.insertId,
    });
  }

  /*
  //////////////////////////////////////////////////////////
  UPDATE CALCULOS
  //////////////////////////////////////////////////////////
  */

  for (
    const registro
    of actualizarCalculos
  ) {
    const idReal =
      registro.servidor_id ??
      registro.servidorId ??
      registro.id;

    const existente =
      await buscarCalculo(
        connection,
        idReal,
        grupoDatos
      );

    if (!existente) {
      throw crearError(
        "Muestreo de crecimiento no encontrado.",
        404
      );
    }

    const crecimientoId =
      resolverIdForanea(
        registro.crecimientoId ??
        registro.crecimiento_id,
        resultadoCrecimiento.creados,
        actualizarCrecimientos
      );

    await validarCrecimientoCalculo(
      connection,
      crecimientoId,
      grupoDatos
    );

    const datos =
      construirCalculo(
        registro,
        crecimientoId
      );

    const actualizado =
      await actualizarCalculo(
        connection,
        idReal,
        grupoDatos,
        datos
      );

    resultadoCalculos.actualizados +=
      actualizado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  DELETE CALCULOS
  //////////////////////////////////////////////////////////
  */

  for (
    const id
    of eliminarCalculos
  ) {
    const eliminado =
      await eliminarCalculo(
        connection,
        id,
        grupoDatos
      );

    resultadoCalculos.eliminados +=
      eliminado.affectedRows ??
      0;
  }

  return {
    crecimiento:
      resultadoCrecimiento,

    calculosCrecimiento:
      resultadoCalculos,
  };
}