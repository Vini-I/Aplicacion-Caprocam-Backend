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

Librerias externas
*/

import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
import { isPinValido } from "../services/loginUsuarios.services.js";
import { exito, error } from "../common/respuestaJson.js";
import { obtenerContextoPeticion } from "../common/contextoPeticion.js";
import pool from "../config/database.js";

import { ColaboradorLoginDTO } from '../dtos/syncLogin.dto.js';
import { DescargaCatalogosDTO } from '../dtos/syncDescarga.dto.js';
import { SubidaCambiosDTO } from '../dtos/syncSubida.dto.js';

import * as ColaboradorModel   from "../models/colaborador.model.js";
import * as FincaModel         from "../models/finca.model.js";
import * as EstanquesModel     from "../models/estanques.model.js";
import * as ProductoModel      from "../models/producto.model.js";
import * as EquipoModel        from "../models/equipo.model.js";
import * as TareaModel         from "../models/tarea.model.js";
import * as ProveedorModel     from "../models/proveedor.model.js";
import * as CompradorModel     from "../models/comprador.model.js";
import * as InventarioModel    from "../models/inventario.model.js";
import * as LaboratorioModel   from "../models/laboratorio.model.js";
import * as ProcedenciaModel   from "../models/procedencia.model.js";
import * as ProveedorLarvaModel from "../models/proveedorLarva.model.js";
import * as LoteLarvaModel     from "../models/loteLarvas.model.js";
import * as PrecriaModel       from "../models/preCria.model.js";
import * as SiembraModel       from "../models/siembra.model.js";

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////
*/

function generarTokenColaborador(colaborador) {
  /*
    Descripcion:
    Genera un Access Token JWT exclusivo para colaboradores
    de campo, con duracion extendida (4 horas) pensada
    para jornadas de trabajo sin internet.

    Parametros:
    - colaborador: Objeto colaborador proveniente de la DB.

    Retorna:
    - String con el token firmado.
    */
  const payload = {
    id: colaborador.id,
    grupoDatos: colaborador.grupoDatos,
    rolId: colaborador.rolId,
    nombre: colaborador.nombre,
    accesoGlobal: false,
    esColaborador: true,
  };

  // 4 horas: pensado para media jornada de trabajo en campo
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "4h" });
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que manejan cada ruta
del modulo de sincronizacion.
*/

