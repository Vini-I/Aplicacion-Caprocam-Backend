# Mantenimientos

## GET /api/v1/mantenimientos

Obtiene todos los mantenimientos.

Respuesta:
200 OK
{ "success": true, "message": "Mantenimientos obtenidos correctamente.", "data": [...] }

---

## GET /api/v1/mantenimientos/:id

Obtiene un mantenimiento por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v1/mantenimientos

Crea un nuevo ticket de mantenimiento.

Body (JSON):
{
    "fechaHora":   "2026-07-04T10:30:00",
    "creadoPor":   "Marco Vásquez",
    "titulo":      "Falla en bomba estanque 3",
    "equipo":      "Bomba estanque 3",
    "tarea":       1,
    "descripcion": "La bomba presenta vibracion inusual."
}

Respuesta exitosa:   201 Created
Respuesta de error:  400 / 422

Nota: creadoPor sera reemplazado por sesion JWT cuando se implemente auth.
Estados validos: abierto, en_progreso, cerrado

---

## PUT /api/v1/mantenimientos/:id

Actualiza un mantenimiento existente.
Mismo body que POST. Adicionalmente acepta el campo "estado".

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 422 / 404

---

## DELETE /api/v1/mantenimientos/:id

Elimina un mantenimiento por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found
