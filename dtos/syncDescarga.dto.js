/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: syncDescarga.dto.js
Autor: Greivin Eliecer A.G
Fecha: 08/08/2026
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
    constructor({ fincas, estanques, productos, colaboradores, equipos, tareas, colaboradorId, grupoDatos }) {
        /*
        Descripcion:
        Empaqueta todos los catalogos en un objeto estructurado.

        Parametros:
        - fincas:        Array de fincas del grupo.
        - estanques:     Array de estanques del grupo.
        - productos:     Array de productos del grupo.
        - colaboradores: Array de colaboradores del grupo.
        - equipos:       Array de equipos del grupo.
        - tareas:        Array de tareas del grupo.
        - colaboradorId: ID del colaborador que descarga.
        - grupoDatos:    Grupo de datos del colaborador.

        Retorna:
        Objeto con todos los arreglos y metadatos de descarga.
        */
        this.fincas        = fincas        ?? [];
        this.estanques     = estanques     ?? [];
        this.productos     = productos     ?? [];
        this.colaboradores = colaboradores ?? [];
        this.equipos       = equipos       ?? [];
        this.tareas        = tareas        ?? [];
        this._meta = {
            grupoDatos,
            colaboradorId,
            fechaSincronizacion: new Date().toISOString(),
            totales: {
                fincas:        this.fincas.length,
                estanques:     this.estanques.length,
                productos:     this.productos.length,
                colaboradores: this.colaboradores.length,
                equipos:       this.equipos.length,
                tareas:        this.tareas.length,
            },
        };
    }
}