# Tareas

## GET /api/v0/tareas
Obtiene todas las tareas del grupo.

Respuesta:
200 OK
{ "success": true, "message": "Tareas obtenidas correctamente.", "data": [...] }

---

## GET /api/v0/tareas/catalogo
Retorna lista reducida para poblar selects en el frontend.

Respuesta:
200 OK
{ "success": true, "message": "Catalogo de tareas obtenido correctamente.",
  "data": [{ "id": 1, "codigoTarea": "TAR-001", "nombre": "Limpieza de filtros" }] }

---

## GET /api/v0/tareas/:id
Obtiene una tarea por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v0/tareas
Crea una nueva tarea.

Body (JSON):
{
    "codigoTarea": "TAR-001",
    "nombre":      "Revision de aireadores",
    "descripcion": "Inspeccion y limpieza de aireadores.",
    "categoria":   "Preventivo",
    "horas":       3
}

Campos requeridos: codigoTarea, nombre, descripcion, categoria, horas
Categorias validas: Preventivo, Correctivo, Predictivo, Emergencia

Respuesta exitosa:   201 Created
Respuesta de error:  400 / 422

---

## PUT /api/v0/tareas/:id
Actualiza una tarea existente. codigoTarea no se puede modificar.

Body (JSON):
{
    "nombre":      "Revision de aireadores actualizada",
    "descripcion": "Inspeccion completa.",
    "categoria":   "Correctivo",
    "horas":       2,
    "estado":      "En proceso"
}

Campos requeridos: nombre, descripcion, categoria, horas
Estados validos: Pendiente, En proceso, Finalizada, Cancelada

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 422 / 404

---

## DELETE /api/v0/tareas/:id
Elimina una tarea por su ID (borrado logico).

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found