# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto.
En el futuro se migrara a Swagger.

---

# Colaboradores
## GET /api/v0/colaboradores

Obtiene todos los colaboradores.

Respuesta:
200 OK
{
"success": true,
"message": "Colaboradores obtenidos correctamente.",
"data": [ ... ]
}

---

## GET /api/v0/colaboradores/:id

Obtiene un colaborador por su ID.

Parametros URL:

- id: ID numerico del colaborador.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Colaborador obtenido correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Colaborador no encontrado.",
"error": null
}

---

## POST /api/v0/colaboradores

Crea un nuevo colaborador.

Body (JSON):
{
"nombre": "Carlos",
"apellidos": "Jiménez",
"telefono": "66665555",
"email": "carlos@empresa.com",
"rol": "colaborador"
}

Respuesta exitosa:
201 Created
{
"success": true,
"message": "Colaborador creado correctamente.",
"data": { ... }
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Faltan campos requeridos: rol.",
"error": null
}

---

## PUT /api/v0/colaboradores/:id

Actualiza un colaborador existente.

Parametros URL:

- id: ID numerico del colaborador.

Body (JSON):
{
"nombre": "Carlos",
"apellidos": "Jiménez Corrected",
"telefono": "66665555",
"email": "carlos@empresa.com",
"rol": "supervisor"
}

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Colaborador actualizado correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Colaborador no encontrado.",
"error": null
}

---

## DELETE /api/v0/colaboradores/:id

Elimina un colaborador por su ID.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Colaborador eliminado correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Colaborador no encontrado.",
"error": null
}

---

# Densidad Poblacional
## GET /api/v0/densidad-poblacional

Obtiene todos los registros de densidad poblacional.

Respuesta:
200 OK
{
"success": true,
"message": "Registros obtenidos correctamente.",
"data": [ ... ]
}

## GET /api/v0/densidad-poblacional/:id

Obtiene un registro por su ID.

Parametros URL:

- id: ID numerico del registro.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro obtenido correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

## POST /api/v0/densidad-poblacional

Crea un nuevo registro de densidad poblacional.

Body (JSON):
{
"finca": 1,
"estanque": 2,
"fecha": "2026-06-29",
"cantidadSiembra": 20,
"areaEstanque": 3000,
"metodoConteo": "Directo",
"numeroCamarones": 250,
"tirosAtarraya": 6,
"areaAtarraya": 4.5,
"promedioPorTiro": 41.6,
"sobrevivencia": 89,
"notasConteo": "Conteo inicial"
}

## PUT /api/v0/densidad-poblacional/:id

Actualiza un registro existente.

Parametros URL:

- id: ID numerico del registro.

Body (JSON):
{
"finca": 2,
"estanque": 1,
"fecha": "2026-06-30",
"cantidadSiembra": 22,
"areaEstanque": 2800,
"metodoConteo": "Directo",
"numeroCamarones": 260,
"tirosAtarraya": 5,
"areaAtarraya": 3.5,
"promedioPorTiro": 52,
"sobrevivencia": 91,
"notasConteo": "Actualizacion"
}

## DELETE /api/v0/densidad-poblacional/:id

Elimina un registro por su ID.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro eliminado correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

# Estanques

## GET /api/v0/estanques

Obtiene todos los estanques registrados.

Respuesta:
200 OK
{
"success": true,
"message": "Registros obtenidos correctamente.",

    "message": "Estanques obtenidos correctamente.",
    "data": [ ... ]

}

---

## GET /api/v0/estanques/:id

Obtiene un estanque por su ID.

Parametros URL:

- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro obtenido correctamente.",

    "message": "Estanque obtenido correctamente.",
    "data": { ... }

}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",

    "message": "Estanque no encontrado.",
    "error": null

}

---

## POST /api/v0/estanques

Crea un nuevo estanque.

Body (JSON):
{
"idFinca": 1,
"codigo": "EST-003",
"tipoEstanque": "Engorde",
"estado": "Activo",
"largo": 100,
"ancho": 80,
"profundidad": 1,
"fuenteAgua": "Pozo",
"especie": "Litopenaeus vannamei - Camaron blanco",
"fechaSiembra": "29/06/2026",
"fechaInicioEngorde": "29/06/2026",
"fechaMantenimiento": "29/06/2026",
"densidadSiembra": 12,
"usaPrecria": false,
"metodoAlimentacion": "Manual",
"proveedorAlimento": "Biomar",
"numeroAireadores": 2,
"tieneAlimentadorAutomatico": false
}

