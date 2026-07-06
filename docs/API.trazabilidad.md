# Trazabilidad

## GET /api/v1/registrosTrazabilidad
Obtiene todos los registros de trazabilidad.

Respuesta:
200 OK
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [ ... ]
}

Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener los registros.",
    "error": "Mensaje detallado del error"
}

---

## GET /api/v1/registrosTrazabilidad/:id
Obtiene un registro de trazabilidad por su ID.

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

---

## POST /api/v1/registrosTrazabilidad
Registra un nuevo movimiento de trazabilidad.

Body (JSON):
{
    "fincaId":           1,
    "estanqueOrigenId":  "E-01",
    "estanqueDestinoId": "E-05",
    "fecha":             "2026-07-03",
    "colaboradorId":     3,
    "tamano":            8.5,
    "dias":              45,
    "pl":                5000
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro guardado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El estanque origen y destino no pueden ser el mismo.",
    "error": null
}

---

## PUT /api/v1/registrosTrazabilidad/:id/activo
Realiza el borrado logico de un registro de trazabilidad.
Invierte el estado activo del registro.

Parametros URL:
- id: ID numerico del registro.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Estado actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}