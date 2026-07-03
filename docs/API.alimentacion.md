# Alimentación

## GET /api/v1/alimentaciones

Obtiene todos los registros de alimentación.

Respuesta:
200 OK

```json
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [ ... ]
}
```

---

## GET /api/v1/alimentaciones/:id

Obtiene un registro de alimentación por su ID.

**Parámetros URL:**

* id: ID numérico del registro.

**Respuesta exitosa:**
200 OK

```json
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
404 Not Found

```json
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}
```

---

## POST /api/v1/alimentaciones

Crea un nuevo registro de alimentación.

**Body (JSON):**

```json
{
    "finca": 1,
    "estanque": 2,
    "fecha": "2026-06-29",
    "hora": "7:00 AM",
    "metodo": "Boleo",
    "cantidadKg": 10,
    "presentacion": "Granulado",
    "proveedor": "Biomar",
    "tipoAlimento": "Balanceado engorde 38%",
    "observaciones": "Sin novedad."
}
```

**Respuesta exitosa:**
201 Created

```json
{
    "success": true,
    "message": "Registro creado correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
400 Bad Request

```json
{
    "success": false,
    "message": "Faltan campos requeridos.",
    "error": null
}
```

---

## PUT /api/v1/alimentaciones/:id

Actualiza un registro existente de alimentación.

**Parámetros URL:**

* id: ID numérico del registro.

**Body (JSON):**

```json
{
    "finca": 1,
    "estanque": 2,
    "fecha": "2026-06-30",
    "hora": "3:00 PM",
    "metodo": "Plato",
    "cantidadKg": 12,
    "presentacion": "Polvo",
    "proveedor": "Biomar",
    "tipoAlimento": "Balanceado premium 40%",
    "observaciones": "Actualizacion de registro."
}
```

**Respuesta exitosa:**
200 OK

```json
{
    "success": true,
    "message": "Registro actualizado correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
404 Not Found

```json
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}
```

---

## DELETE /api/v1/alimentaciones/:id

Elimina un registro de alimentación por su ID.

**Respuesta exitosa:**
200 OK

```json
{
    "success": true,
    "message": "Registro eliminado correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
404 Not Found

```json
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}
```