Respuesta exitosa:
201 Created
{
"success": true,
"message": "Registro creado correctamente.",

    "message": "Estanque creado correctamente.",
    "data": { ... }

}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Faltan campos requeridos.",

    "message": "Faltan campos requeridos: codigo.",
    "error": null

}

Respuesta de error:
409 Conflict
{
"success": false,
"message": "Ya existe un estanque con ese codigo en la finca.",
"error": null
}

---

## PUT /api/v0/estanques/:id

Actualiza un estanque existente.

Parametros URL:

- id: ID numerico del estanque.

Body (JSON):
{
"idFinca": 1,
"codigo": "EST-003",
"tipoEstanque": "Engorde",
"estado": "Mantenimiento",
"largo": 100,
"ancho": 80,
"profundidad": 1,
"fuenteAgua": "Pozo",
"especie": "Litopenaeus vannamei - Camaron blanco",
"fechaSiembra": "29/06/2026",
"fechaInicioEngorde": "29/06/2026",
"fechaMantenimiento": "29/06/2026",
"densidadSiembra": 12,
"usaPrecria": false,
"metodoAlimentacion": "Manual",
"proveedorAlimento": "Biomar",
"numeroAireadores": 2,
"tieneAlimentadorAutomatico": false
}

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro actualizado correctamente.",

    "message": "Estanque actualizado correctamente.",
    "data": { ... }

}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",

    "message": "Estanque no encontrado.",
    "error": null

}

Respuesta de error:
409 Conflict
{
"success": false,
"message": "Ya existe otro estanque con ese codigo en la finca.",
"error": null
}

---

## DELETE /api/v0/estanques/:id

Elimina un estanque por su ID.

Parametros URL:

- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro eliminado correctamente.",

    "message": "Estanque eliminado correctamente.",
    "data": { ... }

}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",

    "message": "Estanque no encontrado.",
    "error": null

}

# Crecimiento
## GET /api/v0/crecimiento

Obtiene todos los registros de crecimiento disponibles en la mockdata.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registros de crecimiento obtenidos correctamente.",
"data": [
{
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoActual": 2.5
},
{
"id": "2",
"finca": "Finca La Perla",
"estanque": "EST-02",
"pesoActual": 3.1
}
]
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

---

## GET /api/v0/crecimiento/:id

Obtiene un registro de crecimiento por su ID.

Parametros URL:

- id: Identificador del registro.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro obtenido correctamente.",
"data": {
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoActual": 2.5
}
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

---

## POST /api/v0/crecimiento

Crea un nuevo registro de crecimiento.

Body (JSON):
{
"id": "3",
"finca": "Finca La Perla",
"estanque": "EST-03",
"pesoActual": 4.2
}

Campos requeridos:

- finca
- estanque
- pesoActual

Respuesta exitosa:
201 Created
{
"success": true,
"message": "Registro de crecimiento creado correctamente.",
"data": {
"id": "3",
"finca": "Finca La Perla",
"estanque": "EST-03",
"pesoActual": 4.2
}
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Finca y estanque son requeridos.",
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "El peso actual es requerido y debe ser un numero mayor o igual a cero.",
"error": null
}

---

## PUT /api/v0/crecimiento/:id

Actualiza un registro de crecimiento existente.

Parametros URL:

- id: Identificador del registro a actualizar.

Body (JSON):
{
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoActual": 5.1
}

Campos requeridos:

- finca
- estanque
- pesoActual

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro de crecimiento actualizado correctamente.",
"data": {
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoActual": 5.1
}
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado",
"error": null
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Finca y estanque son requeridos.",
"error": null
}

## DELETE /api/v0/crecimiento/:id

Elimina un registro de crecimiento por su ID.

Parametros URL:

- id: Identificador del registro a eliminar.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro eliminado correctamente",
"data": {
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoActual": 2.5
}
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado",
"error": null
}



# Raleo

## GET /api/v0/raleo/

