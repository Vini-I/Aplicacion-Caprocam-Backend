# Densidad Poblacional

## GET /api/v0/densidad-poblacional

Obtiene todos los registros de densidad poblacional activos.
Permite filtrar por query params: idFinca, idEstanque, grupoDatos.

Respuesta:
200 OK

```json
{
    "success": true,
    "message": "Registros de densidad poblacional obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "uuid": "b3f1c2a0-...",
            "grupoDatos": 1,
            "idFinca": 1,
            "idEstanque": 1,
            "fecha": "2026-07-06",
            "cantidadSiembra": 20,
            "areaEstanque": 3000,
            "numeroCamarones": 248,
            "tirosAtarraya": 6,
            "areaAtarraya": 4.5,
            "promedioPorTiro": 41.3,
            "sobrevivencia": 89,
            "densidad": 0.08,
            "notasConteo": "Prueba desde Postman",
            "activo": true,
            "fechaCreacion": "2026-07-06T10:00:00.000Z",
            "fechaActualizacion": "2026-07-06T10:00:00.000Z",
            "deletedAt": null,
            "version": 1
        }
    ]
}
```

---

## GET /api/v0/densidad-poblacional/:id

Obtiene un registro de densidad poblacional por su ID.

Parámetros URL:

- id: ID numérico del registro.

Respuesta exitosa:
200 OK

```json
{
    "success": true,
    "message": "Registro de densidad poblacional obtenido correctamente.",
    "data": { ... }
}
```

Respuesta de error:
404 Not Found

```json
{
    "success": false,
    "message": "Registro de densidad poblacional no encontrado.",
    "error": null
}
```

---

## POST /api/v0/densidad-poblacional

Crea un nuevo registro de densidad poblacional.

Body (JSON):

```json
{
    "idFinca": 1,
    "idEstanque": 1,
    "fecha": "2026-07-06",
    "cantidadSiembra": 20,
    "areaEstanque": 3000,
    "numeroCamarones": 248,
    "tirosAtarraya": 6,
    "areaAtarraya": 4.5,
    "promedioPorTiro": 41.3,
    "sobrevivencia": 89,
    "densidad": 0.08,
    "notasConteo": "Conteo de rutina"
}
```

Respuesta exitosa:
201 Created

```json
{
    "success": true,
    "message": "Registro de densidad poblacional creado correctamente.",
    "data": { ... }
}
```

Respuesta de error (campos faltantes):
400 Bad Request

```json
{
    "success": false,
    "message": "Faltan campos requeridos: idFinca, idEstanque, fecha.",
    "error": null
}
```

Respuesta de error (validación de negocio):
422 Unprocessable Entity

```json
{
    "success": false,
    "message": "Datos invalidos para el registro de densidad poblacional.",
    "error": [
        "El campo sobrevivencia debe ser un porcentaje entre 0 y 100."
    ]
}
```

Respuesta de error (duplicado):
409 Conflict

```json
{
    "success": false,
    "message": "Ya existe un registro de densidad poblacional para ese estanque en esa fecha.",
    "error": null
}
```

---

## PUT /api/v0/densidad-poblacional/:id

Actualiza un registro existente de densidad poblacional.

Parámetros URL:

- id: ID numérico del registro.

Body (JSON): igual estructura que el POST.

Respuesta exitosa:
200 OK

```json
{
    "success": true,
    "message": "Registro de densidad poblacional actualizado correctamente.",
    "data": { ... }
}
```

Respuesta de error:
404 Not Found

```json
{
    "success": false,
    "message": "Registro de densidad poblacional no encontrado.",
    "error": null
}
```

---

## DELETE /api/v0/densidad-poblacional/:id

Elimina lógicamente un registro de densidad poblacional (activo = false, deleted_at = now). No se elimina físicamente de la base de datos.

Respuesta exitosa:
200 OK

```json
{
    "success": true,
    "message": "Registro de densidad poblacional eliminado correctamente.",
    "data": { ... }
}
```

Respuesta de error:
404 Not Found

```json
{
    "success": false,
    "message": "Registro de densidad poblacional no encontrado.",
    "error": null
}
```
