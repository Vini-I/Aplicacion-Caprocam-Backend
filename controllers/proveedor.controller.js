/**
 * proveedorController
 * Maneja las peticiones HTTP del modulo de proveedores.
 * Recibe req/res, delega la logica de negocio al service
 * y siempre responde con el formato JSON estandar del equipo.
 */

import ProveedorService from "../services/proveedor.service.js";

// GET /api/v1/proveedores
async function listarProveedores(req, res) {
  try {
    const proveedores = ProveedorService.listarProveedores();

    res.status(200).json({
      success: true,
      message: "Proveedores obtenidos correctamente",
      data: proveedores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "No se pudieron obtener los proveedores",
      error: error.message,
    });
  }
}

// GET /api/v1/proveedores/:id
async function obtenerProveedor(req, res) {
  try {
    const { id } = req.params;
    const proveedor = ProveedorService.obtenerProveedor(id);

    res.status(200).json({
      success: true,
      message: "Proveedor obtenido correctamente",
      data: proveedor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "No se pudo obtener el proveedor",
      error: error.message,
    });
  }
}

// POST /api/v1/proveedores
async function crearProveedor(req, res) {
  try {
    const nuevoProveedor = ProveedorService.crearProveedor(req.body);

    res.status(201).json({
      success: true,
      message: "Proveedor creado correctamente",
      data: nuevoProveedor,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "No se pudo crear el proveedor",
      error: error.message,
    });
  }
}

// PUT /api/v1/proveedores/:id
async function actualizarProveedor(req, res) {
  try {
    const { id } = req.params;
    const proveedorActualizado = ProveedorService.actualizarProveedor(id, req.body);

    res.status(200).json({
      success: true,
      message: "Proveedor actualizado correctamente",
      data: proveedorActualizado,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "No se pudo actualizar el proveedor",
      error: error.message,
    });
  }
}

// DELETE /api/v1/proveedores/:id
async function eliminarProveedor(req, res) {
  try {
    const { id } = req.params;
    const proveedorEliminado = ProveedorService.eliminarProveedor(id);

    res.status(200).json({
      success: true,
      message: "Proveedor eliminado correctamente",
      data: proveedorEliminado,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: "No se pudo eliminar el proveedor",
      error: error.message,
    });
  }
}

export default {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};