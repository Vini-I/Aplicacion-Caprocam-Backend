/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncAlimentacion.service.js
Autor: Gerald Andres Alfaro Solorzano
Fecha: 27/08/2026
Modulo: Sincronizacion
Descripcion:
Gestiona la sincronizacion de registros de alimentacion
creados, actualizados o eliminados desde la aplicacion movil,
respetando las reglas del modulo normal de Alimentacion.
//////////////////////////////////////////////////////////
*/

import {
  isEmpty,
  isNumeroMayorCero,
  isNumeroOpcionalMayorIgualCero,
  isFechaValida,
  isMetodoAlimentacion,
  isHoraAlimentacion,
  maxLength,
} from "../alimentacion.service.js";

import {
  MetodoAlimentacion,
  HoraAlimentacion,
} from "../../dtos/alimentacion.dto.js";

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

function obtenerValor(registro, campos, valorDefecto = null) {
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

function normalizarNumeroOpcional(valor) {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null;
  }

  return Number(valor);
}

function normalizarTextoOpcional(valor) {
  if (
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ""
  ) {
    return null;
  }

  return String(valor).trim();
}

/*
//////////////////////////////////////////////////////////
DATOS DE ALIMENTACION
//////////////////////////////////////////////////////////
*/

function construirDatosAlimentacion(
  registro,
  normalizarFecha
) {
  return {
    idFinca: obtenerValor(
      registro,
      [
        "idFinca",
        "fincaId",
        "finca",
        "finca_id",
      ]
    ),

    idEstanque: obtenerValor(
      registro,
      [
        "idEstanque",
        "estanqueId",
        "estanque",
        "estanque_id",
      ]
    ),

    idProveedor: normalizarNumeroOpcional(
      obtenerValor(
        registro,
        [
          "idProveedor",
          "proveedorId",
          "proveedor_id",
        ]
      )
    ),

    idProducto: normalizarNumeroOpcional(
      obtenerValor(
        registro,
        [
          "idProducto",
          "productoId",
          "producto_id",
        ]
      )
    ),

    fecha: normalizarFecha(
      obtenerValor(
        registro,
        ["fecha"]
      )
    ),

    hora: normalizarTextoOpcional(
      obtenerValor(
        registro,
        ["hora"]
      )
    ),

    metodo: normalizarTextoOpcional(
      obtenerValor(
        registro,
        ["metodo"]
      )
    ),

    cantidadKg: Number(
      obtenerValor(
        registro,
        [
          "cantidadKg",
          "cantidad_kg",
        ],
        0
      )
    ),

    presentacion: normalizarTextoOpcional(
      obtenerValor(
        registro,
        ["presentacion"]
      )
    ),

    proveedor: normalizarTextoOpcional(
      obtenerValor(
        registro,
        ["proveedor"]
      )
    ),

    tipoAlimento: normalizarTextoOpcional(
      obtenerValor(
        registro,
        [
          "tipoAlimento",
          "tipo_alimento",
        ]
      )
    ),

    observaciones: normalizarTextoOpcional(
      obtenerValor(
        registro,
        ["observaciones"]
      )
    ),
  };
}

/*
//////////////////////////////////////////////////////////
VALIDACIONES
//////////////////////////////////////////////////////////
*/

