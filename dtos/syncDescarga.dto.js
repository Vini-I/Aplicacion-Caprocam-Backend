/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncDescarga.dto.js
Autor: Greivin Eliecer A.G
Fecha: 13/08/2026
Modulo: Sincronizacion
Descripcion:
DTO para la descarga de catalogos del modulo de sincronizacion.
Estructura y empaqueta la base de datos filtrada por el
contexto del colaborador para poblar el SQLite local.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO DE DESCARGA MASIVA
//////////////////////////////////////////////////////////
*/

export class DescargaCatalogosDTO {
  constructor({
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
    colaboradorId,
    grupoDatos,
  }) {
    this.fincas = fincas ?? [];
    this.estanques = estanques ?? [];
    this.proveedores = proveedores ?? [];
    this.productos = productos ?? [];
    this.compradores = compradores ?? [];
    this.inventario = inventario ?? [];
    this.equipos = equipos ?? [];
    this.tareas = tareas ?? [];

    this.mantenimientos = mantenimientos ?? [];
    this.mantenimientoTareas = mantenimientoTareas ?? [];
    this.mantenimientoProductos = mantenimientoProductos ?? [];

    this.laboratorios = laboratorios ?? [];
    this.procedencias = procedencias ?? [];
    this.proveedoresLarva = proveedoresLarva ?? [];
    this.lotesLarva = lotesLarva ?? [];
    this.precrias = precrias ?? [];
    this.siembras = siembras ?? [];

    this._meta = {
      grupoDatos,
      colaboradorId,
      fechaSincronizacion: new Date().toISOString(),
      totales: {
        fincas: this.fincas.length,
        estanques: this.estanques.length,
        proveedores: this.proveedores.length,
        productos: this.productos.length,
        compradores: this.compradores.length,
        inventario: this.inventario.length,
        equipos: this.equipos.length,
        tareas: this.tareas.length,
        mantenimientos: this.mantenimientos.length,
        mantenimientoTareas: this.mantenimientoTareas.length,
        mantenimientoProductos: this.mantenimientoProductos.length,
        laboratorios: this.laboratorios.length,
        procedencias: this.procedencias.length,
        proveedoresLarva: this.proveedoresLarva.length,
        lotesLarva: this.lotesLarva.length,
        precrias: this.precrias.length,
        siembras: this.siembras.length,
      },
    };
  }
}