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
  if (!tieneValor(valor)) {
    return null;
  }

  const texto = String(valor).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
    return texto.slice(0, 10);
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

async function eliminarFisicoQuimicoDetalleSync(connection, id, grupoDatos) {
  const tieneGrupoDatos = await tablaTieneColumna(
    connection,
    "fisico_quimico_detalle",
    "grupo_datos"
  );

  if (tieneGrupoDatos) {
    return await eliminarLogicoSync(
      connection,
      "fisico_quimico_detalle",
      id,
      grupoDatos
    );
  }

  await connection.execute(
    `UPDATE fisico_quimico_detalle detalle
     INNER JOIN fisico_quimico lectura
     ON lectura.id = detalle.lectura_id
     SET detalle.activo = FALSE,
         detalle.deleted_at = CURRENT_TIMESTAMP
     WHERE detalle.id = ?
     AND lectura.grupo_datos = ?`,
    [id, grupoDatos]
  );
}

async function eliminarDensidadDetalleSync(connection, id, grupoDatos) {
  const tieneGrupoDatos = await tablaTieneColumna(
    connection,
    "densidad_detalle_tiros",
    "grupo_datos"
  );

  if (tieneGrupoDatos) {
    return await eliminarLogicoSync(
      connection,
      "densidad_detalle_tiros",
      id,
      grupoDatos
    );
  }

  await connection.execute(
    `UPDATE densidad_detalle_tiros detalle
     INNER JOIN densidad_poblacional densidad
     ON densidad.id = detalle.densidad_id
     SET detalle.activo = FALSE,
         detalle.deleted_at = CURRENT_TIMESTAMP
     WHERE detalle.id = ?
     AND densidad.grupo_datos = ?`,
    [id, grupoDatos]
  );
}

async function eliminarMantenimientoTareaSync(connection, id, grupoDatos) {
  const tieneGrupoDatos = await tablaTieneColumna(
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
    [id, grupoDatos]
  );
}

async function eliminarMantenimientoProductoSync(connection, id, grupoDatos) {
  const tieneGrupoDatos = await tablaTieneColumna(
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
    [id, grupoDatos]
  );
}

/*
//////////////////////////////////////////////////////////
NORMALIZADORES
//////////////////////////////////////////////////////////
*/

function normalizarEnfermedadSync(valor) {
  const texto = normalizarTexto(valor);

  if (
    texto === "wssv" ||
    texto.includes("mancha blanca") ||
    texto.includes("white spot")
  ) {
    return "WSSV - Mancha Blanca";
  }

  if (
    texto === "ahpnd" ||
    texto.includes("necrosis") ||
    texto.includes("hepatopancreatica")
  ) {
    return "AHPND - Necrosis hepatopancreatica aguda";
  }

  if (texto === "vibriosis" || texto.includes("vibrio")) {
    return "Vibriosis";
  }

  if (texto === "ihhnv") {
    return "IHHNV";
  }

  if (texto === "nhp" || texto.includes("hepatobacter")) {
    return "NHP - Hepatobacter penaei";
  }

  return "otro";
}

function normalizarSeveridadSync(valor) {
  const texto = normalizarTexto(valor);

  if (texto === "bajo" || texto === "baja") {
    return "bajo";
  }

  if (texto === "medio" || texto === "media") {
    return "medio";
  }

  if (texto === "alto" || texto === "alta") {
    return "alto";
  }

  if (texto === "critica" || texto === "critico") {
    return "critica";
  }

  return "bajo";
}

function normalizarParasitoSync(valor) {
  const texto = normalizarTexto(valor);

  if (texto.includes("gregarina")) {
    return "gregarina";
  }

  if (texto.includes("nematodo")) {
    return "nematodo";
  }

  if (texto.includes("epicomensal")) {
    return "epicomensal";
  }

  if (texto.includes("protozoario")) {
    return "protozoario";
  }

  return "otro";
}