function validarDatosAlimentacion(datos) {
  const errores = [];

  if (isEmpty(datos.idFinca)) {
    errores.push(
      "El campo idFinca es requerido."
    );
  } else if (
    !isNumeroMayorCero(datos.idFinca)
  ) {
    errores.push(
      "El campo idFinca debe ser numerico y mayor que cero."
    );
  }

  if (isEmpty(datos.idEstanque)) {
    errores.push(
      "El campo idEstanque es requerido."
    );
  } else if (
    !isNumeroMayorCero(datos.idEstanque)
  ) {
    errores.push(
      "El campo idEstanque debe ser numerico y mayor que cero."
    );
  }

  if (isEmpty(datos.fecha)) {
    errores.push(
      "El campo fecha es requerido."
    );
  } else if (
    !isFechaValida(datos.fecha)
  ) {
    errores.push(
      "El campo fecha no es una fecha valida."
    );
  }

  if (isEmpty(datos.cantidadKg)) {
    errores.push(
      "El campo cantidadKg es requerido."
    );
  } else if (
    !isNumeroMayorCero(datos.cantidadKg)
  ) {
    errores.push(
      "El campo cantidadKg debe ser numerico y mayor que cero."
    );
  }

  if (isEmpty(datos.hora)) {
    errores.push(
      "El campo hora es requerido."
    );
  } else if (
    !isHoraAlimentacion(datos.hora)
  ) {
    errores.push(
      "Hora invalida. Opciones: " +
      Object.values(
        HoraAlimentacion
      ).join(", ")
    );
  }

  if (isEmpty(datos.metodo)) {
    errores.push(
      "El campo metodo es requerido."
    );
  } else if (
    !isMetodoAlimentacion(datos.metodo)
  ) {
    errores.push(
      "Metodo invalido. Opciones: " +
      Object.values(
        MetodoAlimentacion
      ).join(", ")
    );
  }

  if (
    !isNumeroOpcionalMayorIgualCero(
      datos.idProveedor
    )
  ) {
    errores.push(
      "El campo idProveedor debe ser numerico y mayor o igual que cero."
    );
  }

  if (
    !isNumeroOpcionalMayorIgualCero(
      datos.idProducto
    )
  ) {
    errores.push(
      "El campo idProducto debe ser numerico y mayor o igual que cero."
    );
  }

  if (
    !maxLength(
      datos.observaciones,
      1000
    )
  ) {
    errores.push(
      "El campo observaciones no puede superar los 1000 caracteres."
    );
  }

  if (errores.length > 0) {
    throw crearError(
      `Datos invalidos para el registro de alimentacion: ${errores.join(" ")}`
    );
  }
}

/*
//////////////////////////////////////////////////////////
CONSULTAS
//////////////////////////////////////////////////////////
*/

async function buscarAlimentacion(
  connection,
  id,
  grupoDatos
) {
  const [filas] =
    await connection.execute(
      `
        SELECT
          id,
          producto_id,
          cantidad_kg
        FROM alimentaciones
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

async function buscarDuplicado(
  connection,
  {
    fecha,
    hora,
    idEstanque,
    grupoDatos,
    idIgnorado = null,
  }
) {
  let sql = `
    SELECT id
    FROM alimentaciones
    WHERE fecha = ?
    AND estanque_id = ?
    AND grupo_datos = ?
    AND activo = TRUE
    AND deleted_at IS NULL
  `;

  const parametros = [
    fecha,
    idEstanque,
    grupoDatos,
  ];

  if (hora != null) {
    sql += " AND hora = ?";
    parametros.push(hora);
  }

  if (idIgnorado != null) {
    sql += " AND id <> ?";
    parametros.push(idIgnorado);
  }

  sql += " LIMIT 1";

  const [filas] =
    await connection.execute(
      sql,
      parametros
    );

  return filas[0] ?? null;
}

/*
//////////////////////////////////////////////////////////
INVENTARIO
//////////////////////////////////////////////////////////
*/

async function registrarMovimientoInventario(
  connection,
  {
    grupoDatos,
    productoId,
    tipoMovimiento,
    cantidad,
    observacion,
    creadoPorColaboradorId,
  }
) {
  const cantidadMovimiento =
    Number(cantidad);

  if (
    Number.isNaN(cantidadMovimiento) ||
    cantidadMovimiento <= 0
  ) {
    throw crearError(
      "La cantidad del movimiento de inventario debe ser mayor que cero."
    );
  }

  const [filas] =
    await connection.execute(
      `
        SELECT
          id,
          cantidad
        FROM inventario
        WHERE producto_id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
        LIMIT 1
        FOR UPDATE
      `,
      [
        productoId,
        grupoDatos,
      ]
    );

  if (filas.length === 0) {
    throw crearError(
      "No existe un registro de inventario activo para el producto seleccionado."
    );
  }

  const inventario = filas[0];
  const cantidadActual =
    Number(inventario.cantidad);

  let cantidadNueva;

  if (tipoMovimiento === "Entrada") {
    cantidadNueva =
      cantidadActual +
      cantidadMovimiento;
  } else if (
    tipoMovimiento === "Salida"
  ) {
    cantidadNueva =
      cantidadActual -
      cantidadMovimiento;

    if (cantidadNueva < 0) {
      throw crearError(
        `No hay suficiente stock. Disponible: ${cantidadActual}, requerido: ${cantidadMovimiento}.`,
        409
      );
    }
  } else if (
    tipoMovimiento === "Ajuste"
  ) {
    cantidadNueva =
      cantidadMovimiento;
  } else {
    throw crearError(
      `Tipo de movimiento de inventario invalido: ${tipoMovimiento}`
    );
  }

  await connection.execute(
    `
      UPDATE inventario
      SET
        cantidad = ?,
        version = version + 1
      WHERE id = ?
    `,
    [
      cantidadNueva,
      inventario.id,
    ]
  );

  await connection.execute(
    `
      INSERT INTO movimientos_inventario (
        grupo_datos,
        inventario_id,
        producto_id,
        tipo_movimiento,
        cantidad,
        observacion,
        creado_por_usuario_id,
        creado_por_colaborador_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      grupoDatos,
      inventario.id,
      productoId,
      tipoMovimiento,
      cantidadMovimiento,
      observacion ?? null,
      null,
      creadoPorColaboradorId,
    ]
  );

  return {
    inventarioId:
      inventario.id,

    cantidadAnterior:
      cantidadActual,

    cantidadNueva,
  };
}

