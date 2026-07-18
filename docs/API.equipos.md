# Equipos

## GET /api/v0/equipos
Obtiene todos los equipos activos registrados.

Respuesta:
200 OK
{
    "success": true,
    "message": "Equipos obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/equipos/:id
Obtiene un equipo por su ID.

Parametros URL:
- id: ID numerico del equipo.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Equipo obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El id del equipo es invalido.",
    "error": null
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Equipo no encontrado.",
    "error": null
}

---

## POST /api/v0/equipos
Registra un nuevo equipo.

Body (JSON):
{
    "codigoInterno":    "EQ-001",
    "descripcion":      "Aireador principal del estanque 3",
    "fechaInstalacion": "15/03/2022",
    "tipo":             "aireacion",
    "estado":           "activo",
    "funcionEquipo":    "Mantener la oxigenacion constante en el estanque"
}

Campos requeridos: codigoInterno, tipo, estado
Valores permitidos para tipo:    aireacion, bombeo, alimentacion, monitoreo, mantenimiento, otro
Valores permitidos para estado:  activo, mantenimiento, inactivo

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Equipo registrado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: tipo.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un equipo con ese codigo interno.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "La fecha de instalacion debe tener formato dd/mm/aaaa.",
    "error": null
}

---

## PUT /api/v0/equipos/:id
Actualiza un equipo existente.

Parametros URL:
- id: ID numerico del equipo.

Body (JSON):
{
    "codigoInterno":    "EQ-001",
    "descripcion":      "Aireador principal actualizado",
    "fechaInstalacion": "15/03/2022",
    "tipo":             "aireacion",
    "estado":           "mantenimiento",
    "funcionEquipo":    "Mantener la oxigenacion constante en el estanque"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Equipo actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El id del equipo es invalido.",
    "error": null
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Equipo no encontrado.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un equipo con ese codigo interno.",
    "error": null
}

---

## DELETE /api/v0/equipos/:id
Elimina un equipo por su ID (borrado logico).

Parametros URL:
- id: ID numerico del equipo.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Equipo eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El id del equipo es invalido.",
    "error": null
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Equipo no encontrado.",
    "error": null
}