Obtiene todos los raleos
{
"success": true,
"message": "Raleos obtenidos correctamente.",

## GET /api/v0/raleo/1

Obtiene el raleo con id 1
{
"success": true,
"message": "Raleo obtenido correctamente.",
"data": [ ... ]
}

---

---

## POST /api/v0/raleo/

crea un objeto raleo
ejemplo con JSON:
{
"idFinca": 3,
"idEstanque": 2,
"idResponsable": 1,
"fecha": "05/07/2026",
"porcentaje": 30,
"pesoEstimado": 0.35,
"biomasaEstimado": 18,
"objetivo": "Traslado a otro estanque",
"metodo": "Atarraya",
"notas": "Raleo realizado sin inconvenientes."
}
Respuesta:
{
"success": true,
"message": "Raleo creado correctamente.",
"data": [ ... ]
}

## DELETE /api/v0/raleo/3

Elimina el raleo con id 3
{
"success": true,
"message": "Raleo eliminado correctamente.",
"data": [ ... ]

# Alimentación

## GET /api/v0/alimentaciones

Obtiene todos los registros de alimentación.

Respuesta:
200 OK

json
{
"success": true,
"message": "Registros obtenidos correctamente.",
"data": [ ... ]
}

---

## GET /api/v0/alimentaciones/:id

Obtiene un registro de alimentación por su ID.

_Parámetros URL:_

- id: ID numérico del registro.

_Respuesta exitosa:_
200 OK

json
{
"success": true,
"message": "Registro obtenido correctamente.",
"data": { ... }
}

_Respuesta de error:_
404 Not Found

json
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

---

## POST /api/v0/alimentaciones

Crea un nuevo registro de alimentación.

_Body (JSON):_

json
{
"finca": 1,
"estanque": 2,
"fecha": "2026-06-29",
"hora": "7:00 AM",
"metodo": "Boleo",
"cantidadKg": 10,
"presentacion": "Granulado",
"proveedor": "Biomar",
"tipoAlimento": "Balanceado engorde 38%",
"observaciones": "Sin novedad."
}

_Respuesta exitosa:_
201 Created

json
{
"success": true,
"message": "Registro creado correctamente.",
"data": { ... }
}

_Respuesta de error:_
400 Bad Request

json
{
"success": false,
"message": "Faltan campos requeridos.",
"error": null
}

---

## PUT /api/v0/alimentaciones/:id

Actualiza un registro existente de alimentación.

_Parámetros URL:_

- id: ID numérico del registro.

_Body (JSON):_

json
{
"finca": 1,
"estanque": 2,
"fecha": "2026-06-30",
"hora": "3:00 PM",
"metodo": "Plato",
"cantidadKg": 12,
"presentacion": "Polvo",
"proveedor": "Biomar",
"tipoAlimento": "Balanceado premium 40%",
"observaciones": "Actualizacion de registro."
}

_Respuesta exitosa:_
200 OK

json
{
"success": true,
"message": "Registro actualizado correctamente.",
"data": { ... }
}

_Respuesta de error:_
404 Not Found

json
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

---

## DELETE /api/v0/alimentaciones/:id

Elimina un registro de alimentación por su ID.

_Respuesta exitosa:_
200 OK

json
{
"success": true,
"message": "Registro eliminado correctamente.",
"data": { ... }
}

_Respuesta de error:_
404 Not Found

json
{
"success": false,
"message": "Registro no encontrado.",
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "El peso actual es requerido y debe ser un numero mayor o igual a cero.",
"error": null
}

---

## DELETE /api/v0/crecimiento/:id

Elimina un registro de crecimiento por su ID.

Parametros URL:

- id: Identificador del registro a eliminar.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Registro eliminado correctamente",
"data": {
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoActual": 2.5
}
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Registro no encontrado",
"error": null
}

# Parasitologias

## GET /api/v0/parasitologias
Obtiene todos los registros de parasitologias.

Parametros Query opcionales:
- finca: Filtra los registros por finca.
- estanque: Filtra los registros por estanque.
- parasito: Filtra los registros por tipo de parasito.
- fechaReporte: Filtra los registros por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Parasitologias obtenidas correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/parasitologias/:id
Obtiene un registro de parasitologia por su ID.

Parametros URL:
- id: ID numerico del registro de parasitologia.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Parasitologia obtenida correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "No se pudo obtener la parasitologia.",
    "error": "El id de la parasitologia no es valido"
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "No se pudo obtener la parasitologia.",
    "error": "Registro de parasitologia no encontrado"
}

---

## GET /api/v0/parasitologias/resumen
Obtiene un resumen general de los registros de parasitologias.

Parametros Query opcionales:
- finca: Filtra el resumen por finca.
- estanque: Filtra el resumen por estanque.
- parasito: Filtra el resumen por tipo de parasito.
- fechaReporte: Filtra el resumen por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Resumen de parasitologias obtenido correctamente.",
    "data": {
        "totalRegistros": 2,
        "totalCamaronesMuestreados": 110,
        "totalCamaronesInfectados": 37,
        "promedioInfeccion": 32.84,
        "gradosFrecuentes": [ ... ],
        "parasitosFrecuentes": [ ... ]
    }
}

