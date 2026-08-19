# Proveedores

## GET /api/v1/proveedores
Obtiene todos los proveedores activos.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Proveedores obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/proveedores/:id
Obtiene un proveedor activo por su ID.

Parametros URL:
- id: ID numerico del proveedor.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Proveedor obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Proveedor no encontrado.",
    "error": null
}

---

## POST /api/v1/proveedores
Crea un nuevo proveedor.

Body (JSON):
{
    "nombre":       "Alimentos del Pacifico",
    "tipoProducto": "alimento",
    "telefono":     "+506 2233-4455",
    "correo":       "alimentos@pacifico.com",
    "direccion":    "Puntarenas, Costa Rica",
    "notas":        "Proveedor principal de camarina"
}

Campos requeridos: nombre

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Proveedor creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: nombre.",
    "error": null
}

---

## PUT /api/v1/proveedores/:id
Actualiza un proveedor activo existente.

Parametros URL:
- id: ID numerico del proveedor.

Body (JSON):
{
    "nombre":       "Alimentos del Pacifico Modificado",
    "tipoProducto": "alimento",
    "telefono":     "+506 2233-4455"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Proveedor actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Proveedor no encontrado.",
    "error": null
}

---

## DELETE /api/v1/proveedores/:id
Desactiva un proveedor por su ID (borrado logico).

Parametros URL:
- id: ID numerico del proveedor.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Proveedor eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Proveedor no encontrado.",
    "error": null
}
