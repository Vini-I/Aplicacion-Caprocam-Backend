/**
 * ProveedorModel
 * Simula el acceso a base de datos para el modulo de proveedores.
 * Mientras no exista conexion a MySQL, los datos viven en memoria.
 * Cuando se conecte la base de datos real, solo este archivo
 * debe modificarse; el service y el controller no cambian.
 */

let proveedores = [
  {
    id: 1,
    nombre: "Biomar S.A.",
    iniciales: "BI",
    tipoProducto: "alimento",
    telefono: "+506 2200-1100",
    correo: "ventas@biomar.cr",
    direccion: "Puntarenas, Costa Rica",
    notas: "Proveedor principal de alimento balanceado.",
    activo: true,
  },
  {
    id: 2,
    nombre: "Farivet",
    iniciales: "FA",
    tipoProducto: "antibioticos",
    telefono: "+506 2245-8800",
    correo: "info@farivet.com",
    direccion: "Alajuela, Costa Rica",
    notas: "",
    activo: true,
  },
  {
    id: 3,
    nombre: "Trisan",
    iniciales: "TR",
    tipoProducto: "fertilizantes",
    telefono: "+506 2299-1234",
    correo: "clientes@trisan.co.cr",
    direccion: "Cartago, Costa Rica",
    notas: "",
    activo: true,
  },
];

let siguienteId = 4;

// Devuelve todos los proveedores activos (no eliminados logicamente)
function obtenerTodos() {
  return proveedores.filter((proveedor) => proveedor.activo === true);
}

// Busca un proveedor activo por su id
function obtenerPorId(id) {
  return proveedores.find(
    (proveedor) => proveedor.id === Number(id) && proveedor.activo === true
  );
}

// Busca un proveedor activo por nombre exacto, sin distinguir mayusculas
function buscarPorNombre(nombre) {
  const nombreNormalizado = nombre.trim().toLowerCase();

  return proveedores.find(
    (proveedor) =>
      proveedor.nombre.toLowerCase() === nombreNormalizado &&
      proveedor.activo === true
  );
}


function crear(datos) {
  const nuevoProveedor = {
    id: siguienteId,
    activo: true,
    ...datos,
  };

  proveedores.push(nuevoProveedor);
  siguienteId = siguienteId + 1;

  return nuevoProveedor;
}


function actualizar(id, datos) {
  const indice = proveedores.findIndex(
    (proveedor) => proveedor.id === Number(id) && proveedor.activo === true
  );

  if (indice === -1) {
    return null;
  }

  proveedores[indice] = {
    ...proveedores[indice],
    ...datos,
  };

  return proveedores[indice];
}

// Borrado logico: marca el proveedor como inactivo en vez de eliminarlo
function eliminar(id) {
  const indice = proveedores.findIndex(
    (proveedor) => proveedor.id === Number(id) && proveedor.activo === true
  );

  if (indice === -1) {
    return null;
  }

  proveedores[indice].activo = false;

  return proveedores[indice];
}

export default {
  obtenerTodos,
  obtenerPorId,
  buscarPorNombre,
  crear,
  actualizar,
  eliminar,
};