---

## GET /api/v0/parasitologias/catalogos/parasitos
Obtiene el catalogo de parasitos disponibles para registrar parasitologias.

Respuesta:
200 OK
{
    "success": true,
    "message": "Catalogo de parasitos obtenido correctamente.",
    "data": [
        {
            "label": "Gregarina",
            "value": "gregarina"
        },
        {
            "label": "Nematodo",
            "value": "nematodo"
        },
        {
            "label": "Epicomensal",
            "value": "epicomensal"
        },
        {
            "label": "Protozoario",
            "value": "protozoario"
        },
        {
            "label": "Otro",
            "value": "otro"
        }
    ]
}

---

## POST /api/v0/parasitologias
Crea un nuevo registro de parasitologia.

Body (JSON):
{
    "finca": "1",
    "fincaNombre": "Finca La Reina",
    "estanque": "EST-001",
    "fechaReporte": "30/06/2026",
    "responsable": "Andres Gutierrez",
    "parasito": "gregarina",
    "camaronesMuestreados": 50,
    "camaronesInfectados": 12,
    "observaciones": "Registro de control parasitologico."
}

Campos requeridos:
- finca
- estanque
- fechaReporte
- parasito
- camaronesMuestreados
- camaronesInfectados

Campos opcionales:
- fincaNombre
- responsable
- observaciones

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Parasitologia creada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: parasito.",
    "error": null
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Datos invalidos para crear la parasitologia.",
    "error": [ ... ]
}

---

## PUT /api/v0/parasitologias/:id
Actualiza un registro de parasitologia existente.

Parametros URL:
- id: ID numerico del registro de parasitologia.

Body (JSON):
{
    "finca": "1",
    "fincaNombre": "Finca La Reina",
    "estanque": "EST-001",
    "fechaReporte": "30/06/2026",
    "responsable": "Andres Gutierrez",
    "parasito": "nematodo",
    "camaronesMuestreados": 60,
    "camaronesInfectados": 18,
    "observaciones": "Registro actualizado despues del monitoreo."
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Parasitologia actualizada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "No se pudo actualizar la parasitologia.",
    "error": "El id de la parasitologia no es valido"
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Datos invalidos para actualizar la parasitologia.",
    "error": [ ... ]
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "No se pudo actualizar la parasitologia.",
    "error": "Registro de parasitologia no encontrado"
}

---

## DELETE /api/v0/parasitologias/:id
Elimina un registro de parasitologia por su ID.

Parametros URL:
- id: ID numerico del registro de parasitologia.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Parasitologia eliminada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "No se pudo eliminar la parasitologia.",
    "error": "El id de la parasitologia no es valido"
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "No se pudo eliminar la parasitologia.",
    "error": "Registro de parasitologia no encontrado"
}
# Enfermedades

## GET /api/v0/enfermedades

Obtiene todos los registros de enfermedades.

Parametros Query opcionales:

* finca: Filtra los registros por finca.
* estanque: Filtra los registros por estanque.
* severidad: Filtra los registros por severidad.
* fechaReporte: Filtra los registros por fecha de reporte.

Respuesta:
200 OK
{
"success": true,
"message": "Enfermedades obtenidas correctamente.",
"data": [ ... ]
}

---

## GET /api/v0/enfermedades/resumen

Obtiene un resumen general de los registros de enfermedades.

Parametros Query opcionales:

* finca: Filtra el resumen por finca.
* estanque: Filtra el resumen por estanque.
* severidad: Filtra el resumen por severidad.
* fechaReporte: Filtra el resumen por fecha de reporte.

Respuesta:
200 OK
{
"success": true,
"message": "Resumen de enfermedades obtenido correctamente.",
"data": {
"totalRegistros": 2,
"totalMortalidad": 7,
"enfermedadesFrecuentes": [ ... ],
"severidadesFrecuentes": [ ... ]
}
}

---

## GET /api/v0/enfermedades/catalogos/enfermedades

Obtiene el catalogo de enfermedades disponibles para registrar enfermedades.

