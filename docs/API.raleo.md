# Raleo

## GET /api/v0/raleos

Obtiene todos los registros de raleo activos.

Respuesta:
200 OK

```json
{
    "success": true,
    "message": "Raleos obtenidos correctamente.",
    "data": [ ... ]
}
```

---

## GET /api/v0/raleos/1

Obtiene un registro de raleo mediante su ID.

**Parámetros URL:**

 id: ID numérico del raleo.

**Respuesta exitosa:**
200 OK

```json
{
    "success": true,
    "message": "Raleo obtenido correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
404 Not Found

```json
{
    "success": false,
    "message": "Raleo no encontrado.",
    "error": null
}
```

---

## POST /api/v0/raleos

Crea un nuevo registro de raleo.

**Body (JSON):**

```json
{
    "idFinca": 1,
    "idEstanque": 1,
    // ahora se llama desde el JWT por lo que no se agrega con el POST "idColaborador": 1,
    "fecha": "2026-07-07",
    "porcentaje": 30,
    "pesoEstimado": 0.35,
    "biomasaEstimado": 15.2,
    "objetivo": "Comercialización",
    "metodo": "Atarraya",
    "observaciones": "Raleo realizado sin inconvenientes."
}
```

**Métodos de raleo permitidos:**

```text
Atarraya
Red de arrastre
Boleo
Trampa selectiva
```

**Respuesta exitosa:**
201 Created

```json
{
    "success": true,
    "message": "Raleo creado correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
422 Unprocessable Entity

```json
{
    "success": false,
    "message": "Datos invalidos para el raleo.",
    "error": [
        "El campo idEstanque debe ser numerico y mayor que cero."
    ]
}
```

---

## DELETE /api/v0/raleos/1

Elimina lógicamente un registro de raleo mediante su ID.

El registro no se elimina físicamente de la base de datos.

Se actualizan los siguientes campos:

 activo = false
 deleted_at = fecha de eliminación
 version aumenta en 1

**Parámetros URL:**

 id: ID numérico del raleo.

**Respuesta exitosa:**
200 OK

```json
{
    "success": true,
    "message": "Raleo eliminado correctamente.",
    "data": { ... }
}
```

**Respuesta de error:**
404 Not Found

```json
{
    "success": false,
    "message": "Raleo no encontrado.",
    "error": null
}
```
