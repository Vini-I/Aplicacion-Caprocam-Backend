# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto.
En el futuro se migrara a Swagger.

---

# Colaboradores

## GET /api/v1/colaboradores
Obtiene todos los colaboradores.

Respuesta:
200 OK
{
    "success": true,
    "message": "Colaboradores obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/colaboradores/:id
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

## POST /api/v1/colaboradores
Crea un nuevo colaborador.

Body (JSON):
{
    "nombre":    "Carlos",
    "apellidos": "Jiménez",
    "telefono":  "66665555",
    "email":     "carlos@empresa.com",
    "rol":       "colaborador"
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

## PUT /api/v1/colaboradores/:id
Actualiza un colaborador existente.

Parametros URL:
- id: ID numerico del colaborador.

Body (JSON):
{
    "nombre":    "Carlos",
    "apellidos": "Jiménez Corrected",
    "telefono":  "66665555",
    "email":     "carlos@empresa.com",
    "rol":       "supervisor"
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

## DELETE /api/v1/colaboradores/:id
Elimina un colaborador por su ID.

Parametros URL:
- id: ID numerico del colaborador.

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

# Estanques

## GET /api/v0/estanques
Obtiene todos los estanques registrados.

Respuesta:
200 OK
{
    "success": true,
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
    "message": "Estanque obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
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
    "message": "Estanque creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
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
    "message": "Estanque actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
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
    "message": "Estanque eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Estanque no encontrado.",
    "error": null
}


# Crecimiento
## GET /api/v1/crecimiento
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

## GET /api/v1/crecimiento/:id
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

## POST /api/v1/crecimiento
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

## PUT /api/v1/crecimiento/:id
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

---

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

