import ProveedorModel from "../models/proveedor.model.js";
import { proveedorDTO, proveedoresDTO } from "../dtos/proveedorDTO.js";

const TIPOS_PERMITIDOS = [
  "alimento",
  "antibioticos",
  "fertilizantes",
  "probioticos",
  "equipos",
];

function generarIniciales(nombre) {
  return nombre.trim().substring(0, 2).toUpperCase();
}

function validarDatos(datos) {
  if (!datos.nombre || !datos.nombre.trim()) {
    throw new Error("El nombre de la empresa es obligatorio");
  }

  if (!datos.tipoProducto) {
    throw new Error("El tipo de producto es obligatorio");
  }

  if (!TIPOS_PERMITIDOS.includes(datos.tipoProducto)) {
    throw new Error("El tipo de producto no es válido");
  }
}

function listarProveedores() {
  const proveedores = ProveedorModel.obtenerTodos();
  return proveedoresDTO(proveedores);
}

function obtenerProveedor(id) {
  const proveedor = ProveedorModel.obtenerPorId(id);
  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  return proveedorDTO(proveedor);
}

function crearProveedor(datos) {
  validarDatos(datos);

  const existente = ProveedorModel.buscarPorNombre(datos.nombre);
  if (existente) {
    throw new Error("Ya existe un proveedor con ese nombre");
  }

  const nuevoProveedor = ProveedorModel.crear({
    nombre: datos.nombre.trim(),
    iniciales: generarIniciales(datos.nombre),
    tipoProducto: datos.tipoProducto,
    telefono: datos.telefono || "",
    correo: datos.correo || "",
    direccion: datos.direccion || "",
    notas: datos.notas || "",
  });

  return proveedorDTO(nuevoProveedor);
}

function actualizarProveedor(id, datos) {
  const proveedor = ProveedorModel.obtenerPorId(id);
  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  if (datos.tipoProducto && !TIPOS_PERMITIDOS.includes(datos.tipoProducto)) {
    throw new Error("El tipo de producto no es válido");
  }

  if (datos.nombre) {
    datos.iniciales = generarIniciales(datos.nombre);
  }

  const proveedorActualizado = ProveedorModel.actualizar(id, datos);
  return proveedorDTO(proveedorActualizado);
}

function eliminarProveedor(id) {
  const proveedor = ProveedorModel.eliminar(id);
  if (!proveedor) {
    throw new Error("Proveedor no encontrado");
  }

  return proveedorDTO(proveedor);
}

export default {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};