/*
//////////////////////////////////////////////////////////
ACTUALIZAR
//////////////////////////////////////////////////////////
*/

async function actualizarAlimentacion(
  connection,
  id,
  grupoDatos,
  datos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE alimentaciones
        SET
          grupo_datos = ?,
          finca_id = ?,
          estanque_id = ?,
          proveedor_id = ?,
          producto_id = ?,
          fecha = ?,
          hora = ?,
          metodo = ?,
          cantidad_kg = ?,
          presentacion = ?,
          proveedor = ?,
          tipo_alimento = ?,
          observaciones = ?,
          version = version + 1
        WHERE id = ?
        AND grupo_datos = ?
        AND activo = TRUE
        AND deleted_at IS NULL
      `,
      [
        grupoDatos,
        datos.idFinca,
        datos.idEstanque,
        datos.idProveedor,
        datos.idProducto,
        datos.fecha,
        datos.hora,
        datos.metodo,
        datos.cantidadKg,
        datos.presentacion,
        datos.proveedor,
        datos.tipoAlimento,
        datos.observaciones,
        id,
        grupoDatos,
      ]
    );

  return resultado;
}

/*
//////////////////////////////////////////////////////////
ELIMINAR
//////////////////////////////////////////////////////////
*/

async function eliminarAlimentacion(
  connection,
  id,
  grupoDatos
) {
  const [resultado] =
    await connection.execute(
      `
        UPDATE alimentaciones
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

/*
//////////////////////////////////////////////////////////
SINCRONIZACION
//////////////////////////////////////////////////////////
*/

export async function sincronizarAlimentacion({
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

  /*
  //////////////////////////////////////////////////////////
  CREATE
  //////////////////////////////////////////////////////////
  */

  for (const registro of crear) {
    const datos =
      construirDatosAlimentacion(
        registro,
        normalizarFecha
      );

    validarDatosAlimentacion(datos);

    const duplicado =
      await buscarDuplicado(
        connection,
        {
          fecha:
            datos.fecha,

          hora:
            datos.hora,

          idEstanque:
            datos.idEstanque,

          grupoDatos,
        }
      );

    if (duplicado) {
      throw crearError(
        "Ya existe un registro de alimentacion para ese estanque en esa fecha y hora.",
        409
      );
    }

    if (
      datos.idProducto != null &&
      Number(datos.idProducto) > 0
    ) {
      await registrarMovimientoInventario(
        connection,
        {
          grupoDatos,

          productoId:
            datos.idProducto,

          tipoMovimiento:
            "Salida",

          cantidad:
            datos.cantidadKg,

          observacion:
            `Salida automatica por registro de alimentacion ` +
            `(finca ${datos.idFinca}, estanque ${datos.idEstanque}, ` +
            `fecha ${datos.fecha}).`,

          creadoPorColaboradorId,
        }
      );
    }

    const insertado =
      await insertarRegistroSync(
        connection,
        "alimentaciones",
        {
          grupo_datos:
            grupoDatos,

          finca_id:
            datos.idFinca,

          estanque_id:
            datos.idEstanque,

          proveedor_id:
            datos.idProveedor,

          producto_id:
            datos.idProducto,

          fecha:
            datos.fecha,

          hora:
            datos.hora,

          metodo:
            datos.metodo,

          cantidad_kg:
            datos.cantidadKg,

          presentacion:
            datos.presentacion,

          proveedor:
            datos.proveedor,

          tipo_alimento:
            datos.tipoAlimento,

          observaciones:
            datos.observaciones,

          creado_por_usuario_id:
            null,

          creado_por_colaborador_id:
            creadoPorColaboradorId,
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

  /*
  //////////////////////////////////////////////////////////
  UPDATE
  //////////////////////////////////////////////////////////
  */

  for (const registro of actualizaciones) {
    const idReal =
      registro.servidor_id ??
      registro.servidorId ??
      registro.id;

    const actual =
      await buscarAlimentacion(
        connection,
        idReal,
        grupoDatos
      );

    if (!actual) {
      throw crearError(
        "Registro de alimentacion no encontrado.",
        404
      );
    }

    const datos =
      construirDatosAlimentacion(
        registro,
        normalizarFecha
      );

    validarDatosAlimentacion(datos);

    const duplicado =
      await buscarDuplicado(
        connection,
        {
          fecha:
            datos.fecha,

          hora:
            datos.hora,

          idEstanque:
            datos.idEstanque,

          grupoDatos,

          idIgnorado:
            idReal,
        }
      );

    if (duplicado) {
      throw crearError(
        "Ya existe otro registro de alimentacion para ese estanque en esa fecha y hora.",
        409
      );
    }

    if (
      actual.producto_id != null &&
      Number(actual.producto_id) > 0
    ) {
      await registrarMovimientoInventario(
        connection,
        {
          grupoDatos,

          productoId:
            actual.producto_id,

          tipoMovimiento:
            "Entrada",

          cantidad:
            actual.cantidad_kg,

          observacion:
            `Reversion de stock por edicion del registro ` +
            `de alimentacion #${idReal}.`,

          creadoPorColaboradorId,
        }
      );
    }

    if (
      datos.idProducto != null &&
      Number(datos.idProducto) > 0
    ) {
      await registrarMovimientoInventario(
        connection,
        {
          grupoDatos,

          productoId:
            datos.idProducto,

          tipoMovimiento:
            "Salida",

          cantidad:
            datos.cantidadKg,

          observacion:
            `Salida automatica por edicion del registro ` +
            `de alimentacion #${idReal}.`,

          creadoPorColaboradorId,
        }
      );
    }

    const actualizado =
      await actualizarAlimentacion(
        connection,
        idReal,
        grupoDatos,
        datos
      );

    resultado.actualizados +=
      actualizado.affectedRows ??
      0;
  }

  /*
  //////////////////////////////////////////////////////////
  DELETE
  //////////////////////////////////////////////////////////
  */

  for (const id of eliminaciones) {
    const actual =
      await buscarAlimentacion(
        connection,
        id,
        grupoDatos
      );

    if (!actual) {
      throw crearError(
        "Registro de alimentacion no encontrado.",
        404
      );
    }

    if (
      actual.producto_id != null &&
      Number(actual.producto_id) > 0
    ) {
      await registrarMovimientoInventario(
        connection,
        {
          grupoDatos,

          productoId:
            actual.producto_id,

          tipoMovimiento:
            "Entrada",

          cantidad:
            actual.cantidad_kg,

          observacion:
            `Reversion de stock por eliminacion del registro ` +
            `de alimentacion #${id}.`,

          creadoPorColaboradorId,
        }
      );
    }

    const eliminado =
      await eliminarAlimentacion(
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