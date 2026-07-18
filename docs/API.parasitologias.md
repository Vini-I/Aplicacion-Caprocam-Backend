# Parasitologias

## GET /api/v0/parasitologias
Obtiene todos los registros de parasitologias.

Parametros Query opcionales:
- finca:        Filtra los registros por finca.
- estanque:     Filtra los registros por estanque.
- parasito:     Filtra los registros por tipo de parasito.
- fechaReporte: Filtra los registros por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Parasitologias obtenidas correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/parasitologias/resumen
Obtiene un resumen general de los registros de parasitologias.

Parametros Query opcionales:
- finca:        Filtra el resumen por finca.
- estanque:     Filtra el resumen por estanque.
- parasito:     Filtra el resumen por tipo de parasito.
- fechaReporte: Filtra el resumen por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Resumen de parasitologias obtenido correctamente.",
    "data": {
        "totalRegistros":            2,
        "totalCamaronesMuestreados": 110,
        "totalCamaronesInfectados":  37,
        "promedioInfeccion":         32.84,
        "gradosFrecuentes":          [ ... ],
        "parasitosFrecuentes":       [ ... ]
    }
}

---

## GET /api/v0/parasitologias/catalogos/parasitos
Obtiene el catalogo de parasitos disponibles.

Respuesta:
200 OK
{
    "success": true,
    "message": "Catalogo de parasitos obtenido correctamente.",
    "data": [
        { "label": "Gregarina",   "value": "gregarina"   },
        { "label": "Nematodo",    "value": "nematodo"    },
        { "label": "Epicomensal", "value": "epicomensal" },
        { "label": "Protozoario", "value": "protozoario" },
        { "label": "Otro",        "value": "otro"        }
    ]
}

---

## GET /api/v0/parasitologias/:id
Obtiene un registro de parasitologia por su ID.

Parametros URL:
- id: ID numerico del registro.

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

## POST /api/v0/parasitologias
Crea un nuevo registro de parasitologia.

Body (JSON):
{
    "finca":                 "1",
    "fincaNombre":           "Finca La Reina",
    "estanque":              "EST-001",
    "fechaReporte":          "30/06/2026",
    "responsable":           "Andres Gutierrez",
    "parasito":              "gregarina",
    "camaronesMuestreados":  50,
    "camaronesInfectados":   12,
    "observaciones":         "Registro de control parasitologico."
}

Campos requeridos: finca, estanque, fechaReporte, parasito, camaronesMuestreados, camaronesInfectados
Campos opcionales: fincaNombre, responsable, observaciones

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
- id: ID numerico del registro.

Body (JSON):
{
    "finca":                "1",
    "fincaNombre":          "Finca La Reina",
    "estanque":             "EST-001",
    "fechaReporte":         "30/06/2026",
    "responsable":          "Andres Gutierrez",
    "parasito":             "nematodo",
    "camaronesMuestreados": 60,
    "camaronesInfectados":  18,
    "observaciones":        "Registro actualizado despues del monitoreo."
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
- id: ID numerico del registro.

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
