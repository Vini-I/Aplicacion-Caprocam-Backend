/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncFisicoQuimica.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de lecturas fisico quimicas
y sus mediciones desde la aplicacion movil.
//////////////////////////////////////////////////////////
*/

import {
  isFechaValida,
  isHoraValida,
  isIdValido,
  isNumeroValido,
} from "../fisicoQuimica.service.js";

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

const TIPOS_MEDICION = [
  "ph",
  "salinidad",
  "temperatura",
  "oxigeno",
];

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

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizarTipoMedicion(valor) {
  const texto = normalizarTexto(valor);

  if (
    texto === "ph" ||
    texto === "p_h"
  ) {
    return "ph";
  }

  if (texto.includes("salinidad")) {
    return "salinidad";
  }

  if (texto.includes("temperatura")) {
    return "temperatura";
  }

  if (texto.includes("oxigeno")) {
    return "oxigeno";
  }

  return texto;
}

function normalizarEtiqueta(valor) {
  if (!tieneValor(valor)) {
    return null;
  }

  return String(valor).trim();
}

/*
//////////////////////////////////////////////////////////
VALIDACIONES
//////////////////////////////////////////////////////////
*/

function validarCabecera({
  fincaId,
  estanqueId,
  fechaRegistro,
}) {
  if (!isIdValido(fincaId)) {
    throw crearError(
      "El fincaId no es valido."
    );
  }

  if (!isIdValido(estanqueId)) {
    throw crearError(
      "El estanqueId no es valido."
    );
  }

  if (!isFechaValida(fechaRegistro)) {
    throw crearError(
      "La fecha no es valida."
    );
  }
}

function validarDetalle({
  tipoMedicion,
  etiqueta,
  valor,
  horaMedicion,
}) {
  if (
    !TIPOS_MEDICION.includes(
      tipoMedicion
    )
  ) {
    throw crearError(
      "El tipo de medicion no es valido."
    );
  }

  if (!tieneValor(etiqueta)) {
    throw crearError(
      "La etiqueta de la medicion es requerida."
    );
  }

  if (!isNumeroValido(valor)) {
    throw crearError(
      "El valor de la medicion no es valido."
    );
  }

  if (
    tipoMedicion === "oxigeno" &&
    !isHoraValida(
      String(horaMedicion ?? "")
    )
  ) {
    throw crearError(
      "Las mediciones de oxigeno requieren una hora valida."
    );
  }

  if (
    tipoMedicion !== "oxigeno" &&
    tieneValor(horaMedicion) &&
    !isHoraValida(
      String(horaMedicion)
    )
  ) {
    throw crearError(
      "La hora de la medicion no es valida."
    );
  }
}

/*
//////////////////////////////////////////////////////////
CABECERA
//////////////////////////////////////////////////////////
*/

async function buscarLecturaPorEstanqueFecha(
  connection,
  estanqueId,
  fechaRegistro,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT
          id,
          activo,
          deleted_at
        FROM fisico_quimico
        WHERE estanque_id = ?
        AND fecha_registro = ?
        AND grupo_datos = ?
        LIMIT 1
        FOR UPDATE
      `,
      [
        estanqueId,
        fechaRegistro,
        grupoDatos,
      ]
    );

  return filas[0] ?? null;
}

async function buscarLecturaPorId(
  connection,
  id,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT
          id,
          activo,
          deleted_at
        FROM fisico_quimico
        WHERE id = ?
        AND grupo_datos = ?
        LIMIT 1
      `,
      [
        id,
        grupoDatos,
      ]
    );

  return filas[0] ?? null;
}

