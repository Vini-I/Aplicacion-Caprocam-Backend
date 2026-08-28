/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: sync.controller.js
Autor: Greivin Eliecer A.G
Fecha: 13/08/2026
Modulo: Sincronizacion
Descripcion:
Controlador del modulo de sincronizacion movil.
Gestiona el login por cedula/PIN, la descarga masiva
de catalogos y la subida de cambios offline.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { isPinValido } from "../services/loginUsuarios.services.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";
import pool from "../config/database.js";

import { ColaboradorLoginDTO } from "../dtos/syncLogin.dto.js";
import { DescargaCatalogosDTO } from "../dtos/syncDescarga.dto.js";
import { SubidaCambiosDTO } from "../dtos/syncSubida.dto.js";

import * as ColaboradorModel from "../models/colaborador.model.js";
import * as FincaModel from "../models/finca.model.js";
import * as EstanquesModel from "../models/estanques.model.js";
import * as ProductoModel from "../models/producto.model.js";
import * as EquipoModel from "../models/equipo.model.js";
import * as TareaModel from "../models/tarea.model.js";
import * as ProveedorModel from "../models/proveedor.model.js";
import * as CompradorModel from "../models/comprador.model.js";
import * as InventarioModel from "../models/inventario.model.js";
import * as LaboratorioModel from "../models/laboratorio.model.js";
import * as ProcedenciaModel from "../models/procedencia.model.js";
import * as ProveedorLarvaModel from "../models/proveedorLarva.model.js";
import * as LoteLarvaModel from "../models/loteLarvas.model.js";
import * as PrecriaModel from "../models/preCria.model.js";
import * as SiembraModel from "../models/siembra.model.js";
import * as EnfermedadesModel from "../models/enfermedades.model.js";
import * as ParasitologiasModel from "../models/parasitologias.model.js";

import {
  sincronizarTrazabilidad,
} from "../services/sync/syncTrazabilidad.service.js";

import {
  sincronizarRaleos,
} from "../services/sync/syncRaleos.service.js";

import {
  sincronizarVentas,
} from "../services/sync/syncVentas.service.js";

import {
  sincronizarMantenimiento,
} from "../services/sync/syncMantenimiento.service.js";

import {
  sincronizarMovimientosInventario,
} from "../services/sync/syncMovimientosInventario.service.js";

import {
  sincronizarDensidad,
} from "../services/sync/syncDensidad.service.js";

import {
  sincronizarEnfermedades,
} from "../services/sync/syncEnfermedades.service.js";

import {
  sincronizarParasitologias,
} from "../services/sync/syncParasitologia.service.js";

import {
  sincronizarAlimentacion,
} from "../services/sync/syncAlimentacion.service.js";

import {
  sincronizarFisicoQuimica,
} from "../services/sync/syncFisicoQuimica.service.js";

import {
  sincronizarCrecimiento,
} from "../services/sync/syncCrecimiento.service.js";

/*
//////////////////////////////////////////////////////////
CACHE DE COLUMNAS
//////////////////////////////////////////////////////////
*/

const columnasCache = new Map();

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS GENERALES
//////////////////////////////////////////////////////////
*/

function generarTokenColaborador(colaborador) {
  const payload = {
    id: colaborador.id,
    grupoDatos: colaborador.grupoDatos,
    rolId: colaborador.rolId,
    nombre: colaborador.nombre,
    accesoGlobal: false,
    esColaborador: true,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });
}

function tieneValor(valor) {
  return valor !== undefined && valor !== null && String(valor).trim() !== "";
}

