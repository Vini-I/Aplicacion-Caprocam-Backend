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
    laboratorios,
    procedencias,
    proveedoresLarva,
    lotesLarva,
    precrias,
    siembras,
    colaboradorId,
    grupoDatos,
  }) {
        /*
        Descripcion:
        Empaqueta todos los catalogos en un objeto estructurado.

        Parametros:
        - fincas:        Array de fincas del grupo.
        - estanques:     Array de estanques del grupo.
        - proveedores:   Array de proveedores del grupo.
        - productos:     Array de productos del grupo.
        - compradores:   Array de compradores del grupo.
        - inventario:    Array de inventario del grupo.
        - equipos:       Array de equipos del grupo.
        - tareas:        Array de tareas del grupo.
        - laboratorios:  Array de laboratorios del grupo.
        - procedencias:  Array de procedencias del grupo.
        - proveedoresLarva: Array de proveedores de larvas del grupo.
        - lotesLarva:    Array de lotes de larvas del grupo.
        - precrias:      Array de precrias del grupo.
        - siembras:      Array de siembras del grupo.
        - colaboradorId: ID del colaborador que descarga.
        - grupoDatos:    Grupo de datos del colaborador.

        Retorna:
        Objeto con todos los arreglos y metadatos de descarga.
        */

    this.fincas           = fincas           ?? [];
    this.estanques        = estanques        ?? [];
    this.proveedores      = proveedores      ?? [];
    this.productos        = productos        ?? [];
    this.compradores      = compradores      ?? [];
    this.inventario       = inventario       ?? [];
    this.equipos          = equipos          ?? [];
    this.tareas           = tareas           ?? [];
    this.laboratorios     = laboratorios     ?? [];
    this.procedencias     = procedencias     ?? [];
    this.proveedoresLarva = proveedoresLarva ?? [];
    this.lotesLarva       = lotesLarva       ?? [];
    this.precrias         = precrias         ?? [];
    this.siembras         = siembras         ?? [];
    this._meta = {
      grupoDatos,
      colaboradorId,
      fechaSincronizacion: new Date().toISOString(),
      totales: {
        fincas:           this.fincas.length,
        estanques:        this.estanques.length,
        proveedores:      this.proveedores.length,
        productos:        this.productos.length,
        compradores:      this.compradores.length,
        inventario:       this.inventario.length,
        equipos:          this.equipos.length,
        tareas:           this.tareas.length,
        laboratorios:     this.laboratorios.length,
        procedencias:     this.procedencias.length,
        proveedoresLarva: this.proveedoresLarva.length,
        lotesLarva:       this.lotesLarva.length,
        precrias:         this.precrias.length,
        siembras:         this.siembras.length,
      },
    };
  }
}