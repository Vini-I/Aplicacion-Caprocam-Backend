# Inventario

## GET /api/v1/inventarios
Obtiene todos los productos activos del inventario con la bandera de stock bajo calculada.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Productos de inventario obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/inventarios/:id
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

## POST /api/v1/inventarios
Crea un nuevo producto de inventario.

Body (JSON):
{
    "codigo":      "ALI-004",
    "nombre":      "Alimento Biomar 40%",
    "categoria":   "Alimentación",
    "cantidad":    100,
    "unidad":      "kg",
    "stockMinimo": 20,
    "proveedor":   "Biomar",
    "precioUnidad": 1600
}

Campos requeridos: codigo, nombre, categoria

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
    "message": "Faltan campos requeridos: nombre, categoria.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un producto con ese codigo.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "La cantidad debe ser mayor o igual a 0.",
    "error": null
}

---

## PUT /api/v1/inventarios/:id
Actualiza un producto activo existente.

Parametros URL:
- id: ID numerico del producto.

Body (JSON):
{
    "codigo":      "ALI-002",
    "nombre":      "Melaza de caña refinada",
    "categoria":   "Alimentación",
    "cantidad":    60,
    "unidad":      "litros",
    "stockMinimo": 50,
    "proveedor":   "Trisan",
    "precioUnidad": 350
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

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe otro producto con ese codigo.",
    "error": null
}

---

## DELETE /api/v1/inventarios/:id
Elimina un producto por su ID (borrado logico).

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}
