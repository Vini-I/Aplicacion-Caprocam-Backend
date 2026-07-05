# Fisico Quimica

## GET /api/v1/lecturasFisicoQuimicas
Obtiene todas las lecturas fisico quimicas.

Respuesta:
200 OK
{
    "success": true,
    "message": "Lecturas obtenidas correctamente.",
    "data": [ ... ]
}

Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener las lecturas.",
    "error": "Mensaje detallado del error"
}

---

## GET /api/v1/lecturasFisicoQuimicas/:id
Obtiene una lectura fisico quimica por su ID.

Parametros URL:
- id: ID numerico de la lectura.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lectura obtenida correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lectura no encontrada.",
    "error": null
}

---

## POST /api/v1/lecturasFisicoQuimicas
Registra una nueva lectura fisico quimica.

Body (JSON):
{
    "fincaId":     1,
    "estanqueId":  "E-01",
    "fecha":       "2026-07-03",
    "ph":          [{ "valor": 7.8, "etiqueta": "mañana" }],
    "salinidad":   [{ "valor": 18.0, "etiqueta": "mañana" }],
    "temperatura": [{ "valor": 29.0, "etiqueta": "mañana" }],
    "oxigeno":     [{ "valor": 6.2, "etiqueta": "mañana" }]
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Lectura registrada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: oxigeno.",
    "error": null
}

---

## PUT /api/v1/lecturasFisicoQuimicas/:id/activo
Realiza el borrado logico de una lectura.
Invierte el estado activo del registro.

Parametros URL:
- id: ID numerico de la lectura.

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
    "message": "Lectura no encontrada.",
    "error": null
}