function normalizarFecha(valor) {
  if (!tieneValor(valor)) return null;

  const texto = String(valor).trim();

  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/.test(texto)) {
    const [dia, mes, anio] = texto.split(/[\/-]/);
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return texto.substring(0, 10);
  }

  return texto;
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function resolverIdForanea(idLocal, listaCreados = [], listaActualizados = []) {
  if (!tieneValor(idLocal)) {
    return null;
  }

  const matchCreado = listaCreados.find((item) => {
    return String(item.idLocal) === String(idLocal);
  });

  if (matchCreado) {
    return matchCreado.idServidor;
  }

  const matchActualizado = listaActualizados.find((item) => {
    return (
      String(item.id) === String(idLocal) &&
      (item.servidor_id || item.servidorId)
    );
  });

  if (matchActualizado) {
    return matchActualizado.servidor_id ?? matchActualizado.servidorId;
  }

  return idLocal;
}

async function obtenerColumnasTabla(connection, tabla) {
  if (columnasCache.has(tabla)) {
    return columnasCache.get(tabla);
  }

  const [columnas] = await connection.execute(`SHOW COLUMNS FROM ${tabla}`);
  const setColumnas = new Set(columnas.map((columna) => columna.Field));

  columnasCache.set(tabla, setColumnas);

  return setColumnas;
}

async function tablaTieneColumna(connection, tabla, columna) {
  const columnas = await obtenerColumnasTabla(connection, tabla);

  return columnas.has(columna);
}

async function filtrarDatosPorTabla(connection, tabla, datos) {
  const columnas = await obtenerColumnasTabla(connection, tabla);
  const datosFiltrados = {};

  Object.keys(datos).forEach((campo) => {
    if (columnas.has(campo) && datos[campo] !== undefined) {
      datosFiltrados[campo] = datos[campo];
    }
  });

  return datosFiltrados;
}

async function insertarRegistroSync(connection, tabla, datos) {
  const datosFiltrados = await filtrarDatosPorTabla(connection, tabla, datos);
  const columnas = Object.keys(datosFiltrados);

  if (columnas.length === 0) {
    throw new Error(`No hay columnas validas para insertar en ${tabla}.`);
  }

  const placeholders = columnas.map(() => "?").join(", ");
  const valores = columnas.map((columna) => datosFiltrados[columna]);

  const [resultado] = await connection.execute(
    `INSERT INTO ${tabla} (${columnas.join(", ")}) VALUES (${placeholders})`,
    valores
  );

  return resultado;
}

async function actualizarRegistroSync(connection, tabla, datos, filtros) {
  const datosFiltrados = await filtrarDatosPorTabla(connection, tabla, datos);
  const columnasSet = Object.keys(datosFiltrados);

  if (columnasSet.length === 0) {
    return { affectedRows: 0 };
  }

  const columnasTabla = await obtenerColumnasTabla(connection, tabla);
  const condiciones = [];
  const valores = [];

  Object.keys(filtros).forEach((campo) => {
    if (columnasTabla.has(campo) && filtros[campo] !== undefined) {
      condiciones.push(`${campo} = ?`);
      valores.push(filtros[campo]);
    }
  });

  if (condiciones.length === 0) {
    return { affectedRows: 0 };
  }

  const asignaciones = columnasSet.map((campo) => `${campo} = ?`).join(", ");
  const valoresSet = columnasSet.map((campo) => datosFiltrados[campo]);

  const [resultado] = await connection.execute(
    `UPDATE ${tabla} SET ${asignaciones} WHERE ${condiciones.join(" AND ")}`,
    [...valoresSet, ...valores]
  );

  return resultado;
}

async function buscarRegistroSync(connection, tabla, filtros) {
  const columnasTabla = await obtenerColumnasTabla(connection, tabla);
  const condiciones = [];
  const valores = [];

  Object.keys(filtros).forEach((campo) => {
    if (columnasTabla.has(campo) && filtros[campo] !== undefined) {
      condiciones.push(`${campo} = ?`);
      valores.push(filtros[campo]);
    }
  });

  if (columnasTabla.has("deleted_at")) {
    condiciones.push("deleted_at IS NULL");
  }

  if (condiciones.length === 0) {
    return null;
  }

  const [filas] = await connection.execute(
    `SELECT id FROM ${tabla} WHERE ${condiciones.join(" AND ")} LIMIT 1`,
    valores
  );

  return filas.length > 0 ? filas[0] : null;
}

