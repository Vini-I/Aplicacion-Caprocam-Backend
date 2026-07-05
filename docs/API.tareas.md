# Tareas

## GET /api/v1/tareas

Obtiene todas las tareas.

Respuesta:
200 OK
{ "success": true, "message": "Tareas obtenidas correctamente.", "data": [...] }

---

## GET /api/v1/tareas/catalogo

Retorna lista reducida de tareas para poblar selects en el frontend.

Respuesta:
200 OK
{ "success": true, "message": "Catalogo de tareas obtenido correctamente.",
  "data": [{ "id": 1, "nombre": "Limpieza de filtros" }] }

---

## GET /api/v1/tareas/:id

Obtiene una tarea por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v1/tareas

Crea una nueva tarea.

Body (JSON):
{
    "nombre":           "Revision de aireadores",
    "descripcion":      "Inspeccion y limpieza de aireadores.",
    "categoria":        "preventivo",
    "duracionEstimada": 3
}

Respuesta exitosa:   201 Created
Respuesta de error:  400 / 422

Categorias validas: preventivo, correctivo, instalacion, inspeccion

---

## PUT /api/v1/tareas/:id

Actualiza una tarea existente. Mismo body que POST.

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 422 / 404

---

## DELETE /api/v1/tareas/:id

Elimina una tarea por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found
