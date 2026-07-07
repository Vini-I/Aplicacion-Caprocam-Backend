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
        {"id":9,
        "uuid":"9bbe3da9-7986-11f1-a3af-02f56c154965",
        "grupoDatos":1,
        "idFinca":1,
        "idEstanque":1,
        "idProveedor":null,
        "idProducto":null,
        "fecha":"2026-07-06",
        "hora":"7:00 AM",
        "metodo":"Plato",
        "cantidadKg":18.5,
        "presentacion":"Granulado",
        "proveedor":"Biomar",
        "tipoAlimento":"Antibitico",
        "observaciones":"Primera alimentación del día",
        "activo":true,
        "fechaCreacion":"2026-07-07T04:04:07.000Z",
        "fechaActualizacion":"2026-07-07T04:04:07.000Z",
        "deletedAt":null,
        "version":1}
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
    "grupoDatos": 1,
    "idFinca": 1,
    "idEstanque": 1,
    "idProveedor": null,
    "idProducto": null,
    "fecha": "2026-07-06",
    "hora": "3:00 PM",
    "metodo": "Plato",
    "cantidadKg": 18.5,
    "presentacion": "Granulado",
    "proveedor": "Biomar",
    "tipoAlimento": "Antibiotico",
    "observaciones": "Primera alimentación del día"
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
    "estanque": 1,
    "fecha": "2026-07-06",
    "hora": "7:00 AM",
    "metodo": "Boleo",
    "cantidadKg": 12,
    "presentacion": "Granulado",
    "proveedor": "Biomar",
    "tipoAlimento": "Antibiotico",
    "observaciones": "Actualizacion de registro"
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