async function eliminarLogicoSync(connection, tabla, id, grupoDatos) {
  const columnasTabla = await obtenerColumnasTabla(connection, tabla);
  const datos = {};
  const filtros = { id };

  if (columnasTabla.has("activo")) {
    datos.activo = false;
  }

  if (columnasTabla.has("deleted_at")) {
    datos.deleted_at = new Date();
  }

  if (columnasTabla.has("grupo_datos")) {
    filtros.grupo_datos = grupoDatos;
  }

  return await actualizarRegistroSync(connection, tabla, datos, filtros);
}


/*
//////////////////////////////////////////////////////////
DESCARGAS DIRECTAS PARA SYNC
//////////////////////////////////////////////////////////
*/
async function obtenerFisicoQuimicaSync(grupoDatos) {
  const [filas] = await pool.execute(
    `SELECT *
     FROM fisico_quimico
     WHERE grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL
     ORDER BY id ASC`,
    [grupoDatos]
  );

  return filas;
}

async function obtenerDetalleFisicoQuimicaSync(grupoDatos) {
  const [filas] = await pool.execute(
    `SELECT detalle.*
     FROM fisico_quimico_detalle detalle
     INNER JOIN fisico_quimico lectura
     ON lectura.id = detalle.lectura_id
     WHERE lectura.grupo_datos = ?
     AND lectura.activo = TRUE
     AND lectura.deleted_at IS NULL
     AND detalle.activo = TRUE
     AND detalle.deleted_at IS NULL
     ORDER BY detalle.id ASC`,
    [grupoDatos]
  );

  return filas;
}

async function obtenerMantenimientosSync(grupoDatos) {
  const [filas] = await pool.execute(
    `SELECT *
     FROM mantenimiento_equipo
     WHERE grupo_datos = ?
     AND activo = TRUE
     AND deleted_at IS NULL`,
    [grupoDatos]
  );

  return filas;
}

async function obtenerMantenimientoTareasSync(grupoDatos) {
  const [filas] = await pool.execute(
    `SELECT tarea.*
     FROM mantenimiento_equipo_tareas tarea
     INNER JOIN mantenimiento_equipo mantenimiento
     ON mantenimiento.id = tarea.mantenimiento_equipo_id
     WHERE mantenimiento.grupo_datos = ?
     AND tarea.activo = TRUE
     AND tarea.deleted_at IS NULL
     AND mantenimiento.deleted_at IS NULL`,
    [grupoDatos]
  );

  return filas;
}

async function obtenerMantenimientoProductosSync(grupoDatos) {
  const [filas] = await pool.execute(
    `SELECT producto.*
     FROM mantenimiento_equipo_productos producto
     INNER JOIN mantenimiento_equipo mantenimiento
     ON mantenimiento.id = producto.mantenimiento_equipo_id
     WHERE mantenimiento.grupo_datos = ?
     AND producto.activo = TRUE
     AND producto.deleted_at IS NULL
     AND mantenimiento.deleted_at IS NULL`,
    [grupoDatos]
  );

  return filas;
}

async function obtenerCrecimientosSync(
  grupoDatos
) {
  const [filas] =
    await pool.execute(
      `SELECT *
       FROM crecimientos
       WHERE grupo_datos = ?
       AND deleted_at IS NULL
       ORDER BY id ASC`,
      [
        grupoDatos,
      ]
    );

  return filas;
}

