# Trazabilidad

## GET /api/v0/registrosTrazabilidad
Obtiene todos los registros de trazabilidad activos, limitados al grupo de datos de quien esta autenticado (usuario web o colaborador por PIN).

Respuesta:
200 OK
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [
        {
            "id": 5,
            "uuid": "10a4dc29-8349-11f1-a686-06337dcb40ba",
            "grupoDatos": 1,
            "fincaId": 1,
            "estanqueOrigenId": 1,
            "estanqueDestinoId": 2,
            "colaboradorId": null,
            "creadoPorUsuarioId": 7,
            "creadoPorColaboradorId": null,
            "fecha": "2026-07-19",
            "tamano": 0.5,
            "dias": 30,
            "pl": 15000,
            "tipoMovimiento": "SIEMBRA",
            "activo": true,
            "fechaCreacion": "2026-07-19T14:08:46.000Z",
            "fechaActualizacion": "2026-07-19T14:08:46.000Z",
            "deletedAt": null,
            "version": 1
        }
    ]
}

Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener los registros.",
    "error": "Mensaje detallado del error"
}

---

## GET /api/v0/registrosTrazabilidad/:id
Obtiene un registro de trazabilidad por su ID.

Parametros URL:
- id: ID numerico del registro.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": {
        "id": 5,
        "uuid": "10a4dc29-8349-11f1-a686-06337dcb40ba",
        "grupoDatos": 1,
        "fincaId": 1,
        "estanqueOrigenId": 1,
        "estanqueDestinoId": 2,
        "colaboradorId": null,
        "creadoPorUsuarioId": 7,
        "creadoPorColaboradorId": null,
        "fecha": "2026-07-19",
        "tamano": 0.5,
        "dias": 30,
        "pl": 15000,
        "tipoMovimiento": "SIEMBRA",
        "activo": true,
        "fechaCreacion": "2026-07-19T14:08:46.000Z",
        "fechaActualizacion": "2026-07-19T14:08:46.000Z",
        "deletedAt": null,
        "version": 1
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

---

## POST /api/v0/registrosTrazabilidad
Registra un nuevo movimiento de trazabilidad.

Body (JSON):
{
    "fincaId":           1,
    "estanqueOrigenId":  1,
    "estanqueDestinoId": 2,
    "fecha":             "2026-07-19",
    "tamano":            0.5,
    "dias":              30,
    "pl":                15000,
    "colaboradorId":     null
}

Notas:
- `colaboradorId` es **opcional**: representa el colaborador responsable del movimiento en campo (por ejemplo, quien lo hizo fisicamente). El front lo manda solo si tiene esa informacion (ej. un selector de colaboradores); si no se envia, queda `null`.
- `creadoPorUsuarioId` y `creadoPorColaboradorId` **no se envian en el body**, el backend los resuelve solo con `obtenerContextoPeticion(req)`:
  - Si quien esta autenticado es un usuario web (login por `/login`), se llena `creadoPorUsuarioId` y `creadoPorColaboradorId` queda `null`.
  - Si quien esta autenticado es un colaborador (login por PIN desde la APK), es al reves: se llena `creadoPorColaboradorId` y `creadoPorUsuarioId` queda `null`.
- `fincaId`, `estanqueOrigenId` y `estanqueDestinoId` son numericos (IDs reales de la base de datos, no slugs de texto).
- `estanqueOrigenId` y `estanqueDestinoId` no pueden ser el mismo valor.
- `fecha` no puede ser una fecha futura.
- `estanqueDestinoId` no puede estar ocupado: si su ultimo movimiento activo lo dejo como destino (sin un movimiento posterior que lo libere como origen), el endpoint responde `400`.
- `tipoMovimiento` no se envia en el body: el backend siempre lo guarda como `"SIEMBRA"`.

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro guardado correctamente.",
    "data": {
        "id": 5,
        "uuid": "10a4dc29-8349-11f1-a686-06337dcb40ba",
        "grupoDatos": 1,
        "fincaId": 1,
        "estanqueOrigenId": 1,
        "estanqueDestinoId": 2,
        "colaboradorId": null,
        "creadoPorUsuarioId": 7,
        "creadoPorColaboradorId": null,
        "fecha": "2026-07-19",
        "tamano": 0.5,
        "dias": 30,
        "pl": 15000,
        "tipoMovimiento": "SIEMBRA",
        "activo": true,
        "fechaCreacion": "2026-07-19T14:08:46.000Z",
        "fechaActualizacion": "2026-07-19T14:08:46.000Z",
        "deletedAt": null,
        "version": 1
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El estanque origen y destino no pueden ser el mismo.",
    "error": null
}

400 Bad Request (estanque destino ocupado)
{
    "success": false,
    "message": "El estanque destino ya tiene un movimiento activo. Debe liberarse antes de recibir un nuevo movimiento.",
    "error": null
}

400 Bad Request (colaboradorId invalido)
{
    "success": false,
    "message": "El campo colaboradorId debe ser numerico y mayor a cero.",
    "error": null
}

---

Trazabilidad es un historico de movimientos: no existe edicion ni borrado (ni fisico ni logico). Si un movimiento se registro mal, se corrige registrando un movimiento nuevo, no editando ni ocultando el original.