async function actualizarCabecera(
  connection,
  id,
  grupoDatos,
  datos,
  creadoPorColaboradorId
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE fisico_quimico
        SET
          finca_id = ?,
          estanque_id = ?,
          fecha_registro = ?,
          creado_por_usuario_id = NULL,
          creado_por_colaborador_id = ?,
          activo = TRUE,
          deleted_at = NULL,
          version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
      `,
      [
        datos.fincaId,
        datos.estanqueId,
        datos.fechaRegistro,
        creadoPorColaboradorId,
        id,
        grupoDatos,
      ]
    );

  return resultado;
}

async function eliminarCabecera(
  connection,
  id,
  grupoDatos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE fisico_quimico
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

async function eliminarDetallesPorLectura(
  connection,
  lecturaId
) {
  await connection.execute(
    `
      UPDATE fisico_quimico_detalle
      SET
        activo = FALSE,
        deleted_at = CURRENT_TIMESTAMP,
        version = version + 1
      WHERE lectura_id = ?
      AND activo = TRUE
      AND deleted_at IS NULL
    `,
    [
      lecturaId,
    ]
  );
}

/*
//////////////////////////////////////////////////////////
DETALLES
//////////////////////////////////////////////////////////
*/

async function validarLecturaDetalle(
  connection,
  lecturaId,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT id
        FROM fisico_quimico
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1
      `,
      [
        lecturaId,
        grupoDatos,
      ]
    );

  if (filas.length === 0) {
    throw crearError(
      "La lectura fisico quimica asociada no existe.",
      404
    );
  }
}

async function buscarDetallePorClave(
  connection,
  lecturaId,
  tipoMedicion,
  etiqueta
) {
  const [filas] =
    await connection.execute(
      `
        SELECT
          id,
          activo,
          deleted_at
        FROM fisico_quimico_detalle
        WHERE lectura_id = ?
        AND tipo_medicion = ?
        AND etiqueta = ?
        LIMIT 1
      `,
      [
        lecturaId,
        tipoMedicion,
        etiqueta,
      ]
    );

  return filas[0] ?? null;
}

async function buscarDetallePorId(
  connection,
  id,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT detalle.id
        FROM fisico_quimico_detalle detalle
        INNER JOIN fisico_quimico lectura
          ON lectura.id = detalle.lectura_id
        WHERE detalle.id = ?
        AND lectura.grupo_datos = ?
        LIMIT 1
      `,
      [
        id,
        grupoDatos,
      ]
    );

  return filas[0] ?? null;
}

async function actualizarDetalle(
  connection,
  id,
  grupoDatos,
  datos,
  creadoPorColaboradorId
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE fisico_quimico_detalle detalle
        INNER JOIN fisico_quimico lectura
          ON lectura.id = detalle.lectura_id
        SET
          detalle.lectura_id = ?,
          detalle.tipo_medicion = ?,
          detalle.etiqueta = ?,
          detalle.valor = ?,
          detalle.hora_medicion = ?,
          detalle.creado_por_usuario_id = NULL,
          detalle.creado_por_colaborador_id = ?,
          detalle.activo = TRUE,
          detalle.deleted_at = NULL,
          detalle.version = detalle.version + 1
        WHERE detalle.id = ?
        AND lectura.grupo_datos = ?
      `,
      [
        datos.lecturaId,
        datos.tipoMedicion,
        datos.etiqueta,
        datos.valor,
        datos.horaMedicion,
        creadoPorColaboradorId,
        id,
        grupoDatos,
      ]
    );

  return resultado;
}

