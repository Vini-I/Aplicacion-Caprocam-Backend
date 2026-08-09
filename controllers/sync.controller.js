/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: sync.controller.js
Autor: Greivin Eliecer A.G
Fecha: 08/08/2026
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
import pool from "../config/database.js";

import { ColaboradorLoginDTO } from '../dtos/syncLogin.dto.js';
import { DescargaCatalogosDTO } from '../dtos/syncDescarga.dto.js';
import { SubidaCambiosDTO } from '../dtos/syncSubida.dto.js';

import * as ColaboradorModel from "../models/colaborador.model.js";
import * as FincaModel from "../models/finca.model.js";
import * as EstanquesModel from "../models/estanques.model.js";
import * as ProductoModel from "../models/producto.model.js";
import * as EquipoModel from "../models/equipo.model.js";
import * as TareaModel from "../models/tarea.model.js";

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
    - 200 con el token y datos basicos del colaborador
    - 400 si faltan campos
    - 401 si el PIN es incorrecto
    - 404 si la cedula no existe o el colaborador esta inactivo
    */
  try {
    const { cedula, pin } = req.body;

    if (!cedula || !pin) {
      return error(
        res,
        "La cedula y el PIN son requeridos para iniciar sesion.",
        null,
        400,
      );
    }

    const colaborador = await ColaboradorModel.findByCedula(
      String(cedula).trim(),
    );

    if (!colaborador) {
      return error(
        res,
        "No se encontro un colaborador activo con esa cedula.",
        null,
        404,
      );
    }

    // Verificar el PIN contra el hash almacenado
    const [filas] = await pool.execute(
      `SELECT pin_hash FROM colaboradores
             WHERE cedula = ? AND activo = TRUE AND deleted_at IS NULL
             LIMIT 1`,
      [String(cedula).trim()],
    );

    if (filas.length === 0 || !filas[0].pin_hash) {
      return error(
        res,
        "El colaborador no tiene un PIN configurado. Contacta al administrador.",
        null,
        403,
      );
    }

    const pinOk = await isPinValido(String(pin), filas[0].pin_hash);

    if (!pinOk) {
      return error(
        res,
        "PIN incorrecto. Verifica tu PIN e intentalo de nuevo.",
        null,
        401,
      );
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
    - req.grupoDatos:    Grupo de datos del colaborador (del token).
    - req.colaboradorId: ID del colaborador (del token).

    Retorna:
    - 200 con un objeto estructurado con todos los catalogos
    - 500 si ocurre un error en cualquiera de las consultas
    */
  try {
    const grupoDatos = req.grupoDatos;

    const [fincas, estanques, productos, colaboradores, equipos, tareas] =
      await Promise.all([
        FincaModel.findAll(grupoDatos),
        EstanquesModel.findAll({ grupoDatos }),
        ProductoModel.findAll(grupoDatos),
        ColaboradorModel.findAll(grupoDatos),
        EquipoModel.findAll({ grupoDatos }),
        TareaModel.findAll(grupoDatos),
      ]);

    return exito(
      res,
      "Catalogos descargados correctamente.",
      new DescargaCatalogosDTO({
        fincas,
        estanques,
        productos,
        colaboradores,
        equipos,
        tareas,
        colaboradorId: req.colaboradorId,
        grupoDatos,
      }),
    );
  } catch (err) {
    return error(res, "Error al descargar los catalogos.", err, 500);
  }
}

export async function subirCambios(req, res) {
  /*
    Descripcion:
    Ruta PROTEGIDA. Recibe el paquete de cambios realizados
    offline y los impacta en la DB dentro de una transaccion.
    Si algo falla, la transaccion se revierte (rollback).

    Parametros:
    - req.body: {
          tareas?: { crear: [], actualizar: [], eliminar: [] }
        }
      (Ampliar con los demas modulos segun se requiera)
    - req.grupoDatos: Grupo de datos del colaborador (del token).

    Retorna:
    - 200 con resumen de cambios aplicados e IDs nuevos
    - 400 si el paquete de cambios esta vacio o malformado
    - 500 si ocurre un error y se revierten los cambios
    */
  let connection;

  try {
    const grupoDatos = req.grupoDatos;
    const cambios = req.body;

    if (!cambios || typeof cambios !== "object") {
      return error(
        res,
        "El cuerpo de la peticion debe ser un objeto con los cambios a subir.",
        null,
        400,
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const resultado = {
      tareas: { creados: [], actualizados: 0, eliminados: 0 },
    };

    if (cambios.tareas) {
      const { crear = [], actualizar = [], eliminar = [] } = cambios.tareas;

      for (const tarea of crear) {
        const [result] = await connection.execute(
          `INSERT INTO tareas
                     (grupo_datos, codigo_tarea, nombre, descripcion, categoria, horas, estado)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            grupoDatos,
            tarea.codigoTarea ?? null,
            tarea.nombre ?? null,
            tarea.descripcion ?? null,
            tarea.categoria ?? null,
            tarea.horas ?? null,
            tarea.estado ?? "pendiente",
          ],
        );

        resultado.tareas.creados.push({
          idLocal: tarea.idLocal ?? null,
          idServidor: result.insertId,
        });
      }

      for (const tarea of actualizar) {
        const [check] = await connection.execute(
          `SELECT id FROM tareas WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
          [tarea.id, grupoDatos],
        );

        if (check.length === 0) continue;

        await connection.execute(
          `UPDATE tareas
                     SET nombre = ?, descripcion = ?, categoria = ?, horas = ?, estado = ?
                     WHERE id = ? AND grupo_datos = ?`,
          [
            tarea.nombre ?? null,
            tarea.descripcion ?? null,
            tarea.categoria ?? null,
            tarea.horas ?? null,
            tarea.estado ?? null,
            tarea.id,
            grupoDatos,
          ],
        );
        resultado.tareas.actualizados++;
      }

      for (const tareaId of eliminar) {
        const [check] = await connection.execute(
          `SELECT id FROM tareas WHERE id = ? AND grupo_datos = ? AND deleted_at IS NULL`,
          [tareaId, grupoDatos],
        );

        if (check.length === 0) continue; // No pertenece al grupo, ignorar

        await connection.execute(
          `UPDATE tareas
                     SET activo = FALSE, deleted_at = CURRENT_TIMESTAMP
                     WHERE id = ? AND grupo_datos = ?`,
          [tareaId, grupoDatos],
        );
        resultado.tareas.eliminados++;
      }
    }

    await connection.commit();

    return exito(
      res,
      "Cambios sincronizados correctamente.",
      new SubidaCambiosDTO({
        resultado,
        colaboradorId: req.colaboradorId,
        grupoDatos,
      }),
    );
  } catch (err) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Error al hacer rollback:", rollbackErr.message);
      }
    }
    return error(
      res,
      "Error al subir los cambios. Se revirtieron todos los cambios.",
      err,
      500,
    );
  } finally {
    if (connection) connection.release();
  }
}
