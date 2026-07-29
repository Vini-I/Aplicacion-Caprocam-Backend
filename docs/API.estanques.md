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
    "idFinca":                    1,
    "codigo":                     "EST-003",
    "tipoEstanque":               "Engorde",
    "estado":                     "Activo",
    "largo":                      100,
    "ancho":                      80,
    "profundidad":                1,
    "fuenteAgua":                 "Pozo",
    "especie":                    "Litopenaeus vannamei - Camaron blanco",
    "fechaSiembra":               "29/06/2026",
    "fechaInicioEngorde":         "29/06/2026",
    "fechaMantenimiento":         "29/06/2026",
    "densidadSiembra":            12,
    "Precria":                 false,
    "metodoAlimentacion":         "Manual",
    "proveedorAlimento":          "Biomar",
    "numeroAireadores":           2,
    "tieneAlimentadorAutomatico": false
}

Campos requeridos: idFinca, codigo

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
    "idFinca":                    1,
    "codigo":                     "EST-003",
    "tipoEstanque":               "Engorde",
    "estado":                     "Mantenimiento",
    "largo":                      100,
    "ancho":                      80,
    "profundidad":                1,
    "fuenteAgua":                 "Pozo",
    "especie":                    "Litopenaeus vannamei - Camaron blanco",
    "fechaSiembra":               "29/06/2026",
    "fechaInicioEngorde":         "29/06/2026",
    "fechaMantenimiento":         "29/06/2026",
    "densidadSiembra":            12,
    "Precria":                 false,
    "metodoAlimentacion":         "Manual",
    "proveedorAlimento":          "Biomar",
    "numeroAireadores":           2,
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
Elimina un estanque por su ID (borrado logico).

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
