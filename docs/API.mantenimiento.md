# Mantenimientos

## GET /api/v0/mantenimientos
Obtiene todos los tickets de mantenimiento del grupo.

Respuesta:
200 OK
{ "success": true, "message": "Mantenimientos obtenidos correctamente.", "data": [...] }

---

## GET /api/v0/mantenimientos/:id
Obtiene un ticket por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v0/mantenimientos
Crea un nuevo ticket de mantenimiento.
El creador se extrae del JWT automaticamente.

Body (JSON):
{
    "codigoTicket":       "TIC-001",
    "equipoId":           1,
    "fechaMantenimiento": "2026-07-22T09:00:00",
    "tituloTicket":       "Falla en bomba estanque 3",
    "descripcionTicket":  "La bomba presenta vibracion inusual.",
    "tipoPersonal":       "TrabajadorInterno",
    "costoManoObra":      15000,
    "costoProductos":     8000,
    "costoTotalEstimado": 23000
}

Campos requeridos: codigoTicket, equipoId, fechaMantenimiento, tituloTicket, descripcionTicket
Campos opcionales: tipoPersonal, costoManoObra, costoProductos, costoTotalEstimado, estadoTicket

Tipo personal valido:   TrabajadorInterno, TrabajadorExterno
Estados validos:        En espera, En mantenimiento, Terminado

Respuesta exitosa:   201 Created
Respuesta de error:  400 / 422 / 404

---

## PUT /api/v0/mantenimientos/:id
Actualiza un ticket existente. codigoTicket no se puede modificar.

Body (JSON):
{
    "equipoId":           1,
    "fechaMantenimiento": "2026-07-22T10:00:00",
    "tituloTicket":       "Falla en bomba - actualizado",
    "descripcionTicket":  "Se confirmo falla en rodamiento.",
    "tipoPersonal":       "TrabajadorExterno",
    "costoManoObra":      20000,
    "costoProductos":     12000,
    "costoTotalEstimado": 32000,
    "estadoTicket":       "En mantenimiento"
}

Campos requeridos: equipoId, tituloTicket, descripcionTicket

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 422 / 404

---

## DELETE /api/v0/mantenimientos/:id
Elimina un ticket por su ID (borrado logico).

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

# Tareas de Mantenimiento

## GET /api/v0/mantenimientos/:mantenimientoId/tareas
Obtiene todas las tareas vinculadas a un ticket de mantenimiento.

Parametros URL:
- mantenimientoId: ID numerico del ticket.

Respuesta:
200 OK
{ "success": true, "message": "Tareas del mantenimiento obtenidas correctamente.", "data": [...] }

---

## POST /api/v0/mantenimientos/tareas
Vincula una tarea a un ticket de mantenimiento.

Body (JSON):
{
    "mantenimientoEquipoId": 1,
    "tareaId":               2,
    "estadoTarea":           "Pendiente"
}

Campos requeridos: mantenimientoEquipoId, tareaId
Campos opcionales: estadoTarea
Estados validos: Pendiente, Realizado

Respuesta exitosa:   201 Created
Respuesta de error:  400

---

## PUT /api/v0/mantenimientos/tareas/:id
Actualiza el estado de una tarea en un mantenimiento.

Body (JSON):
{
    "estadoTarea": "Realizado"
}

Respuesta exitosa:   200 OK
Respuesta de error:  422 / 404

---

## DELETE /api/v0/mantenimientos/tareas/:id
Elimina el vinculo de una tarea con un mantenimiento (borrado logico).

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

# Productos de Mantenimiento

## GET /api/v0/mantenimientos/:mantenimientoId/productos
Obtiene todos los productos vinculados a un ticket de mantenimiento.

Parametros URL:
- mantenimientoId: ID numerico del ticket.

Respuesta:
200 OK
{ "success": true, "message": "Productos del mantenimiento obtenidos correctamente.", "data": [...] }

---

## POST /api/v0/mantenimientos/productos
Vincula un producto a un ticket de mantenimiento.

Body (JSON):
{
    "mantenimientoEquipoId": 1,
    "productoId":            3,
    "cantidad":              2,
    "costoUnitario":         4000,
    "subtotal":              8000
}

Campos requeridos: mantenimientoEquipoId, productoId, cantidad, costoUnitario, subtotal

Respuesta exitosa:   201 Created
Respuesta de error:  400

---

## PUT /api/v0/mantenimientos/productos/:id
Actualiza cantidad y costos de un producto en un mantenimiento.

Body (JSON):
{
    "cantidad":      3,
    "costoUnitario": 4000,
    "subtotal":      12000
}

Campos requeridos: cantidad, costoUnitario, subtotal

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 404

---

## DELETE /api/v0/mantenimientos/productos/:id
Elimina el vinculo de un producto con un mantenimiento (borrado logico).

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found