Respuesta:
200 OK
{
"success": true,
"message": "Catalogo de enfermedades obtenido correctamente.",
"data": [
{
"label": "WSSV - Mancha Blanca",
"value": "wssv",
"tipo": "viral"
},
{
"label": "AHPND - Necrosis hepatopancreatica aguda",
"value": "ahpnd",
"tipo": "bacteriana"
},
{
"label": "Vibriosis",
"value": "vibriosis",
"tipo": "bacteriana"
},
{
"label": "IHHNV",
"value": "ihhnv",
"tipo": "viral"
},
{
"label": "NHP - Hepatobacter penaei",
"value": "nhp",
"tipo": "bacteriana"
},
{
"label": "Otro",
"value": "otro",
"tipo": "otro"
}
]
}

---

## GET /api/v0/enfermedades/catalogos/severidades

Obtiene el catalogo de severidades disponibles para registrar enfermedades.

Respuesta:
200 OK
{
"success": true,
"message": "Catalogo de severidades obtenido correctamente.",
"data": [
{
"label": "Baja",
"value": "baja"
},
{
"label": "Media",
"value": "media"
},
{
"label": "Alta",
"value": "alta"
},
{
"label": "Critica",
"value": "critica"
}
]
}

---

## GET /api/v0/enfermedades/:id

Obtiene un registro de enfermedad por su ID.

Parametros URL:

* id: ID numerico del registro de enfermedad.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Enfermedad obtenida correctamente.",
"data": { ... }
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "El id debe ser numerico y mayor que cero.",
"error": null
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Enfermedad no encontrada.",
"error": null
}

---

## POST /api/v0/enfermedades

Crea un nuevo registro de enfermedad.

Body (JSON):
{
"finca": "1",
"fincaNombre": "Finca La Reina",
"estanque": "EST-001",
"fechaReporte": "2026-07-03",
"responsable": "Isaac",
"enfermedades": ["wssv", "vibriosis"],
"severidad": "media",
"mortalidad": 2,
"reporte": "Caso con sintomas leves y seguimiento sanitario."
}

Campos requeridos:

* finca
* estanque
* fechaReporte
* enfermedades
* severidad
* reporte

Campos opcionales:

* fincaNombre
* responsable
* mortalidad

Respuesta exitosa:
201 Created
{
"success": true,
"message": "Enfermedad creada correctamente.",
"data": { ... }
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Faltan campos requeridos: enfermedades.",
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "Datos invalidos para la enfermedad.",
"error": [ ... ]
}

---

## PUT /api/v0/enfermedades/:id

Actualiza un registro de enfermedad existente.

Parametros URL:

* id: ID numerico del registro de enfermedad.

Body (JSON):
{
"finca": "1",
"fincaNombre": "Finca La Reina",
"estanque": "EST-001",
"fechaReporte": "2026-07-03",
"responsable": "Isaac",
"enfermedades": ["ahpnd"],
"severidad": "alta",
"mortalidad": 5,
"reporte": "Registro actualizado despues del monitoreo sanitario."
}

Campos requeridos:

* finca
* estanque
* fechaReporte
* enfermedades
* severidad
* reporte

Campos opcionales:

* fincaNombre
* responsable
* mortalidad

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Enfermedad actualizada correctamente.",
"data": { ... }
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "El id debe ser numerico y mayor que cero.",
"error": null
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Faltan campos requeridos: severidad.",
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "Datos invalidos para la enfermedad.",
"error": [ ... ]
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Enfermedad no encontrada.",
"error": null
}

---

## DELETE /api/v0/enfermedades/:id
Elimina un registro de enfermedad por su ID.

Parametros URL:

* id: ID numerico del registro de enfermedad.

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Enfermedad eliminada correctamente.",
"data": { ... }
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "El id debe ser numerico y mayor que cero.",
"error": null
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Enfermedad no encontrada.",
"error": null
}

# Ventas

## GET /api/v0/ventas

Obtiene todas las ventas registradas.

Respuesta:
200 OK
{
"success": true,
"message": "Ventas obtenidas correctamente.",
"data": [ ... ]
}

## GET /api/v0/ventas/:id

Obtiene una venta por su ID.

Parametros URL:

id: ID de la venta.
Respuesta exitosa:
200 OK
{
"success": true,
"message": "Venta obtenida correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Venta no encontrada.",
"error": null
}

## POST /api/v0/ventas

Crea una nueva venta.

Body (JSON):
{
"id": "3",
"finca": "Finca El Oasis",
"estanque": "EST-02",
"pesoPromedio": 14.2,
"tamanoPromedio": 11.4,
"cantVendida": 850,
"precioKilo": 4700,
"fecha": "2026-07-04",
"total": 3995000,
"colaborador": "Ana Rojas",
"comprador": "Peces del Pacífico"
}

