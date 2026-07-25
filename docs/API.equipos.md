# Equipos

Todas las rutas requieren autenticacion (Authorization: Bearer <token>).
El grupoDatos se obtiene del JWT, nunca se envia desde el body.

## GET /api/v0/equipos
Obtiene todos los equipos activos del grupo de datos del usuario.
Permite filtrar por estanque con el query param estanqueId.

Ejemplo: GET /api/v0/equipos?estanqueId=3

Respuesta:
200 OK
{
    "success": true,
    "message": "Equipos obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/equipos/:id
Obtiene un equipo por su ID dentro del grupo del usuario.

Parametros URL:
- id: ID numerico del equipo.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Equipo obtenido correctamente.",
    "data": {
        "id": 1,
        "uuid": "...",
        "grupoDatos": 1,
        "identificador": "EQ-01",
        "nombreEquipo": "Aireador principal",
        "descripcion": "Aireador del estanque 3",
        "tipoEquipo": "Aireacion",
        "fechaInstalacion": "2022-03-15",
        "funcionEquipo": "Mantener la oxigenacion constante",
        "estanqueId": 3,
        "horasMantenimiento": 500,
        "horasActuales": 120.5,
        "estadoOperativo": "Activo",
        "estado": "Encendido",
        "activo": true,
        "fechaCreacion": "...",
        "fechaActualizacion": "...",
        "deletedAt": null,
        "version": 1
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El id debe ser numerico y mayor que cero.",
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
Registra un nuevo equipo dentro del grupo del usuario.

Body (JSON):
{
    "identificador":      "EQ-01",
    "nombreEquipo":       "Aireador principal",
    "descripcion":        "Aireador del estanque 3",
    "fechaInstalacion":   "15/03/2022",
    "tipoEquipo":         "Aireacion",
    "estadoOperativo":    "Activo",
    "funcionEquipo":      "Mantener la oxigenacion constante",
    "estanqueId":         3,
    "horasMantenimiento": 500,
    "horasActuales":      0,
    "estado":             "Apagado"
}

Campos requeridos: identificador, nombreEquipo, descripcion,
fechaInstalacion, tipoEquipo, estadoOperativo, funcionEquipo

Campos opcionales: estanqueId, horasMantenimiento, horasActuales
(default 0), estado (default "Apagado")

Valores permitidos para tipoEquipo:
Aireacion, Bombeo, Alimentacion, Monitoreo, Mantenimiento, Otro

Valores permitidos para estadoOperativo:
Activo, Inactivo, Mantenimiento

Valores permitidos para estado:
Encendido, Apagado

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
    "message": "Faltan campos requeridos: identificador, tipoEquipo.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un equipo con ese identificador.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "Datos invalidos para el equipo.",
    "error": [
        "El campo fechaInstalacion debe tener formato dd/mm/aaaa."
    ]
}

---

## PUT /api/v0/equipos/:id
Actualiza un equipo existente dentro del grupo del usuario.

Parametros URL:
- id: ID numerico del equipo.

Body (JSON): mismos campos que POST.

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
    "message": "El id debe ser numerico y mayor que cero.",
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
    "message": "Ya existe un equipo con ese identificador.",
    "error": null
}

---

## DELETE /api/v0/equipos/:id
Elimina un equipo por su ID (borrado logico) dentro del grupo
del usuario.

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
    "message": "El id debe ser numerico y mayor que cero.",
    "error": null
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Equipo no encontrado.",
    "error": null
}