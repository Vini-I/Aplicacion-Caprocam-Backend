# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto.
En el futuro se migrara a Swagger.

---

# Colaboradores

## GET /api/v1/colaboradores
Obtiene todos los colaboradores.

Respuesta:
200 OK
{
    "success": true,
    "message": "Colaboradores obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/colaboradores/:id
Obtiene un colaborador por su ID.

Parametros URL:
- id: ID numerico del colaborador.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Colaborador obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Colaborador no encontrado.",
    "error": null
}

---

## POST /api/v1/colaboradores
Crea un nuevo colaborador.

Body (JSON):
{
    "nombre":    "Carlos",
    "apellidos": "Jiménez",
    "telefono":  "66665555",
    "email":     "carlos@empresa.com",
    "rol":       "colaborador"
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Colaborador creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: rol.",
    "error": null
}

---

## PUT /api/v1/colaboradores/:id
Actualiza un colaborador existente.

Parametros URL:
- id: ID numerico del colaborador.

Body (JSON):
{
    "nombre":    "Carlos",
    "apellidos": "Jiménez Corrected",
    "telefono":  "66665555",
    "email":     "carlos@empresa.com",
    "rol":       "supervisor"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Colaborador actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Colaborador no encontrado.",
    "error": null
}

---

## DELETE /api/v1/colaboradores/:id
Elimina un colaborador por su ID.

Parametros URL:
- id: ID numerico del colaborador.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Colaborador eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Colaborador no encontrado.",
    "error": null
}

# Productos

## GET /api/v1/productos
Obtiene todos los productos en estado ACTIVO.

Respuesta:
200 OK
{
    "success": true,
    "message": "Productos obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/productos/:id
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

## POST /api/v1/productos
Crea un nuevo producto.

Body (JSON):
{
    "nombre": "Fertilizante Foliar H2",
    "categoria": "Fertilizante",
    "cantidad": 50,
    "stockMinimo": 10,
    "precioUnidad": 3500
}

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

## PUT /api/v1/productos/:id/activos
Desactiva un producto (Borrado logico).

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

---

## PUT /api/v1/productos/:id
Actualiza un producto existente.

Parametros URL:
- id: ID numerico del producto.

Body (JSON):
{
    "nombre": "Fertilizante Foliar Premium",
    "categoria": "Fertilizante",
    "cantidad": 45,
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

# Compradores

## GET /api/v1/compradores
Obtiene todos los compradores en estado ACTIVO.

Respuesta:
200 OK
{
    "success": true,
    "message": "Compradores obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/compradores/:id
Obtiene un comprador activo por su ID.

Parametros URL:
- id: ID numerico del comprador.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}

---

## POST /api/v1/compradores
Crea un nuevo comprador.

Body (JSON):
{
    "nombre": "AgroComercial S.A.",
    "contacto": "Juan Pérez",
    "telefono": "88334455"
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Comprador creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Nombre y contacto son requeridos.",
    "error": null
}

---

## PUT /api/v1/compradores/:id/activo
Desactiva un comprador (Borrado logico).

Parametros URL:
- id: ID numerico del comprador.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador desactivado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}

---

## PUT /api/v1/compradores/:id
Actualiza un comprador existente.

Parametros URL:
- id: ID numerico del comprador.

Body (JSON):
{
    "nombre": "AgroComercial S.A. Modificado",
    "contacto": "Juan Pérez",
    "telefono": "88334455"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}