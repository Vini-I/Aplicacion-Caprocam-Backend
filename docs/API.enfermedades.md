# Enfermedades

## GET /api/v0/enfermedades
Obtiene todos los registros de enfermedades.

Parametros Query opcionales:
- finca:        Filtra los registros por finca.
- estanque:     Filtra los registros por estanque.
- severidad:    Filtra los registros por severidad.
- fechaReporte: Filtra los registros por fecha de reporte.

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
- finca:        Filtra el resumen por finca.
- estanque:     Filtra el resumen por estanque.
- severidad:    Filtra el resumen por severidad.
- fechaReporte: Filtra el resumen por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Resumen de enfermedades obtenido correctamente.",
    "data": {
        "totalRegistros":         2,
        "totalMortalidad":        7,
        "enfermedadesFrecuentes": [ ... ],
        "severidadesFrecuentes":  [ ... ]
    }
}

---

## GET /api/v0/enfermedades/catalogos/enfermedades
Obtiene el catalogo de enfermedades disponibles.

Respuesta:
200 OK
{
    "success": true,
    "message": "Catalogo de enfermedades obtenido correctamente.",
    "data": [
        { "label": "WSSV - Mancha Blanca",                      "value": "wssv",      "tipo": "viral"      },
        { "label": "AHPND - Necrosis hepatopancreatica aguda",   "value": "ahpnd",     "tipo": "bacteriana" },
        { "label": "Vibriosis",                                  "value": "vibriosis", "tipo": "bacteriana" },
        { "label": "IHHNV",                                      "value": "ihhnv",     "tipo": "viral"      },
        { "label": "NHP - Hepatobacter penaei",                  "value": "nhp",       "tipo": "bacteriana" },
        { "label": "Otro",                                       "value": "otro",      "tipo": "otro"       }
    ]
}

---

## GET /api/v0/enfermedades/catalogos/severidades
Obtiene el catalogo de severidades disponibles.

Respuesta:
200 OK
{
    "success": true,
    "message": "Catalogo de severidades obtenido correctamente.",
    "data": [
        { "label": "Baja",    "value": "baja"    },
        { "label": "Media",   "value": "media"   },
        { "label": "Alta",    "value": "alta"    },
        { "label": "Critica", "value": "critica" }
    ]
}

---

## GET /api/v0/enfermedades/:id
Obtiene un registro de enfermedad por su ID.

Parametros URL:
- id: ID numerico del registro.

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
    "finca":        "1",
    "fincaNombre":  "Finca La Reina",
    "estanque":     "EST-001",
    "fechaReporte": "2026-07-03",
    "responsable":  "Isaac",
    "enfermedades": ["wssv", "vibriosis"],
    "severidad":    "media",
    "mortalidad":   2,
    "reporte":      "Caso con sintomas leves y seguimiento sanitario."
}

Campos requeridos: finca, estanque, fechaReporte, enfermedades, severidad, reporte
Campos opcionales: fincaNombre, responsable, mortalidad

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
- id: ID numerico del registro.

Body (JSON):
{
    "finca":        "1",
    "fincaNombre":  "Finca La Reina",
    "estanque":     "EST-001",
    "fechaReporte": "2026-07-03",
    "responsable":  "Isaac",
    "enfermedades": ["ahpnd"],
    "severidad":    "alta",
    "mortalidad":   5,
    "reporte":      "Registro actualizado despues del monitoreo sanitario."
}

Campos requeridos: finca, estanque, fechaReporte, enfermedades, severidad, reporte
Campos opcionales: fincaNombre, responsable, mortalidad

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
404 Not Found
{
    "success": false,
    "message": "Enfermedad no encontrada.",
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

## DELETE /api/v0/enfermedades/:id
Elimina un registro de enfermedad por su ID.

Parametros URL:
- id: ID numerico del registro.

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
