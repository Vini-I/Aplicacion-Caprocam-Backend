# Productos

## GET /api/productos
Obtiene todos los productos en estado ACTIVO del grupo de datos.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Productos obtenidos correctamente.",
    "data": [
        {
            "id": 10,
            "codigo": "PRD-1001",
            "grupoDatos": 2,
            "proveedorId": 3,
            "nombre": "Fertilizante Foliar H2",
            "categoria": "Fertilizante",
            "unidad": "Sacos",
            "precioUnidad": 3500,
            "cantidad": 50,
            "stockMinimo": 10,
            "entryDate": "2026-07-01",
            "expirationDate": "2027-07-01",
            "estado": "ACTIVO"
        }
    ]
}

---

## GET /api/productos/:id
Obtiene un producto activo por su ID.

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto obtenido correctamente.",
    "data": {
        "id": 10,
        "codigo": "PRD-1001",
        "grupoDatos": 2,
        "proveedorId": 3,
        "nombre": "Fertilizante Foliar H2",
        "categoria": "Fertilizante",
        "unidad": "Sacos",
        "precioUnidad": 3500,
        "cantidad": 50,
        "stockMinimo": 10,
        "entryDate": "2026-07-01",
        "expirationDate": "2027-07-01",
        "estado": "ACTIVO"
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}

---

## POST /api/productos
Crea un nuevo producto.

Body (JSON):
{
    "codigo":         "PRD-1001",
    "proveedorId":    3,
    "nombre":         "Fertilizante Foliar H2",
    "categoria":      "Fertilizante",
    "unidad":         "Sacos",
    "precioUnidad":   3500,
    "cantidad":       50,
    "stockMinimo":    10,
    "entryDate":      "2026-07-01",
    "expirationDate": "2027-07-01"
}

Campos requeridos: nombre

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Producto creado correctamente.",
    "data": {
        "id": 10,
        "codigo": "PRD-1001",
        "grupoDatos": 2,
        "proveedorId": 3,
        "nombre": "Fertilizante Foliar H2",
        "categoria": "Fertilizante",
        "unidad": "Sacos",
        "precioUnidad": 3500,
        "cantidad": 50,
        "stockMinimo": 10,
        "entryDate": "2026-07-01",
        "expirationDate": "2027-07-01",
        "estado": "ACTIVO"
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El nombre del producto es requerido.",
    "error": null
}

---

## PUT /api/productos/:id
Actualiza un producto existente.

Parametros URL:
- id: ID numerico del producto.

Body (JSON):
{
    "codigo":         "PRD-1001",
    "proveedorId":    3,
    "nombre":         "Fertilizante Foliar Premium",
    "categoria":      "Fertilizante",
    "unidad":         "Sacos",
    "precioUnidad":   3800,
    "cantidad":       45,
    "stockMinimo":    10,
    "entryDate":      "2026-07-01",
    "expirationDate": "2027-07-01"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto actualizado correctamente.",
    "data": {
        "id": 10,
        "codigo": "PRD-1001",
        "grupoDatos": 2,
        "proveedorId": 3,
        "nombre": "Fertilizante Foliar Premium",
        "categoria": "Fertilizante",
        "unidad": "Sacos",
        "precioUnidad": 3800,
        "cantidad": 45,
        "stockMinimo": 10,
        "entryDate": "2026-07-01",
        "expirationDate": "2027-07-01",
        "estado": "ACTIVO"
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}

---

## DELETE /api/productos/:id
Desactiva un producto (borrado logico).

Parametros URL:
- id: ID numerico del producto.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto desactivado correctamente.",
    "data": {
        "id": 10,
        "codigo": "PRD-1001",
        "nombre": "Fertilizante Foliar Premium",
        "estado": "INACTIVO"
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}