async function reactivarDetalle(
  connection,
  id,
  datos,
  creadoPorColaboradorId
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE fisico_quimico_detalle
        SET
          valor = ?,
          hora_medicion = ?,
          creado_por_usuario_id = NULL,
          creado_por_colaborador_id = ?,
          activo = TRUE,
          deleted_at = NULL,
          version = version + 1
        WHERE id = ?
      `,
      [
        datos.valor,
        datos.horaMedicion,
        creadoPorColaboradorId,
        id,
      ]
    );

  return resultado;
}

async function eliminarDetalle(
  connection,
  id,
  grupoDatos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE fisico_quimico_detalle detalle
        INNER JOIN fisico_quimico lectura
          ON lectura.id = detalle.lectura_id
        SET
          detalle.activo = FALSE,
          detalle.deleted_at = CURRENT_TIMESTAMP,
          detalle.version = detalle.version + 1
        WHERE detalle.id = ?
        AND lectura.grupo_datos = ?
        AND detalle.activo = TRUE
        AND detalle.deleted_at IS NULL
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
NORMALIZACION DE REGISTROS
//////////////////////////////////////////////////////////
*/

function construirCabecera(
  registro,
  normalizarFecha
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

    fechaRegistro:
      normalizarFecha(
        registro.fechaRegistro ??
        registro.fecha_registro ??
        registro.fecha
      ),
  };
}

function construirDetalle(
  registro,
  lecturaId
) {
  return {
    lecturaId,

    tipoMedicion:
      normalizarTipoMedicion(
        registro.tipoMedicion ??
        registro.tipo_medicion
      ),

    etiqueta:
      normalizarEtiqueta(
        registro.etiqueta
      ),

    valor:
      registro.valor,

    horaMedicion:
      registro.horaMedicion ??
      registro.hora_medicion ??
      null,
  };
}

/*
//////////////////////////////////////////////////////////
SINCRONIZACION
//////////////////////////////////////////////////////////
*/

export async function sincronizarFisicoQuimica({
  connection,
  cambios,
  grupoDatos,
  creadoPorColaboradorId,
  insertarRegistroSync,
  resolverIdForanea,
  normalizarFecha,
}) {
  const resultadoFisicoQuimica = {
    creados: [],
    actualizados: 0,
    eliminados: 0,
  };

  const resultadoDetalleFisicoQuimica = {
    creados: [],
    actualizados: 0,
    eliminados: 0,
  };

  const cambiosCabecera =
    cambios.fisicoQuimica ?? {};

  const cambiosDetalle =
    cambios.detalleFisicoQuimica ?? {};

  const {
    crear: crearCabeceras = [],
    actualizar: actualizarCabeceras = [],
    eliminar: eliminarCabeceras = [],
  } = cambiosCabecera;

  const {
    crear: crearDetalles = [],
    actualizar: actualizarDetalles = [],
    eliminar: eliminarDetalles = [],
  } = cambiosDetalle;

  /*
  //////////////////////////////////////////////////////////
  CREATE CABECERA
  //////////////////////////////////////////////////////////
  */

  for (const registro of crearCabeceras) {
    const datos =
      construirCabecera(
        registro,
        normalizarFecha
      );

    validarCabecera(datos);

    const existente =
      await buscarLecturaPorEstanqueFecha(
        connection,
        datos.estanqueId,
        datos.fechaRegistro,
        grupoDatos
      );

    let idServidor;

    if (existente) {
      idServidor =
        existente.id;

      await connection.execute(
        `
          DELETE FROM fisico_quimico_detalle
          WHERE lectura_id = ?
        `,
        [
          idServidor,
        ]
      );

      if (
        !Boolean(existente.activo) ||
        existente.deleted_at
      ) {
        await connection.execute(
          `
            UPDATE fisico_quimico
            SET
              finca_id = ?,
              creado_por_usuario_id = NULL,
              creado_por_colaborador_id = ?,
              activo = TRUE,
              deleted_at = NULL,
              version = version + 1
            WHERE id = ?
            AND grupo_datos = ?
          `,
          [
            datos.fincaId,
            creadoPorColaboradorId,
            idServidor,
            grupoDatos,
          ]
        );
      }
    } else {
      const insertado =
        await insertarRegistroSync(
          connection,
          "fisico_quimico",
          {
            grupo_datos:
              grupoDatos,

            finca_id:
              datos.fincaId,

            estanque_id:
              datos.estanqueId,

            fecha_registro:
              datos.fechaRegistro,

            creado_por_usuario_id:
              null,

            creado_por_colaborador_id:
              creadoPorColaboradorId,
          }
        );

      idServidor =
        insertado.insertId;
    }

    resultadoFisicoQuimica.creados.push({
      idLocal:
        registro.idLocal ??
        registro.id ??
        null,

      idServidor,
    });
  }

  /*
  //////////////////////////////////////////////////////////
  UPDATE CABECERA
  //////////////////////////////////////////////////////////
  */

  for (const registro of actualizarCabeceras) {
    const idReal =
      registro.servidor_id ??
      registro.servidorId ??
      registro.id;

    const existente =
      await buscarLecturaPorId(
        connection,
        idReal,
        grupoDatos
      );

    if (!existente) {
      throw crearError(
        "Lectura fisico quimica no encontrada.",
        404
      );
    }

    const datos =
      construirCabecera(
        registro,
        normalizarFecha
      );

    validarCabecera(datos);

    const actualizado =
      await actualizarCabecera(
        connection,
        idReal,
        grupoDatos,
        datos,
        creadoPorColaboradorId
      );

    resultadoFisicoQuimica.actualizados +=
      actualizado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  DELETE CABECERA
  //////////////////////////////////////////////////////////
  */

  for (const id of eliminarCabeceras) {
    const existente =
      await buscarLecturaPorId(
        connection,
        id,
        grupoDatos
      );

    if (!existente) {
      throw crearError(
        "Lectura fisico quimica no encontrada.",
        404
      );
    }

    await eliminarDetallesPorLectura(
      connection,
      id
    );

    const eliminado =
      await eliminarCabecera(
        connection,
        id,
        grupoDatos
      );

    resultadoFisicoQuimica.eliminados +=
      eliminado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  CREATE DETALLES
  //////////////////////////////////////////////////////////
  */

  for (const registro of crearDetalles) {
    const lecturaId =
      resolverIdForanea(
        registro.lecturaId ??
        registro.lectura_id,
        resultadoFisicoQuimica.creados,
        actualizarCabeceras
      );

    await validarLecturaDetalle(
      connection,
      lecturaId,
      grupoDatos
    );

    const datos =
      construirDetalle(
        registro,
        lecturaId
      );

    validarDetalle(datos);

    const existente =
      await buscarDetallePorClave(
        connection,
        lecturaId,
        datos.tipoMedicion,
        datos.etiqueta
      );

    let idServidor;

    if (existente) {
      await reactivarDetalle(
        connection,
        existente.id,
        datos,
        creadoPorColaboradorId
      );

      idServidor =
        existente.id;
    } else {
      const insertado =
        await insertarRegistroSync(
          connection,
          "fisico_quimico_detalle",
          {
            lectura_id:
              lecturaId,

            tipo_medicion:
              datos.tipoMedicion,

            etiqueta:
              datos.etiqueta,

            valor:
              Number(datos.valor),

            hora_medicion:
              datos.horaMedicion,

            creado_por_usuario_id:
              null,

            creado_por_colaborador_id:
              creadoPorColaboradorId,
          }
        );

      idServidor =
        insertado.insertId;
    }

    resultadoDetalleFisicoQuimica.creados.push({
      idLocal:
        registro.idLocal ??
        registro.id ??
        null,

      idServidor,
    });
  }

  /*
  //////////////////////////////////////////////////////////
  UPDATE DETALLES
  //////////////////////////////////////////////////////////
  */

  for (const registro of actualizarDetalles) {
    const idReal =
      registro.servidor_id ??
      registro.servidorId ??
      registro.id;

    const existente =
      await buscarDetallePorId(
        connection,
        idReal,
        grupoDatos
      );

    if (!existente) {
      throw crearError(
        "Detalle fisico quimico no encontrado.",
        404
      );
    }

    const lecturaId =
      resolverIdForanea(
        registro.lecturaId ??
        registro.lectura_id,
        resultadoFisicoQuimica.creados,
        actualizarCabeceras
      );

    await validarLecturaDetalle(
      connection,
      lecturaId,
      grupoDatos
    );

    const datos =
      construirDetalle(
        registro,
        lecturaId
      );

    validarDetalle(datos);

    const actualizado =
      await actualizarDetalle(
        connection,
        idReal,
        grupoDatos,
        datos,
        creadoPorColaboradorId
      );

    resultadoDetalleFisicoQuimica.actualizados +=
      actualizado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  DELETE DETALLES
  //////////////////////////////////////////////////////////
  */

  for (const id of eliminarDetalles) {
    const eliminado =
      await eliminarDetalle(
        connection,
        id,
        grupoDatos
      );

    resultadoDetalleFisicoQuimica.eliminados +=
      eliminado.affectedRows ??
      0;
  }

  return {
    fisicoQuimica:
      resultadoFisicoQuimica,

    detalleFisicoQuimica:
      resultadoDetalleFisicoQuimica,
  };
}