Campos requeridos:

finca
estanque
pesoPromedio
tamanoPromedio
cantVendida
precioKilo
fecha
total
colaborador
comprador
Respuesta exitosa:
201 Created
{
"success": true,
"message": "Venta creada correctamente.",
"data": { ... }
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "La finca es obligatoria.",
"error": null
}

## PUT /api/v0/ventas/:id

Actualiza una venta existente.

Parametros URL:

id: ID de la venta.
Body (JSON):
{
"id": "1",
"finca": "Finca La Perla",
"estanque": "EST-01",
"pesoPromedio": 15.5,
"tamanoPromedio": 12,
"cantVendida": 1000,
"precioKilo": 4500,
"fecha": "2026-07-04",
"total": 4500000,
"colaborador": "Marco Vásquez",
"comprador": "Mariscos del Rey"
}

Respuesta exitosa:
200 OK
{
"success": true,
"message": "Venta actualizada correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Venta no encontrada.",
"error": null
}

## DELETE /api/v0/ventas/:id

Elimina una venta por su ID.

Parametros URL:

id: ID de la venta.
Respuesta exitosa:
200 OK
{
"success": true,
"message": "Venta eliminada correctamente.",
"data": { ... }
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Venta no encontrada.",
"error": null
}


# Documentacion de APIs


---

# Inventario

## GET /api/v1/inventarios
Obtiene todos los productos activos del inventario con la bandera calculada de stock bajo.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Productos de inventario obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "codigo": "ALI-001",
            "nombre": "Alimento Biomar 35%",
            "categoria": "Alimentación",
            "cantidad": 250,
            "unidad": "kg",
            "stockMinimo": 50,
            "proveedor": "Biomar",
            "precioUnidad": 1450,
            "stockBajo": false
        },
        ...
    ]
}

---

## GET /api/v1/inventarios/:id
Obtiene un producto activo por su ID.

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto obtenido correctamente.",
    "data": {
        "id": 2,
        "codigo": "ALI-002",
        "nombre": "Melaza de caña",
        "categoria": "Alimentación",
        "cantidad": 30,
        "unidad": "litros",
        "stockMinimo": 50,
        "proveedor": "Trisan",
        "precioUnidad": 320,
        "stockBajo": true
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}

---

## POST /api/v1/inventarios
Crea un nuevo producto de inventario.

Body (JSON):
{
    "codigo": "ALI-004",
    "nombre": "Alimento Biomar 40%",
    "categoria": "Alimentación",
    "cantidad": 100,
    "unidad": "kg",
    "stockMinimo": 20,
    "proveedor": "Biomar",
    "precioUnidad": 1600
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Producto creado correctamente.",
    "data": {
        "id": 8,
        "codigo": "ALI-004",
        "nombre": "Alimento Biomar 40%",
        "categoria": "Alimentación",
        "cantidad": 100,
        "unidad": "kg",
        "stockMinimo": 20,
        "proveedor": "Biomar",
        "precioUnidad": 1600,
        "stockBajo": false
    }
}

Respuesta de error:
400 Bad Request (Faltan campos)
{
    "success": false,
    "message": "Faltan campos requeridos: nombre, categoria.",
    "error": null
}

