# Crecimiento

## GET /api/v0/crecimiento
Obtiene todos los registros de crecimiento.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registros de crecimiento obtenidos correctamente.",
    "data": [ ... ]
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

## POST /api/v0/crecimiento
Crea un nuevo registro de crecimiento.

Body (JSON):
{
  "finca": 1,
  "estanque": 1,
  "colaborador": null,
  "fechaRegistro": "2026-07-18",
  "pesoActual": 12.50
}

Campos requeridos: finca, estanque, pesoActual

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro de crecimiento creado correctamente.",
    "data": { ... }
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
  "finca": 1,
  "estanque": 1,
  "colaborador": 1,
  "fechaRegistro": "2026-07-18",
  "pesoActual": 18.85
}

Campos requeridos: finca, estanque, pesoActual

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro de crecimiento actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
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

## DELETE /api/v0/crecimiento/:id
Elimina un registro de crecimiento por su ID.

Parametros URL:
- id: Identificador del registro a eliminar.

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
