# Productos

## GET /api/v0/productos
Obtiene todos los productos en estado ACTIVO.

Respuesta:
200 OK
{
    "success": true,
    "message": "Productos obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/productos/:id
Obtiene un producto activo por su ID.

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}

---

## POST /api/v0/productos
Crea un nuevo producto.

Body (JSON):
{
    "nombre":      "Fertilizante Foliar H2",
    "categoria":   "Fertilizante",
    "cantidad":    50,
    "stockMinimo": 10,
    "precioUnidad": 3500
}

Campos requeridos: nombre, categoria

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Producto creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Nombre y categoria son requeridos.",
    "error": null
}

---

## PUT /api/v0/productos/:id
Actualiza un producto existente.

Parametros URL:
- id: ID numerico del producto.

Body (JSON):
{
    "nombre":      "Fertilizante Foliar Premium",
    "categoria":   "Fertilizante",
    "cantidad":    45,
    "stockMinimo": 10,
    "precioUnidad": 3800
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}

---

## PUT /api/v0/productos/:id/activos
Desactiva un producto (borrado logico).

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto desactivado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}