async function obtenerCalculosCrecimientoSync(
  grupoDatos
) {
  const [filas] =
    await pool.execute(
      `SELECT *
       FROM calculos_crecimiento
       WHERE grupo_datos = ?
       AND activo = TRUE
       AND deleted_at IS NULL
       ORDER BY id ASC`,
      [
        grupoDatos,
      ]
    );

  return filas;
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export async function loginColaborador(req, res) {
  try {
    const { cedula, pin } = req.body;

    if (!cedula || !pin) {
      return error(res, "La cedula y el PIN son requeridos.", null, 400);
    }

    const colaborador = await ColaboradorModel.findByCedula(
      String(cedula).trim()
    );

    if (!colaborador) {
      return error(
        res,
        "No se encontro un colaborador activo con esa cedula.",
        null,
        404
      );
    }

    const [filas] = await pool.execute(
      `SELECT pin_hash FROM colaboradores
       WHERE cedula = ? AND activo = TRUE AND deleted_at IS NULL LIMIT 1`,
      [String(cedula).trim()]
    );

    if (filas.length === 0 || !filas[0].pin_hash) {
      return error(res, "El colaborador no tiene un PIN configurado.", null, 403);
    }

    const pinOk = await isPinValido(String(pin), filas[0].pin_hash);

    if (!pinOk) {
      return error(res, "PIN incorrecto.", null, 401);
    }

    const token = generarTokenColaborador(colaborador);

    return exito(res, "Inicio de sesion exitoso.", {
      token,
      colaborador: new ColaboradorLoginDTO(colaborador),
    });
  } catch (err) {
    return error(res, "Error inesperado al iniciar sesion.", err, 500);
  }
}

export async function descargarCatalogos(req, res) {
  try {
    const { grupoDatos, colaboradorId } = obtenerContextoPeticion(req);

    const [
      fincas,
      estanques,
      proveedores,
      productos,
      compradores,
      inventario,
      equipos,
      tareas,
      mantenimientos,
      mantenimientoTareas,
      mantenimientoProductos,
      laboratorios,
      procedencias,
      proveedoresLarva,
      lotesLarva,
      precrias,
      siembras,
      enfermedades,
      parasitologias,
      fisicoQuimica,
      detalleFisicoQuimica,
      crecimientos,
      calculosCrecimiento,
    ] = await Promise.all([
      FincaModel.findAll(grupoDatos),
      EstanquesModel.findAll({ grupoDatos }),
      ProveedorModel.findAll(grupoDatos),
      ProductoModel.findAll(grupoDatos),
      CompradorModel.findAll(grupoDatos),
      InventarioModel.findAll(grupoDatos),
      EquipoModel.findAll({ grupoDatos }),
      TareaModel.findAll(grupoDatos),
      obtenerMantenimientosSync(grupoDatos),
      obtenerMantenimientoTareasSync(grupoDatos),
      obtenerMantenimientoProductosSync(grupoDatos),
      LaboratorioModel.findAll(grupoDatos),
      ProcedenciaModel.findAll(grupoDatos),
      ProveedorLarvaModel.findAll(grupoDatos),
      LoteLarvaModel.findAll(grupoDatos),
      PrecriaModel.findAll(grupoDatos),
      SiembraModel.findAll(grupoDatos),
      EnfermedadesModel.findAll({ grupoDatos }),
      ParasitologiasModel.findAll({ grupoDatos }),
      obtenerFisicoQuimicaSync(grupoDatos),
      obtenerDetalleFisicoQuimicaSync(grupoDatos),
      obtenerCrecimientosSync(grupoDatos),
      obtenerCalculosCrecimientoSync(grupoDatos),
    ]);

    return exito(
      res,
      "Catalogos descargados correctamente.",
      new DescargaCatalogosDTO({
        fincas,
        estanques,
        proveedores,
        productos,
        compradores,
        inventario,
        equipos,
        tareas,
        mantenimientos,
        mantenimientoTareas,
        mantenimientoProductos,
        laboratorios,
        procedencias,
        proveedoresLarva,
        lotesLarva,
        precrias,
        siembras,
        enfermedades,
        parasitologias,
        fisicoQuimica,
        detalleFisicoQuimica,
        crecimientos,
        calculosCrecimiento,
        colaboradorId,
        grupoDatos,
      })
    );
  } catch (err) {
    return error(res, "Error al descargar los catalogos.", err, 500);
  }
}

export async function subirCambios(req, res) {
  let connection;

  try {
    const { grupoDatos, creadoPorColaboradorId } = obtenerContextoPeticion(req);
    const cambios = req.body;

    if (!cambios || typeof cambios !== "object") {
      return error(res, "El cuerpo debe ser un objeto con los cambios.", null, 400);
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const resultado = {};

    if (cambios.equipos) {
      resultado.equipos = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], actualizar = [], eliminar = [] } = cambios.equipos;

      for (const r of crear) {
        const identificador = r.identificador ?? null;

        const existente = await buscarRegistroSync(connection, "equipos", {
          grupo_datos: grupoDatos,
          identificador,
        });

        if (existente) {
          resultado.equipos.creados.push({
            idLocal: r.idLocal ?? r.id ?? null,
            idServidor: existente.id,
          });

          continue;
        }

        const insertado = await insertarRegistroSync(connection, "equipos", {
          grupo_datos: grupoDatos,
          identificador,
          nombre_equipo: r.nombreEquipo ?? r.nombre_equipo ?? null,
          descripcion: r.descripcion ?? null,
          tipo_equipo: r.tipoEquipo ?? r.tipo_equipo ?? null,
          fecha_instalacion: normalizarFecha(
            r.fechaInstalacion ?? r.fecha_instalacion
          ),
          funcion_equipo: r.funcionEquipo ?? r.funcion_equipo ?? null,
          estanque_id: r.estanqueId ?? r.estanque_id ?? null,
          horas_mantenimiento:
            r.horasMantenimiento ?? r.horas_mantenimiento ?? null,
          horas_actuales: r.horasActuales ?? r.horas_actuales ?? 0,
          estado_operativo:
            r.estadoOperativo ?? r.estado_operativo ?? "Activo",
          estado: r.estado ?? "Apagado",
          fecha_ultimo_encendido:
            r.fechaUltimoEncendido ?? r.fecha_ultimo_encendido ?? null,
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.equipos.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;

        const actualizado = await actualizarRegistroSync(
          connection,
          "equipos",
          {
            identificador: r.identificador,
            nombre_equipo: r.nombreEquipo ?? r.nombre_equipo,
            descripcion: r.descripcion,
            tipo_equipo: r.tipoEquipo ?? r.tipo_equipo,
            fecha_instalacion: normalizarFecha(
              r.fechaInstalacion ?? r.fecha_instalacion
            ),
            funcion_equipo: r.funcionEquipo ?? r.funcion_equipo,
            estanque_id: r.estanqueId ?? r.estanque_id,
            horas_mantenimiento:
              r.horasMantenimiento ?? r.horas_mantenimiento,
            horas_actuales: r.horasActuales ?? r.horas_actuales,
            estado_operativo: r.estadoOperativo ?? r.estado_operativo,
            estado: r.estado,
            fecha_ultimo_encendido:
              r.fechaUltimoEncendido ?? r.fecha_ultimo_encendido,
          },
          {
            id: idReal,
            grupo_datos: grupoDatos,
          }
        );

        resultado.equipos.actualizados += actualizado.affectedRows ?? 0;
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "equipos", id, grupoDatos);
        resultado.equipos.eliminados++;
      }
    }

    if (cambios.alimentacion) {
      resultado.alimentacion =
        await sincronizarAlimentacion({
          connection,
          cambios:
            cambios.alimentacion,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          normalizarFecha,
        });
    }

    if (
      cambios.crecimiento ||
      cambios.calculosCrecimiento
    ) {
      const resultadoCrecimiento =
        await sincronizarCrecimiento({
          connection,
          cambios,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          resolverIdForanea,
          normalizarFecha,
        });

      Object.assign(
        resultado,
        resultadoCrecimiento
      );
    }

    if (
      cambios.fisicoQuimica ||
      cambios.detalleFisicoQuimica
    ) {
      const resultadoFisicoQuimica =
        await sincronizarFisicoQuimica({
          connection,
          cambios,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          resolverIdForanea,
          normalizarFecha,
        });

      Object.assign(
        resultado,
        resultadoFisicoQuimica
      );
    }

    if (
      cambios.densidadPoblacional ||
      cambios.detalleTirosDensidad
    ) {
      const resultadoDensidad =
        await sincronizarDensidad({
          connection,
          cambios,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          actualizarRegistroSync,
          buscarRegistroSync,
          resolverIdForanea,
          normalizarFecha,
        });

      Object.assign(
        resultado,
        resultadoDensidad
      );
    }

    if (cambios.enfermedades) {
      resultado.enfermedades =
        await sincronizarEnfermedades({
          connection,
          cambios:
            cambios.enfermedades,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          normalizarFecha,
        });
    }

    if (cambios.parasitologias) {
      resultado.parasitologias =
        await sincronizarParasitologias({
          connection,
          cambios:
            cambios.parasitologias,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          normalizarFecha,
        });
    }

    if (cambios.raleos) {
      resultado.raleos =
        await sincronizarRaleos({
          connection,
          cambios: cambios.raleos,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          actualizarRegistroSync,
          eliminarLogicoSync,
          normalizarFecha,
        });
    }

    if (cambios.ventas) {
      resultado.ventas =
        await sincronizarVentas({
          connection,
          cambios: cambios.ventas,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          actualizarRegistroSync,
          eliminarLogicoSync,
          normalizarFecha,
        });
    }

    if (cambios.trazabilidad) {
      resultado.trazabilidad =
        await sincronizarTrazabilidad({
          connection,
          cambios: cambios.trazabilidad,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          eliminarLogicoSync,
          normalizarFecha,
        });
    }

    if (cambios.movimientosInventario) {
      resultado.movimientosInventario =
        await sincronizarMovimientosInventario({
          connection,
          cambios:
            cambios.movimientosInventario,
          grupoDatos,
          creadoPorColaboradorId,
          insertarRegistroSync,
          eliminarLogicoSync,
          normalizarFecha,
        });
    }

    if (
      cambios.mantenimientos ||
      cambios.tareasMantenimiento ||
      cambios.productosMantenimiento
    ) {
      const resultadoMantenimiento =
        await sincronizarMantenimiento({
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
        });

      Object.assign(
        resultado,
        resultadoMantenimiento
      );
    }

    const androidId =
      req.body.androidId ??
      req.headers["x-android-id"] ??
      "desconocido";

    let totalCreados = 0;
    let totalActualizados = 0;
    let totalEliminados = 0;

    for (const modulo of Object.values(resultado)) {
      totalCreados += modulo.creados?.length ?? 0;
      totalActualizados += modulo.actualizados ?? 0;
      totalEliminados += modulo.eliminados ?? 0;
    }

    const totalRegistros =
      totalCreados +
      totalActualizados +
      totalEliminados;

    if (totalRegistros > 0) {
      await insertarRegistroSync(connection, "historial_sincronizaciones", {
        grupo_datos: grupoDatos,
        colaborador_id: creadoPorColaboradorId,
        android_id: androidId,
        total_creados: totalCreados,
        total_actualizados: totalActualizados,
        total_eliminados: totalEliminados,
        total_registros: totalRegistros,
        estado: "exitoso",
      });
    }

    await connection.commit();

    return exito(
      res,
      "Cambios sincronizados correctamente.",
      new SubidaCambiosDTO({
        resultado,
        creadoPorColaboradorId,
        grupoDatos,
      })
    );
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        // Sin salida en consola para evitar ruido en produccion.
      }
    }

    return error(
      res,
      "Error al subir los cambios. Se revirtieron todos los cambios.",
      err,
      500
    );
  } finally {
    if (connection) connection.release();
  }
}