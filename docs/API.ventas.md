# Ventas

## GET /api/v0/ventas
Obtiene todas las ventas registradas.

Respuesta:
200 OK
{
    "success": true,
    "message": "Ventas obtenidas correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/ventas/:id
Obtiene una venta por su ID.

Parametros URL:
- id: ID numerico de la venta.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Venta obtenida correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Venta no encontrada.",
    "error": null
}

---

## POST /api/v0/ventas
Crea una nueva venta.

Body (JSON):
{
    "finca":          "Finca El Oasis",
    "estanque":       "EST-02",
    "pesoPromedio":   14.2,
    "tamanoPromedio": 11.4,
    "cantVendida":    850,
    "precioKilo":     4700,
    "fecha":          "2026-07-04",
    "total":          3995000,
    "colaborador":    "Ana Rojas",
    "comprador":      "Peces del Pacífico"
}

Campos requeridos: finca, estanque, pesoPromedio, tamanoPromedio, cantVendida, precioKilo, fecha, total, colaborador, comprador

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Venta creada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "La finca es obligatoria.",
    "error": null
}

---

## PUT /api/v0/ventas/:id
Actualiza una venta existente.

Parametros URL:
- id: ID numerico de la venta.

Body (JSON):
{
    "finca":          "Finca La Perla",
    "estanque":       "EST-01",
    "pesoPromedio":   15.5,
    "tamanoPromedio": 12,
    "cantVendida":    1000,
    "precioKilo":     4500,
    "fecha":          "2026-07-04",
    "total":          4500000,
    "colaborador":    "Marco Vásquez",
    "comprador":      "Mariscos del Rey"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Venta actualizada correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Venta no encontrada.",
    "error": null
}

---

## DELETE /api/v0/ventas/:id
Elimina una venta por su ID.

Parametros URL:
- id: ID numerico de la venta.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Venta eliminada correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Venta no encontrada.",
    "error": null
}