Respuesta de error:
409 Conflict (Código duplicado)
{
    "success": false,
    "message": "Ya existe un producto con ese código.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity (Validaciones)
{
    "success": false,
    "message": "La cantidad debe ser mayor o igual a 0.",
    "error": null
}

---

## PUT /api/v1/inventarios/:id
Actualiza un producto activo existente.

Parametros URL:
- id: ID numerico del producto.

Body (JSON):
{
    "codigo": "ALI-002",
    "nombre": "Melaza de caña refinada",
    "categoria": "Alimentación",
    "cantidad": 60,
    "unidad": "litros",
    "stockMinimo": 50,
    "proveedor": "Trisan",
    "precioUnidad": 350
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto actualizado correctamente.",
    "data": {
        "id": 2,
        "codigo": "ALI-002",
        "nombre": "Melaza de caña refinada",
        "categoria": "Alimentación",
        "cantidad": 60,
        "unidad": "litros",
        "stockMinimo": 50,
        "proveedor": "Trisan",
        "precioUnidad": 350,
        "stockBajo": false
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}

Respuesta de error:
409 Conflict (Código duplicado)
{
    "success": false,
    "message": "Ya existe otro producto con ese código.",
    "error": null
}

---

## DELETE /api/v1/inventarios/:id
Elimina (borrado logico) un producto por su ID.

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto eliminado correctamente.",
    "data": {
        "id": 2,
        "codigo": "ALI-002",
        "nombre": "Melaza de caña refinada",
        "categoria": "Alimentación",
        "cantidad": 60,
        "unidad": "litros",
        "stockMinimo": 50,
        "proveedor": "Trisan",
        "precioUnidad": 350
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}
# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto. En el
futuro se migrara a Swagger.

## Proveedores

### GET /api/v1/proveedores
Obtiene todos los proveedores activos.

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedores obtenidos correctamente.",
      "data": [
        {
          "id": 1,
          "nombre": "Alimentos del Pacifico",
          "tipoProducto": "alimento",
          "telefono": "+506 2233-4455",
          "correo": "alimentos@pacifico.com",
          "direccion": "Puntarenas, Costa Rica",
          "notas": "Proveedor principal de camarina"
        }
      ]
    }
    ```

---

### GET /api/v1/proveedores/:id
Obtiene un proveedor activo por su ID.

**Parametros URL:**
*   `id`: ID numerico del proveedor.

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor obtenido correctamente.",
      "data": {
        "id": 1,
        "nombre": "Alimentos del Pacifico",
        "tipoProducto": "alimento",
        "telefono": "+506 2233-4455",
        "correo": "alimentos@pacifico.com",
        "direccion": "Puntarenas, Costa Rica",
        "notas": "Proveedor principal de camarina"
      }
    }
    ```

**Respuesta de error (No encontrado):**
*   **Codigo:** 404 Not Found
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Proveedor no encontrado.",
      "error": null
    }
    ```

---

### POST /api/v1/proveedores
Crea un nuevo proveedor.

**Body (JSON):**
```json
{
  "nombre": "Alimentos del Pacifico",
  "tipoProducto": "alimento",
  "telefono": "+506 2233-4455",
  "correo": "alimentos@pacifico.com",
  "direccion": "Puntarenas, Costa Rica",
  "notas": "Proveedor principal de camarina"
}
```

**Respuesta exitosa:**
*   **Codigo:** 201 Created
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor creado correctamente.",
      "data": {
        "id": 4,
        "nombre": "Alimentos del Pacifico",
        "tipoProducto": "alimento",
        "telefono": "+506 2233-4455",
        "correo": "alimentos@pacifico.com",
        "direccion": "Puntarenas, Costa Rica",
        "notas": "Proveedor principal de camarina"
      }
    }
    ```

**Respuesta de error (Datos invalidos o duplicado):**
*   **Codigo:** 400 Bad Request
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Faltan campos requeridos: nombre.",
      "error": null
    }
    ```

---

### PUT /api/v1/proveedores/:id
Actualiza un proveedor activo existente.

**Parametros URL:**
*   `id`: ID numerico del proveedor.

**Body (JSON):**
```json
{
  "nombre": "Alimentos del Pacifico Modificado",
  "tipoProducto": "alimento",
  "telefono": "+506 2233-4455"
}
```

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor actualizado correctamente.",
      "data": {
        "id": 1,
        "nombre": "Alimentos del Pacifico Modificado",
        "tipoProducto": "alimento",
        "telefono": "+506 2233-4455"
      }
    }
    ```

**Respuesta de error:**
*   **Codigo:** 400 Bad Request / 404 Not Found
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Proveedor no encontrado.",
      "error": null
    }
    ```

---

### DELETE /api/v1/proveedores/:id
Desactiva un proveedor por su ID (borrado logico).

**Parametros URL:**
*   `id`: ID numerico del proveedor.

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor eliminado correctamente.",
      "data": {
        "id": 1,
        "nombre": "Alimentos del Pacifico",
        "activo": false
      }
    }
    ```