function normalizarGradoInfeccionSync(valor) {
  const texto = normalizarTexto(valor);

  if (texto === "bajo" || texto === "baja") {
    return "bajo";
  }

  if (texto === "medio" || texto === "media") {
    return "medio";
  }

  if (texto === "alto" || texto === "alta") {
    return "alto";
  }

  return "bajo";
}

function normalizarTipoMedicionSync(valor) {
  const texto = normalizarTexto(valor);

  if (texto === "ph" || texto === "p_h") {
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

  return texto || null;
}

function normalizarEtiquetaSync(valor) {
  const texto = normalizarTexto(valor);

  if (!texto) {
    return null;
  }

  return texto;
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
      laboratorios,
      procedencias,
      proveedoresLarva,
      lotesLarva,
      precrias,
      siembras,
    ] = await Promise.all([
      FincaModel.findAll(grupoDatos),
      EstanquesModel.findAll({ grupoDatos }),
      ProveedorModel.findAll(grupoDatos),
      ProductoModel.findAll(grupoDatos),
      CompradorModel.findAll(grupoDatos),
      InventarioModel.findAll(grupoDatos),
      EquipoModel.findAll({ grupoDatos }),
      TareaModel.findAll(grupoDatos),
      LaboratorioModel.findAll(grupoDatos),
      ProcedenciaModel.findAll(grupoDatos),
      ProveedorLarvaModel.findAll(grupoDatos),
      LoteLarvaModel.findAll(grupoDatos),
      PrecriaModel.findAll(grupoDatos),
      SiembraModel.findAll(grupoDatos),
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
        laboratorios,
        procedencias,
        proveedoresLarva,
        lotesLarva,
        precrias,
        siembras,
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

    if (cambios.alimentacion) {
      resultado.alimentacion = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], actualizar = [], eliminar = [] } = cambios.alimentacion;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(connection, "alimentaciones", {
          grupo_datos: grupoDatos,
          finca_id: r.fincaId ?? r.finca_id ?? null,
          estanque_id: r.estanqueId ?? r.estanque_id ?? null,
          proveedor_id: r.proveedorId ?? r.proveedor_id ?? null,
          producto_id: r.productoId ?? r.producto_id ?? null,
          fecha: normalizarFecha(r.fecha),
          hora: r.hora ?? null,
          metodo: r.metodo ?? null,
          cantidad_kg: r.cantidadKg ?? r.cantidad_kg ?? null,
          observaciones: r.observaciones ?? null,
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.alimentacion.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;

        const actualizado = await actualizarRegistroSync(
          connection,
          "alimentaciones",
          {
            fecha: normalizarFecha(r.fecha),
            hora: r.hora,
            metodo: r.metodo,
            cantidad_kg: r.cantidadKg ?? r.cantidad_kg,
            observaciones: r.observaciones,
          },
          {
            id: idReal,
            grupo_datos: grupoDatos,
          }
        );

        resultado.alimentacion.actualizados += actualizado.affectedRows ?? 0;
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "alimentaciones", id, grupoDatos);
        resultado.alimentacion.eliminados++;
      }
    }

    if (cambios.crecimiento) {
      resultado.crecimiento = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], actualizar = [], eliminar = [] } = cambios.crecimiento;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(connection, "crecimientos", {
          grupo_datos: grupoDatos,
          finca_id: r.fincaId ?? r.finca_id ?? null,
          estanque_id: r.estanqueId ?? r.estanque_id ?? null,
          fecha_registro: normalizarFecha(r.fechaRegistro ?? r.fecha_registro),
          peso_actual: r.pesoActual ?? r.peso_actual ?? null,
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.crecimiento.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;

        const actualizado = await actualizarRegistroSync(
          connection,
          "crecimientos",
          {
            fecha_registro: normalizarFecha(r.fechaRegistro ?? r.fecha_registro),
            peso_actual: r.pesoActual ?? r.peso_actual,
          },
          {
            id: idReal,
            grupo_datos: grupoDatos,
          }
        );

        resultado.crecimiento.actualizados += actualizado.affectedRows ?? 0;
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "crecimientos", id, grupoDatos);
        resultado.crecimiento.eliminados++;
      }
    }

    if (cambios.calculosCrecimiento) {
      resultado.calculosCrecimiento = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], actualizar = [], eliminar = [] } =
        cambios.calculosCrecimiento;

      for (const r of crear) {
        const mappedCrecimientoId = resolverIdForanea(
          r.crecimientoId ?? r.crecimiento_id,
          resultado.crecimiento?.creados,
          cambios.crecimiento?.actualizar
        );

        const insertado = await insertarRegistroSync(
          connection,
          "calculos_crecimiento",
          {
            grupo_datos: grupoDatos,
            crecimiento_id: mappedCrecimientoId,
            cantidad_individuos:
              r.cantidadIndividuos ?? r.cantidad_individuos ?? null,
            peso_total: r.pesoTotal ?? r.peso_total ?? null,
            peso_promedio_individual:
              r.pesoPromedioIndividual ??
              r.peso_promedio_individual ??
              null,
            creado_por_colaborador_id: creadoPorColaboradorId,
          }
        );

        resultado.calculosCrecimiento.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;

        const actualizado = await actualizarRegistroSync(
          connection,
          "calculos_crecimiento",
          {
            cantidad_individuos:
              r.cantidadIndividuos ?? r.cantidad_individuos,
            peso_total: r.pesoTotal ?? r.peso_total,
            peso_promedio_individual:
              r.pesoPromedioIndividual ?? r.peso_promedio_individual,
          },
          {
            id: idReal,
            grupo_datos: grupoDatos,
          }
        );

        resultado.calculosCrecimiento.actualizados +=
          actualizado.affectedRows ?? 0;
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(
          connection,
          "calculos_crecimiento",
          id,
          grupoDatos
        );
        resultado.calculosCrecimiento.eliminados++;
      }
    }

    if (cambios.fisicoQuimica) {
      resultado.fisicoQuimica = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.fisicoQuimica;

      for (const r of crear) {
        const fincaId = r.fincaId ?? r.finca_id ?? null;
        const estanqueId = r.estanqueId ?? r.estanque_id ?? null;
        const fechaRegistro = normalizarFecha(
          r.fechaRegistro ?? r.fecha_registro ?? r.fecha
        );

        const existente = await buscarRegistroSync(connection, "fisico_quimico", {
          grupo_datos: grupoDatos,
          estanque_id: estanqueId,
          fecha_registro: fechaRegistro,
        });

        if (existente) {
          resultado.fisicoQuimica.creados.push({
            idLocal: r.idLocal ?? r.id ?? null,
            idServidor: existente.id,
          });

          continue;
        }

        const insertado = await insertarRegistroSync(connection, "fisico_quimico", {
          grupo_datos: grupoDatos,
          finca_id: fincaId,
          estanque_id: estanqueId,
          fecha_registro: fechaRegistro,
        });

        resultado.fisicoQuimica.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "fisico_quimico", id, grupoDatos);
        resultado.fisicoQuimica.eliminados++;
      }
    }

    if (cambios.detalleFisicoQuimica) {
      resultado.detalleFisicoQuimica = {
        creados: [],
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.detalleFisicoQuimica;

      for (const r of crear) {
        const mappedLecturaId = resolverIdForanea(
          r.lecturaId ?? r.lectura_id,
          resultado.fisicoQuimica?.creados,
          cambios.fisicoQuimica?.actualizar
        );

        const tipoMedicion = normalizarTipoMedicionSync(
          r.tipoMedicion ?? r.tipo_medicion
        );
        const etiqueta = normalizarEtiquetaSync(r.etiqueta);
        const valor = r.valor ?? null;

        const existente = await buscarRegistroSync(
          connection,
          "fisico_quimico_detalle",
          {
            lectura_id: mappedLecturaId,
            tipo_medicion: tipoMedicion,
            etiqueta,
          }
        );

        if (existente) {
          await actualizarRegistroSync(
            connection,
            "fisico_quimico_detalle",
            {
              valor,
            },
            {
              id: existente.id,
            }
          );

          resultado.detalleFisicoQuimica.creados.push({
            idLocal: r.idLocal ?? r.id ?? null,
            idServidor: existente.id,
          });

          continue;
        }

        const insertado = await insertarRegistroSync(
          connection,
          "fisico_quimico_detalle",
          {
            grupo_datos: grupoDatos,
            lectura_id: mappedLecturaId,
            tipo_medicion: tipoMedicion,
            etiqueta,
            valor,
          }
        );

        resultado.detalleFisicoQuimica.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarFisicoQuimicoDetalleSync(connection, id, grupoDatos);
        resultado.detalleFisicoQuimica.eliminados++;
      }
    }

    if (cambios.densidadPoblacional) {
      resultado.densidadPoblacional = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.densidadPoblacional;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(
          connection,
          "densidad_poblacional",
          {
            grupo_datos: grupoDatos,
            finca_id: r.fincaId ?? r.finca_id ?? null,
            estanque_id: r.estanqueId ?? r.estanque_id ?? null,
            fecha: normalizarFecha(r.fecha),
            cantidad_siembra: r.cantidadSiembra ?? r.cantidad_siembra ?? null,
            area_estanque: r.areaEstanque ?? r.area_estanque ?? null,
            total_camarones_muestra:
              r.totalCamaronesMuestra ?? r.total_camarones_muestra ?? null,
            tiros_atarraya: r.tirosAtarraya ?? r.tiros_atarraya ?? null,
            area_atarraya: r.areaAtarraya ?? r.area_atarraya ?? null,
            area_muestreada: r.areaMuestreada ?? r.area_muestreada ?? null,
            promedio_por_tiro: r.promedioPorTiro ?? r.promedio_por_tiro ?? null,
            poblacion_estimada:
              r.poblacionEstimada ?? r.poblacion_estimada ?? null,
            sobrevivencia: r.sobrevivencia ?? null,
            densidad: r.densidad ?? null,
            notas_conteo: r.notasConteo ?? r.notas_conteo ?? null,
            creado_por_colaborador_id: creadoPorColaboradorId,
          }
        );

        resultado.densidadPoblacional.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(
          connection,
          "densidad_poblacional",
          id,
          grupoDatos
        );
        resultado.densidadPoblacional.eliminados++;
      }
    }

    if (cambios.detalleTirosDensidad) {
      resultado.detalleTirosDensidad = {
        creados: [],
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.detalleTirosDensidad;

      for (const r of crear) {
        const mappedDensidadId = resolverIdForanea(
          r.densidadId ?? r.densidad_id,
          resultado.densidadPoblacional?.creados,
          cambios.densidadPoblacional?.actualizar
        );

        const numeroTiro = r.numeroTiro ?? r.numero_tiro ?? null;
        const cantidadCamarones =
          r.cantidadCamarones ?? r.cantidad_camarones ?? null;

        const existente = await buscarRegistroSync(
          connection,
          "densidad_detalle_tiros",
          {
            densidad_id: mappedDensidadId,
            numero_tiro: numeroTiro,
          }
        );

        if (existente) {
          await actualizarRegistroSync(
            connection,
            "densidad_detalle_tiros",
            {
              cantidad_camarones: cantidadCamarones,
            },
            {
              id: existente.id,
            }
          );

          resultado.detalleTirosDensidad.creados.push({
            idLocal: r.idLocal ?? r.id ?? null,
            idServidor: existente.id,
          });

          continue;
        }

        const insertado = await insertarRegistroSync(
          connection,
          "densidad_detalle_tiros",
          {
            grupo_datos: grupoDatos,
            densidad_id: mappedDensidadId,
            numero_tiro: numeroTiro,
            cantidad_camarones: cantidadCamarones,
          }
        );

        resultado.detalleTirosDensidad.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarDensidadDetalleSync(connection, id, grupoDatos);
        resultado.detalleTirosDensidad.eliminados++;
      }
    }

    if (cambios.enfermedades) {
      resultado.enfermedades = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.enfermedades;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(connection, "enfermedades", {
          grupo_datos: grupoDatos,
          finca_id: r.fincaId ?? r.finca_id ?? null,
          estanque_id: r.estanqueId ?? r.estanque_id ?? null,
          tipo_registro: r.tipoRegistro ?? r.tipo_registro ?? null,
          fecha_reporte: normalizarFecha(r.fechaReporte ?? r.fecha_reporte),
          responsable: r.responsable ?? null,
          enfermedad: normalizarEnfermedadSync(r.enfermedad),
          severidad: normalizarSeveridadSync(r.severidad),
          reporte: r.reporte ?? null,
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.enfermedades.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "enfermedades", id, grupoDatos);
        resultado.enfermedades.eliminados++;
      }
    }

    if (cambios.parasitologias) {
      resultado.parasitologias = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.parasitologias;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(
          connection,
          "parasitologias",
          {
            grupo_datos: grupoDatos,
            finca_id: r.fincaId ?? r.finca_id ?? null,
            estanque_id: r.estanqueId ?? r.estanque_id ?? null,
            tipo_registro: r.tipoRegistro ?? r.tipo_registro ?? null,
            fecha_reporte: normalizarFecha(r.fechaReporte ?? r.fecha_reporte),
            responsable: r.responsable ?? null,
            parasito: normalizarParasitoSync(r.parasito),
            grado_infeccion: normalizarGradoInfeccionSync(
              r.gradoInfeccion ?? r.grado_infeccion
            ),
            observaciones: r.observaciones ?? null,
            creado_por_colaborador_id: creadoPorColaboradorId,
          }
        );

        resultado.parasitologias.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "parasitologias", id, grupoDatos);
        resultado.parasitologias.eliminados++;
      }
    }

    if (cambios.raleos) {
      resultado.raleos = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.raleos;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(connection, "raleos", {
          grupo_datos: grupoDatos,
          finca_id: r.fincaId ?? r.finca_id ?? null,
          estanque_id: r.estanqueId ?? r.estanque_id ?? null,
          siembra_id: r.siembraId ?? r.siembra_id ?? null,
          fecha: normalizarFecha(r.fecha),
          porcentaje: r.porcentaje ?? null,
          kg_retirados: r.kgRetirados ?? r.kg_retirados ?? null,
          biomasa_restante: r.biomasaRestante ?? r.biomasa_restante ?? null,
          biomasa_estimada: r.biomasaEstimada ?? r.biomasa_estimada ?? null,
          observaciones: r.observaciones ?? null,
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.raleos.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "raleos", id, grupoDatos);
        resultado.raleos.eliminados++;
      }
    }

    if (cambios.ventas) {
      resultado.ventas = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.ventas;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(connection, "ventas", {
          grupo_datos: grupoDatos,
          finca_id: r.fincaId ?? r.finca_id ?? null,
          estanque_id: r.estanqueId ?? r.estanque_id ?? null,
          comprador_id: r.compradorId ?? r.comprador_id ?? null,
          peso_promedio: r.pesoPromedio ?? r.peso_promedio ?? null,
          cantidad_vendida: r.cantidadVendida ?? r.cantidad_vendida ?? null,
          precio_kilo: r.precioKilo ?? r.precio_kilo ?? null,
          total: r.total ?? null,
          fecha: normalizarFecha(r.fecha),
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.ventas.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "ventas", id, grupoDatos);
        resultado.ventas.eliminados++;
      }
    }

    if (cambios.trazabilidad) {
      resultado.trazabilidad = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.trazabilidad;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(connection, "trazabilidad", {
          grupo_datos: grupoDatos,
          finca_id: r.fincaId ?? r.finca_id ?? null,
          estanque_origen_id:
            r.estanqueOrigenId ?? r.estanque_origen_id ?? null,
          estanque_destino_id:
            r.estanqueDestinoId ?? r.estanque_destino_id ?? null,
          fecha: normalizarFecha(r.fecha),
          tamano: r.tamano ?? null,
          dias: r.dias ?? null,
          pl: r.pl ?? null,
          tipo_movimiento: r.tipoMovimiento ?? r.tipo_movimiento ?? null,
          creado_por_colaborador_id: creadoPorColaboradorId,
        });

        resultado.trazabilidad.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(connection, "trazabilidad", id, grupoDatos);
        resultado.trazabilidad.eliminados++;
      }
    }

    if (cambios.movimientosInventario) {
      resultado.movimientosInventario = {
        creados: [],
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.movimientosInventario;

      for (const r of crear) {
        const insertado = await insertarRegistroSync(
          connection,
          "movimientos_inventario",
          {
            grupo_datos: grupoDatos,
            inventario_id: r.inventarioId ?? r.inventario_id ?? null,
            producto_id: r.productoId ?? r.producto_id ?? null,
            tipo_movimiento: r.tipoMovimiento ?? r.tipo_movimiento ?? null,
            cantidad: r.cantidad ?? null,
            observacion: r.observacion ?? null,
            fecha_movimiento:
              normalizarFecha(r.fechaMovimiento ?? r.fecha_movimiento) ??
              null,
            creado_por_colaborador_id: creadoPorColaboradorId,
          }
        );

        resultado.movimientosInventario.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarLogicoSync(
          connection,
          "movimientos_inventario",
          id,
          grupoDatos
        );
        resultado.movimientosInventario.eliminados++;
      }
    }

    if (cambios.mantenimientos) {
      resultado.mantenimientos = {
        creados: [],
        actualizados: 0,
        eliminados: 0,
      };

      const { crear = [], actualizar = [], eliminar = [] } = cambios.mantenimientos;

      for (const r of crear) {
        const codigoTicket =
          r.codigoTicket ??
          r.codigo_ticket ??
          `MOB-${grupoDatos}-${Date.now()}`;

        const existente = await buscarRegistroSync(
          connection,
          "mantenimiento_equipo",
          {
            grupo_datos: grupoDatos,
            codigo_ticket: codigoTicket,
          }
        );

        if (existente) {
          resultado.mantenimientos.creados.push({
            idLocal: r.idLocal ?? r.id ?? null,
            idServidor: existente.id,
          });

          continue;
        }

        const insertado = await insertarRegistroSync(
          connection,
          "mantenimiento_equipo",
          {
            grupo_datos: grupoDatos,
            equipo_id: r.equipoId ?? r.equipo_id ?? null,
            codigo_ticket: codigoTicket,
            fecha_mantenimiento: normalizarFecha(
              r.fechaMantenimiento ?? r.fecha_mantenimiento
            ),
            titulo_ticket: r.tituloTicket ?? r.titulo_ticket ?? null,
            descripcion_ticket:
              r.descripcionTicket ?? r.descripcion_ticket ?? null,
            tipo_personal: r.tipoPersonal ?? r.tipo_personal ?? null,
            costo_mano_obra: r.costoManoObra ?? r.costo_mano_obra ?? 0,
            costo_productos: r.costoProductos ?? r.costo_productos ?? 0,
            costo_total_estimado:
              r.costoTotalEstimado ?? r.costo_total_estimado ?? 0,
            estado_ticket: r.estadoTicket ?? r.estado_ticket ?? "En espera",
            creado_por_colaborador_id: creadoPorColaboradorId,
          }
        );

        resultado.mantenimientos.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;

        const actualizado = await actualizarRegistroSync(
          connection,
          "mantenimiento_equipo",
          {
            titulo_ticket: r.tituloTicket ?? r.titulo_ticket,
            descripcion_ticket: r.descripcionTicket ?? r.descripcion_ticket,
            estado_ticket: r.estadoTicket ?? r.estado_ticket,
          },
          {
            id: idReal,
            grupo_datos: grupoDatos,
          }
        );

        resultado.mantenimientos.actualizados +=
          actualizado.affectedRows ?? 0;
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

      const { crear = [], actualizar = [], eliminar = [] } =
        cambios.tareasMantenimiento;

      for (const r of crear) {
        const mappedMantenimientoId = resolverIdForanea(
          r.mantenimientoId ?? r.mantenimiento_id ?? r.mantenimiento_equipo_id,
          resultado.mantenimientos?.creados,
          cambios.mantenimientos?.actualizar
        );

        const tareaId = r.tareaId ?? r.tarea_id ?? null;

        const existente = await buscarRegistroSync(
          connection,
          "mantenimiento_equipo_tareas",
          {
            grupo_datos: grupoDatos,
            mantenimiento_equipo_id: mappedMantenimientoId,
            tarea_id: tareaId,
          }
        );

        if (existente) {
          resultado.tareasMantenimiento.creados.push({
            idLocal: r.idLocal ?? r.id ?? null,
            idServidor: existente.id,
          });

          continue;
        }

        const insertado = await insertarRegistroSync(
          connection,
          "mantenimiento_equipo_tareas",
          {
            grupo_datos: grupoDatos,
            mantenimiento_equipo_id: mappedMantenimientoId,
            tarea_id: tareaId,
            estado_tarea: r.estadoTarea ?? r.estado_tarea ?? "Pendiente",
          }
        );

        resultado.tareasMantenimiento.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;

        const actualizado = await actualizarRegistroSync(
          connection,
          "mantenimiento_equipo_tareas",
          {
            estado_tarea: r.estadoTarea ?? r.estado_tarea,
          },
          {
            id: idReal,
            grupo_datos: grupoDatos,
          }
        );

        resultado.tareasMantenimiento.actualizados +=
          actualizado.affectedRows ?? 0;
      }

      for (const id of eliminar) {
        await eliminarMantenimientoTareaSync(connection, id, grupoDatos);
        resultado.tareasMantenimiento.eliminados++;
      }
    }

    if (cambios.productosMantenimiento) {
      resultado.productosMantenimiento = {
        creados: [],
        eliminados: 0,
      };

      const { crear = [], eliminar = [] } = cambios.productosMantenimiento;

      for (const r of crear) {
        const mappedMantenimientoId = resolverIdForanea(
          r.mantenimientoId ?? r.mantenimiento_id ?? r.mantenimiento_equipo_id,
          resultado.mantenimientos?.creados,
          cambios.mantenimientos?.actualizar
        );

        const productoId = r.productoId ?? r.producto_id ?? null;

        const insertado = await insertarRegistroSync(
          connection,
          "mantenimiento_equipo_productos",
          {
            grupo_datos: grupoDatos,
            mantenimiento_equipo_id: mappedMantenimientoId,
            producto_id: productoId,
            cantidad: r.cantidad ?? null,
            costo_unitario: r.costoUnitario ?? r.costo_unitario ?? 0,
            subtotal: r.subtotal ?? 0,
          }
        );

        resultado.productosMantenimiento.creados.push({
          idLocal: r.idLocal ?? r.id ?? null,
          idServidor: insertado.insertId,
        });
      }

      for (const id of eliminar) {
        await eliminarMantenimientoProductoSync(connection, id, grupoDatos);
        resultado.productosMantenimiento.eliminados++;
      }
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