export async function loginColaborador(req, res) {
  /*
    Descripcion:
    Ruta PUBLICA. Autentica a un colaborador de campo
    usando su cedula y PIN de 4 digitos.

    Parametros:
    - req.body: { cedula, pin }

    Retorna:
    - 200 con token y datos del colaborador si el login es exitoso
    - 400 si faltan parametros
    - 404 si no se encuentra un colaborador activo con esa cedula
    - 403 si el colaborador no tiene un PIN configurado
    - 401 si el PIN es incorrecto
    - 500 si ocurre un error inesperado
    */
  try {
    const { cedula, pin } = req.body;
    if (!cedula || !pin) {
      return error(res, "La cedula y el PIN son requeridos.", null, 400);
    }

    const colaborador = await ColaboradorModel.findByCedula(String(cedula).trim());
    if (!colaborador) {
      return error(res, "No se encontro un colaborador activo con esa cedula.", null, 404);
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
  /*
    Descripcion:
    Ruta PROTEGIDA. Descarga todos los catalogos de la finca
    del colaborador autenticado en una sola respuesta masiva.
    El contexto (grupoDatos) viene inyectado por el middleware.

    Parametros:
    - req.grupoDatos: Grupo de datos del colaborador (del token).
    - req.colaboradorId: ID del colaborador autenticado (del token).

    Retorna:
    - 200 con todos los catalogos en un solo objeto
    - 500 si ocurre un error inesperado
    */
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
  /*
  Descripcion:
  Movil -> Nube: recibe todos los registros operativos creados
  offline y los impacta en MySQL dentro de una transaccion.
  Si algo falla, se hace rollback completo.

  Estructura esperada del body:
  {
    alimentacion?:         { crear: [], actualizar: [], eliminar: [] },
    crecimiento?:          { crear: [], actualizar: [], eliminar: [] },
    calculosCrecimiento?:  { crear: [], actualizar: [], eliminar: [] },
    fisicoQuimica?:        { crear: [], actualizar: [], eliminar: [] },
    detalleFisicoQuimica?: { crear: [], actualizar: [], eliminar: [] },
    densidadPoblacional?:  { crear: [], actualizar: [], eliminar: [] },
    detalleTirosDensidad?: { crear: [], actualizar: [], eliminar: [] },
    enfermedades?:         { crear: [], actualizar: [], eliminar: [] },
    parasitologias?:       { crear: [], actualizar: [], eliminar: [] },
    raleos?:               { crear: [], actualizar: [], eliminar: [] },
    ventas?:               { crear: [], actualizar: [], eliminar: [] },
    trazabilidad?:         { crear: [], actualizar: [], eliminar: [] },
    movimientosInventario?:{ crear: [], actualizar: [], eliminar: [] },
    mantenimientos?:       { crear: [], actualizar: [], eliminar: [] },
    tareasMantenimiento?:  { crear: [], actualizar: [], eliminar: [] },
    productosMantenimiento?:{ crear: [], actualizar: [], eliminar: [] },
  }

  Parametros:
    - req.colaboradorId: ID del colaborador autenticado (del token).
    - req.grupoDatos: Grupo de datos del colaborador (del token).

    Retorna:
    - 200 con resumen de cambios aplicados e IDs nuevos
    - 400 si el paquete de cambios esta vacio o malformado
    - 500 si ocurre un error y se revierten los cambios
    */
  
  // Función ayudante incluida
  function resolverIdForanea(idLocal, listaCreados = [], listaActualizados = []) {
    if (!idLocal) return null;
    const matchCreado = listaCreados.find((c) => c.idLocal == idLocal);
    if (matchCreado) return matchCreado.idServidor;
    const matchActualizado = listaActualizados.find((c) => c.id == idLocal && (c.servidor_id || c.servidorId));
    if (matchActualizado) return matchActualizado.servidor_id ?? matchActualizado.servidorId;
    return idLocal; 
  }

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

    // ─────────────────────────────────────────────────────────────
    // ALIMENTACION
    // ─────────────────────────────────────────────────────────────
    if (cambios.alimentacion) {
      resultado.alimentacion = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.alimentacion;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO alimentaciones
           (grupo_datos, finca_id, estanque_id, proveedor_id, producto_id, 
           fecha, hora, metodo, cantidad_kg, observaciones, creado_por_colaborador_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null,
            r.proveedorId ?? r.proveedor_id ?? null, r.productoId ?? r.producto_id ?? null,
            r.fecha ?? null, r.hora ?? null, r.metodo ?? null, r.cantidadKg ?? r.cantidad_kg ?? null,
            r.observaciones ?? null, creadoPorColaboradorId,
          ]
        );
        resultado.alimentacion.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;
        const [check] = await connection.execute(`SELECT id FROM alimentaciones WHERE id=? 
          AND grupo_datos=? AND deleted_at IS NULL`, [idReal, grupoDatos]);
        if (check.length > 0) {
          await connection.execute(`UPDATE alimentaciones SET fecha=?, hora=?, metodo=?, 
            cantidad_kg=?, observaciones=? WHERE id=? AND grupo_datos=?`,
            [r.fecha, r.hora, r.metodo, r.cantidadKg ?? r.cantidad_kg, r.observaciones, idReal, grupoDatos]);
          resultado.alimentacion.actualizados++;
        }
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE alimentaciones SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.alimentacion.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // CRECIMIENTO (PADRE)
    // ─────────────────────────────────────────────────────────────
    if (cambios.crecimiento) {
      resultado.crecimiento = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.crecimiento;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO crecimientos (grupo_datos, finca_id, estanque_id, 
          fecha_registro, peso_actual, creado_por_colaborador_id) VALUES (?,?,?,?,?,?)`,
          [
            grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null,
            r.fechaRegistro ?? r.fecha_registro ?? null, r.pesoActual ?? r.peso_actual ?? null, creadoPorColaboradorId,
          ]
        );
        resultado.crecimiento.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;
        const [check] = await connection.execute(`SELECT id FROM crecimientos 
          WHERE id=? AND grupo_datos=? AND deleted_at IS NULL`, [idReal, grupoDatos]);
        if (check.length > 0) {
          await connection.execute(`UPDATE crecimientos SET 
            fecha_registro=?, peso_actual=? WHERE id=? AND grupo_datos=?`,
            [r.fechaRegistro ?? r.fecha_registro, r.pesoActual ?? r.peso_actual, idReal, grupoDatos]);
          resultado.crecimiento.actualizados++;
        }
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE crecimientos SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.crecimiento.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // CALCULOS DE CRECIMIENTO (HIJO)
    // ─────────────────────────────────────────────────────────────
    if (cambios.calculosCrecimiento) {
      resultado.calculosCrecimiento = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.calculosCrecimiento;
      for (const r of crear) {
        const mappedCrecimientoId = resolverIdForanea(r.crecimientoId ?? r.crecimiento_id, resultado.crecimiento?.creados, cambios.crecimiento?.actualizar);
        const [res2] = await connection.execute(
          `INSERT INTO calculos_crecimiento
           (grupo_datos, crecimiento_id, cantidad_individuos, peso_total,
           peso_promedio_individual, creado_por_colaborador_id)
           VALUES (?,?,?,?,?,?)`,
          [
            grupoDatos, mappedCrecimientoId, r.cantidadIndividuos ?? r.cantidad_individuos ?? null,
            r.pesoTotal ?? r.peso_total ?? null, r.pesoPromedioIndividual ?? r.peso_promedio_individual ?? null, creadoPorColaboradorId,
          ]
        );
        resultado.calculosCrecimiento.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;
        const [check] = await connection.execute(
          `SELECT id FROM calculos_crecimiento WHERE id=? AND grupo_datos=?`, [idReal, grupoDatos]);
        if (check.length > 0) {
          await connection.execute(`UPDATE calculos_crecimiento SET 
            cantidad_individuos=?, peso_total=?, peso_promedio_individual=?
            WHERE id=? AND grupo_datos=?`,
            [r.cantidadIndividuos ?? r.cantidad_individuos, r.pesoTotal ?? r.peso_total, 
             r.pesoPromedioIndividual ?? r.peso_promedio_individual, idReal, grupoDatos]);
          resultado.calculosCrecimiento.actualizados++;
        }
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE calculos_crecimiento SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.calculosCrecimiento.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // FISICO QUIMICA (PADRE) - Modificado: Sin creado_por_colaborador_id
    // ─────────────────────────────────────────────────────────────
    if (cambios.fisicoQuimica) {
      resultado.fisicoQuimica = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.fisicoQuimica;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO fisico_quimico (grupo_datos, finca_id, estanque_id, fecha_registro) VALUES (?,?,?,?)`,
          [grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null, r.fechaRegistro ?? r.fecha_registro ?? null]
        );
        resultado.fisicoQuimica.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE fisico_quimico SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.fisicoQuimica.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // DETALLE FISICO QUIMICA (HIJO) - Modificado: Sin creado_por_colaborador_id
    // ─────────────────────────────────────────────────────────────
    if (cambios.detalleFisicoQuimica) {
      resultado.detalleFisicoQuimica = { creados: [], eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.detalleFisicoQuimica;
      for (const r of crear) {
        const mappedLecturaId = resolverIdForanea(r.lecturaId ?? r.lectura_id, resultado.fisicoQuimica?.creados, cambios.fisicoQuimica?.actualizar);
        const [res2] = await connection.execute(
          `INSERT INTO fisico_quimico_detalle (lectura_id, tipo_medicion, etiqueta, valor) VALUES (?,?,?,?)`,
          [mappedLecturaId, r.tipoMedicion ?? r.tipo_medicion ?? null, r.etiqueta ?? null, r.valor ?? null]
        );
        resultado.detalleFisicoQuimica.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE fisico_quimico_detalle SET activo=FALSE, deleted_at=CURRENT_TIMESTAMP WHERE id=?`, [id]);
        resultado.detalleFisicoQuimica.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // DENSIDAD POBLACIONAL (PADRE)
    // ─────────────────────────────────────────────────────────────
    if (cambios.densidadPoblacional) {
      resultado.densidadPoblacional = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.densidadPoblacional;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO densidad_poblacional (grupo_datos, finca_id, estanque_id, 
          fecha, cantidad_siembra, area_estanque, total_camarones_muestra, tiros_atarraya, 
          area_atarraya, area_muestreada, promedio_por_tiro, poblacion_estimada, sobrevivencia, 
          densidad, notas_conteo, creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null, r.fecha ?? null,
            r.cantidadSiembra ?? r.cantidad_siembra ?? null, r.areaEstanque ?? r.area_estanque ?? null,
            r.totalCamaronesMuestra ?? r.total_camarones_muestra ?? null, r.tirosAtarraya ?? r.tiros_atarraya ?? null,
            r.areaAtarraya ?? r.area_atarraya ?? null, r.areaMuestreada ?? r.area_muestreada ?? null,
            r.promedioPorTiro ?? r.promedio_por_tiro ?? null, r.poblacionEstimada ?? r.poblacion_estimada ?? null,
            r.sobrevivencia ?? null, r.densidad ?? null, r.notasConteo ?? r.notas_conteo ?? null, creadoPorColaboradorId,
          ]
        );
        resultado.densidadPoblacional.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE densidad_poblacional SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.densidadPoblacional.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // DETALLE TIROS DENSIDAD (HIJO) - Modificado: Sin grupo_datos y sin creado_por_colaborador_id
    // ─────────────────────────────────────────────────────────────
    if (cambios.detalleTirosDensidad) {
      resultado.detalleTirosDensidad = { creados: [], eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.detalleTirosDensidad;
      for (const r of crear) {
        const mappedDensidadId = resolverIdForanea(r.densidadId ?? r.densidad_id, resultado.densidadPoblacional?.creados, cambios.densidadPoblacional?.actualizar);
        const [res2] = await connection.execute(
          `INSERT INTO densidad_detalle_tiros (densidad_id, numero_tiro, cantidad_camarones) VALUES (?,?,?)`,
          [mappedDensidadId, r.numeroTiro ?? r.numero_tiro ?? null, r.cantidadCamarones ?? r.cantidad_camarones ?? null]
        );
        resultado.detalleTirosDensidad.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE densidad_detalle_tiros SET activo=FALSE, deleted_at=CURRENT_TIMESTAMP WHERE id=?`, [id]);
        resultado.detalleTirosDensidad.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // ENFERMEDADES, PARASITOLOGIAS, RALEOS, VENTAS, TRAZABILIDAD Y MOV. INVENTARIO
    // ─────────────────────────────────────────────────────────────
    if (cambios.enfermedades) {
      resultado.enfermedades = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.enfermedades;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO enfermedades (grupo_datos, finca_id, estanque_id,
          tipo_registro, fecha_reporte, responsable, enfermedad, severidad, reporte, 
          creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null, r.tipoRegistro ?? r.tipo_registro ?? null, r.fechaReporte ?? r.fecha_reporte ?? null, r.responsable ?? null, r.enfermedad ?? null, r.severidad ?? null, r.reporte ?? null, creadoPorColaboradorId]
        );
        resultado.enfermedades.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE enfermedades SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.enfermedades.eliminados++;
      }
    }

    if (cambios.parasitologias) {
      resultado.parasitologias = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.parasitologias;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO parasitologias (grupo_datos, finca_id, estanque_id, tipo_registro, 
          fecha_reporte, responsable, parasito, grado_infeccion, observaciones, 
          creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null, r.tipoRegistro ?? r.tipo_registro ?? null, r.fechaReporte ?? r.fecha_reporte ?? null, r.responsable ?? null, r.parasito ?? null, r.gradoInfeccion ?? r.grado_infeccion ?? null, r.observaciones ?? null, creadoPorColaboradorId]
        );
        resultado.parasitologias.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE parasitologias SET activo=FALSE, deleted_at=CURRENT_TIMESTAMP 
          WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.parasitologias.eliminados++;
      }
    }

    if (cambios.raleos) {
      resultado.raleos = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.raleos;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO raleos (grupo_datos, finca_id, estanque_id, siembra_id, fecha, porcentaje, kg_retirados, biomasa_restante, biomasa_estimada, observaciones, creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null, r.siembraId ?? r.siembra_id ?? null, r.fecha ?? null, r.porcentaje ?? null, r.kgRetirados ?? r.kg_retirados ?? null, r.biomasaRestante ?? r.biomasa_restante ?? null, r.biomasaEstimada ?? r.biomasa_estimada ?? null, r.observaciones ?? null, creadoPorColaboradorId]
        );
        resultado.raleos.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE raleos SET activo=FALSE, deleted_at=CURRENT_TIMESTAMP 
          WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.raleos.eliminados++;
      }
    }

    if (cambios.ventas) {
      resultado.ventas = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.ventas;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO ventas (grupo_datos, finca_id, estanque_id, comprador_id, 
          peso_promedio, cantidad_vendida, precio_kilo, total, fecha, 
          creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueId ?? r.estanque_id ?? null, r.compradorId ?? r.comprador_id ?? null, r.pesoPromedio ?? r.peso_promedio ?? null, r.cantidadVendida ?? r.cantidad_vendida ?? null, r.precioKilo ?? r.precio_kilo ?? null, r.total ?? null, r.fecha ?? null, creadoPorColaboradorId]
        );
        resultado.ventas.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE ventas SET activo=FALSE, deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.ventas.eliminados++;
      }
    }

    if (cambios.trazabilidad) {
      resultado.trazabilidad = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.trazabilidad;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO trazabilidad (grupo_datos, finca_id, estanque_origen_id, estanque_destino_id, 
          fecha, tamano, dias, pl, tipo_movimiento, creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [grupoDatos, r.fincaId ?? r.finca_id ?? null, r.estanqueOrigenId ?? r.estanque_origen_id ?? null, r.estanqueDestinoId ?? r.estanque_destino_id ?? null, r.fecha ?? null, r.tamano ?? null, r.dias ?? null, r.pl ?? null, r.tipoMovimiento ?? r.tipo_movimiento ?? null, creadoPorColaboradorId]
        );
        resultado.trazabilidad.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE trazabilidad SET activo=FALSE, deleted_at=CURRENT_TIMESTAMP 
          WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.trazabilidad.eliminados++;
      }
    }

    if (cambios.movimientosInventario) {
      resultado.movimientosInventario = { creados: [], eliminados: 0 };
      const { crear = [], eliminar = [] } = cambios.movimientosInventario;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO movimientos_inventario (grupo_datos, inventario_id, producto_id, 
          tipo_movimiento, cantidad, observacion, fecha_movimiento, creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?)`,
          [grupoDatos, r.inventarioId ?? r.inventario_id ?? null, r.productoId ?? r.producto_id ?? null, r.tipoMovimiento ?? r.tipo_movimiento ?? null, r.cantidad ?? null, r.observacion ?? null, r.fechaMovimiento ?? r.fecha_movimiento ?? null, creadoPorColaboradorId]
        );
        resultado.movimientosInventario.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE movimientos_inventario SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.movimientosInventario.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // MANTENIMIENTOS (PADRE)
    // ─────────────────────────────────────────────────────────────
    if (cambios.mantenimientos) {
      resultado.mantenimientos = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.mantenimientos;
      for (const r of crear) {
        const [res2] = await connection.execute(
          `INSERT INTO mantenimiento_equipo (grupo_datos, equipo_id, codigo_ticket, fecha_mantenimiento, 
          titulo_ticket, descripcion_ticket, tipo_personal, costo_mano_obra, costo_productos,
           costo_total_estimado, estado_ticket, creado_por_colaborador_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            grupoDatos, r.equipoId ?? r.equipo_id ?? null, r.codigoTicket ?? r.codigo_ticket ?? null, r.fechaMantenimiento ?? r.fecha_mantenimiento ?? null,
            r.tituloTicket ?? r.titulo_ticket ?? null, r.descripcionTicket ?? r.descripcion_ticket ?? null, r.tipoPersonal ?? r.tipo_personal ?? null,
            r.costoManoObra ?? r.costo_mano_obra ?? 0, r.costoProductos ?? r.costo_productos ?? 0, r.costoTotalEstimado ?? r.costo_total_estimado ?? 0,
            r.estadoTicket ?? r.estado_ticket ?? "En espera", creadoPorColaboradorId,
          ]
        );
        resultado.mantenimientos.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;
        const [check] = await connection.execute(`SELECT id FROM mantenimiento_equipo WHERE id=? 
          AND grupo_datos=? AND deleted_at IS NULL`, [idReal, grupoDatos]);
        if (check.length > 0) {
          await connection.execute(`UPDATE mantenimiento_equipo SET titulo_ticket=?, 
            descripcion_ticket=?, estado_ticket=?, version=version+1 WHERE id=? AND grupo_datos=?`,
            [r.tituloTicket ?? r.titulo_ticket, r.descripcionTicket ?? r.descripcion_ticket, r.estadoTicket ?? r.estado_ticket, idReal, grupoDatos]);
          resultado.mantenimientos.actualizados++;
        }
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE mantenimiento_equipo SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.mantenimientos.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // TAREAS DE MANTENIMIENTO (HIJO) - Modificado: Sin creado_por_colaborador_id
    // ─────────────────────────────────────────────────────────────
    if (cambios.tareasMantenimiento) {
      resultado.tareasMantenimiento = { creados: [], actualizados: 0, eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.tareasMantenimiento;
      for (const r of crear) {
        const mappedMantenimientoId = resolverIdForanea(r.mantenimientoId ?? r.mantenimiento_id ?? r.mantenimiento_equipo_id, resultado.mantenimientos?.creados, cambios.mantenimientos?.actualizar);
        const [res2] = await connection.execute(
          `INSERT INTO mantenimiento_equipo_tareas (grupo_datos, mantenimiento_equipo_id, tarea_id, estado_tarea) VALUES (?,?,?,?)`,
          [grupoDatos, mappedMantenimientoId, r.tareaId ?? r.tarea_id ?? null, r.estadoTarea ?? r.estado_tarea ?? "Pendiente"]
        );
        resultado.tareasMantenimiento.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const r of actualizar) {
        const idReal = r.servidor_id ?? r.servidorId ?? r.id;
        const [check] = await connection.execute(`SELECT id FROM mantenimiento_equipo_tareas 
          WHERE id=? AND grupo_datos=? AND deleted_at IS NULL`, [idReal, grupoDatos]);
        if (check.length > 0) {
          await connection.execute(`UPDATE mantenimiento_equipo_tareas SET estado_tarea=?, 
            version=version+1 WHERE id=? AND grupo_datos=?`,
            [r.estadoTarea ?? r.estado_tarea, idReal, grupoDatos]);
          resultado.tareasMantenimiento.actualizados++;
        }
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE mantenimiento_equipo_tareas SET activo=FALSE, 
          deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.tareasMantenimiento.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // PRODUCTOS USADOS EN MANTENIMIENTO (HIJO) - Modificado: Sin creado_por_colaborador_id
    // ─────────────────────────────────────────────────────────────
    if (cambios.productosMantenimiento) {
      resultado.productosMantenimiento = { creados: [], eliminados: 0 };
      const { crear = [], actualizar = [], eliminar = [] } = cambios.productosMantenimiento;
      for (const r of crear) {
        const mappedMantenimientoId = resolverIdForanea(r.mantenimientoId ?? r.mantenimiento_id ?? r.mantenimiento_equipo_id, resultado.mantenimientos?.creados, cambios.mantenimientos?.actualizar);
        const [res2] = await connection.execute(
          `INSERT INTO mantenimiento_equipo_productos (grupo_datos, mantenimiento_equipo_id
          , producto_id, cantidad, costo_unitario, subtotal) VALUES (?,?,?,?,?,?)`,
          [grupoDatos, mappedMantenimientoId, r.productoId ?? r.producto_id ?? null, r.cantidad ?? null, r.costoUnitario ?? r.costo_unitario ?? 0, r.subtotal ?? 0]
        );
        resultado.productosMantenimiento.creados.push({ idLocal: r.idLocal ?? r.id ?? null, idServidor: res2.insertId });
      }
      for (const id of eliminar) {
        await connection.execute(`UPDATE mantenimiento_equipo_productos SET 
          activo=FALSE, deleted_at=CURRENT_TIMESTAMP WHERE id=? AND grupo_datos=?`, [id, grupoDatos]);
        resultado.productosMantenimiento.eliminados++;
      }
    }

    // ─────────────────────────────────────────────────────────────
    // REGISTRAR HISTORIAL DE SINCRONIZACIÓN
    // ─────────────────────────────────────────────────────────────
    const androidId = req.body.androidId ?? req.headers['x-android-id'] ?? 'desconocido';

    let totalCreados = 0, totalActualizados = 0, totalEliminados = 0;
    for (const modulo of Object.values(resultado)) {
      totalCreados     += modulo.creados?.length  ?? 0;
      totalActualizados += modulo.actualizados    ?? 0;
      totalEliminados   += modulo.eliminados      ?? 0;
    }
    const totalRegistros = totalCreados + totalActualizados + totalEliminados;

    if (totalRegistros > 0) {
      await connection.execute(
        `INSERT INTO historial_sincronizaciones
         (grupo_datos, colaborador_id, android_id,
          total_creados, total_actualizados, total_eliminados, total_registros, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'exitoso')`,
        [
          grupoDatos,
          creadoPorColaboradorId,
          androidId,
          totalCreados,
          totalActualizados,
          totalEliminados,
          totalRegistros,
        ]
      );
    }

    await connection.commit();
    return exito(
      res,
      "Cambios sincronizados correctamente.",
      new SubidaCambiosDTO({ resultado, creadoPorColaboradorId, grupoDatos })
    );
  } catch (err) {
    if (connection) {
      try { 
        await connection.rollback();
      } 
      catch (re) { 
        console.error("Rollback error:", re.message); 
      }
    }
    return error(
      res, 
      "Error al subir los cambios. Se revirtieron todos los cambios.", 
      err, 
      500);
  } finally {
    if (connection) connection.release();
  }
}