**Respuesta de error:**
*   **Codigo:** 404 Not Found
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Proveedor no encontrado.",
      "error": null
    }
    ```
    ---

# Siembra (Lotes de Larva y Pre-crías)

## GET /api/v1/siembra/lotes
Obtiene todos los lotes de larva activos.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lotes de larva obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "codigo_lote": "LOT-2026-01",
            "proveedor": "Alimentos del Pacífico",
            "laboratorio": "LabMar",
            "procedencia": "Nacional",
            "certificado_larva": "CERT-092",
            "pl_inicial": 10,
            "cantidad_inicial": 100000,
            "fecha_ingreso": "2026-06-25"
        }
    ]
}

---

## GET /api/v1/siembra/lotes/:id
Obtiene un lote de larva activo por su ID.

Parametros URL:
- id: ID numerico del lote de larva.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lote de larva obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lote de larva no encontrado.",
    "error": null
}

---

## POST /api/v1/siembra/lotes
Crea un nuevo lote de larva.

Body (JSON):
{
    "codigo_lote": "LOT-2026-02",
    "proveedor": "Alimentos del Pacífico",
    "laboratorio": "LabMar",
    "procedencia": "Nacional",
    "certificado_larva": "CERT-093",
    "pl_inicial": 12,
    "cantidad_inicial": 150000,
    "fecha_ingreso": "2026-07-04"
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Lote de larva creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request (Proveedor inexistente)
{
    "success": false,
    "message": "El proveedor indicado no existe.",
    "error": null
}

Respuesta de error:
409 Conflict (Codigo repetido)
{
    "success": false,
    "message": "Ya existe un lote con ese codigo.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity (Validaciones)
{
    "success": false,
    "message": "Datos invalidos para el lote.",
    "error": [ "El campo pl_inicial debe ser un entero positivo." ]
}

---

## PUT /api/v1/siembra/lotes/:id
Actualiza un lote de larva existente.

Parametros URL:
- id: ID numerico del lote de larva.

Body (JSON):
{
    "codigo_lote": "LOT-2026-02-REV",
    "proveedor": "Alimentos del Pacífico",
    "laboratorio": "LabMar",
    "procedencia": "Nacional",
    "certificado_larva": "CERT-093",
    "pl_inicial": 12,
    "cantidad_inicial": 150000,
    "fecha_ingreso": "2026-07-04"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lote de larva actualizado correctamente.",
    "data": { ... }
}

---

## DELETE /api/v1/siembra/lotes/:id
Elimina (borrado logico) un lote de larva por su ID.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lote de larva eliminado correctamente.",
    "data": { ... }
}

---

## GET /api/v1/siembra/precrias
Obtiene todas las pre-crias activas.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-crias obtenidas correctamente.",
    "data": [
        {
            "id": 1,
            "id_lote_larva": 1,
            "id_finca": 1,
            "unidad_precria": "Precria A",
            "fecha_inicio": "2026-06-26",
            "cantidad_inicial": 100000,
            "pl_inicial": 10,
            "estado": "ACTIVA",
            "fecha_fin": null,
            "cantidad_final": null,
            "pl_final": null
        }
    ]
}

---

## GET /api/v1/siembra/precrias/:id
Obtiene una pre-cria activa por su ID.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-cria obtenida correctamente.",
    "data": { ... }
}

---

## POST /api/v1/siembra/precrias
Crea una nueva pre-cria.

Body (JSON):
{
    "id_lote_larva": 1,
    "id_finca": 1,
    "unidad_precria": "Precria B",
    "fecha_inicio": "2026-07-04",
    "cantidad_inicial": 80000,
    "pl_inicial": 10
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Pre-cria creada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request (Lote de larva inexistente)
{
    "success": false,
    "message": "El lote de larva indicado no existe.",
    "error": null
}

---

## POST /api/v1/siembra/precrias/:id/finalizar
Finaliza una pre-cria en estado ACTIVA aplicando las reglas del negocio.

Parametros URL:
- id: ID de la pre-cria a finalizar.

Body (JSON):
{
    "fecha_fin": "2026-07-10",
    "cantidad_final": 75000,
    "pl_final": 15
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-cria finalizada correctamente.",
    "data": {
        "id": 1,
        "id_lote_larva": 1,
        "id_finca": 1,
        "unidad_precria": "Precria A",
        "fecha_inicio": "2026-06-26",
        "cantidad_inicial": 100000,
        "pl_inicial": 10,
        "estado": "FINALIZADA",
        "fecha_fin": "2026-07-10",
        "cantidad_final": 75000,
        "pl_final": 15
    }
}

Respuesta de error:
400 Bad Request (Reglas de negocio)
{
    "success": false,
    "message": "fecha_fin no puede ser menor que fecha_inicio.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity (Formatos incorrectos)
{
    "success": false,
    "message": "Datos invalidos para finalizar pre-cria.",
    "error": [ "cantidad_final debe ser entero positivo." ]
}

---

## DELETE /api/v1/siembra/precrias/:id
Elimina (borrado logico) una pre-cria por su ID.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-cria eliminada correctamente.",
    "data": { ... }
}
