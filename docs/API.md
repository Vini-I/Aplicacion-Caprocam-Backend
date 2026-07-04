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
---

# Estanques

## GET /api/v1/estanques
Obtiene todos los estanques registrados.

Respuesta:
200 OK
{
    "success": true,
    "message": "Productos obtenidos correctamente.",
    "message": "Estanques obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/productos/:id
Obtiene un producto activo por su ID.

Parametros URL:
- id: ID numerico del producto.

## GET /api/v1/estanques/:id
Obtiene un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto obtenido correctamente.",
    "message": "Estanque obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "message": "Estanque no encontrado.",
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
## POST /api/v1/estanques
Crea un nuevo estanque.

Body (JSON):
{
    "idFinca": 1,
    "codigo": "EST-003",
    "tipoEstanque": "Engorde",
    "estado": "Activo",
    "largo": 100,
    "ancho": 80,
    "profundidad": 1,
    "fuenteAgua": "Pozo",
    "especie": "Litopenaeus vannamei - Camaron blanco",
    "fechaSiembra": "29/06/2026",
    "fechaInicioEngorde": "29/06/2026",
    "fechaMantenimiento": "29/06/2026",
    "densidadSiembra": 12,
    "usaPrecria": false,
    "metodoAlimentacion": "Manual",
    "proveedorAlimento": "Biomar",
    "numeroAireadores": 2,
    "tieneAlimentadorAutomatico": false
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Producto creado correctamente.",
    "message": "Estanque creado correctamente.",
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
    "message": "Faltan campos requeridos: codigo.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un estanque con ese codigo en la finca.",
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
## PUT /api/v1/estanques/:id
Actualiza un estanque existente.

Parametros URL:
- id: ID numerico del estanque.

Body (JSON):
{
    "idFinca": 1,
    "codigo": "EST-003",
    "tipoEstanque": "Engorde",
    "estado": "Mantenimiento",
    "largo": 100,
    "ancho": 80,
    "profundidad": 1,
    "fuenteAgua": "Pozo",
    "especie": "Litopenaeus vannamei - Camaron blanco",
    "fechaSiembra": "29/06/2026",
    "fechaInicioEngorde": "29/06/2026",
    "fechaMantenimiento": "29/06/2026",
    "densidadSiembra": 12,
    "usaPrecria": false,
    "metodoAlimentacion": "Manual",
    "proveedorAlimento": "Biomar",
    "numeroAireadores": 2,
    "tieneAlimentadorAutomatico": false
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Producto actualizado correctamente.",
    "message": "Estanque actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Producto no encontrado.",
    "message": "Estanque no encontrado.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe otro estanque con ese codigo en la finca.",
    "error": null
}

---

<<<<<<< HEAD
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
=======
## DELETE /api/v1/estanques/:id
Elimina un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador obtenido correctamente.",
    "message": "Estanque eliminado correctamente.",
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
    "message": "Estanque no encontrado.",
    "error": null
}

# Fisico Quimica
 
## GET /api/v1/lecturasFisicoQuimicas
Obtiene todas las lecturas fisico quimicas.
 
Respuesta:
200 OK
{
    "success": true,
    "message": "Lecturas obtenidas correctamente.",
    "data": [ ... ]
}
 
Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener las lecturas.",
    "error": "Mensaje detallado del error"
}
 
---
 
## GET /api/v1/lecturasFisicoQuimicas/:id
Obtiene una lectura fisico quimica por su ID.
 
Parametros URL:
- id: ID numerico de la lectura.
Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lectura obtenida correctamente.",
    "data": { ... }
}
 
Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lectura no encontrada.",
    "error": null
}
 
---
 
## POST /api/v1/lecturasFisicoQuimicas
Registra una nueva lectura fisico quimica.
 
Body (JSON):
{
    "fincaId":     1,
    "estanqueId":  "E-01",
    "fecha":       "2026-07-03",
    "ph":          [{ "valor": 7.8, "etiqueta": "mañana" }],
    "salinidad":   [{ "valor": 18.0, "etiqueta": "mañana" }],
    "temperatura": [{ "valor": 29.0, "etiqueta": "mañana" }],
    "oxigeno":     [{ "valor": 6.2, "etiqueta": "mañana" }]
}
 
Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Lectura registrada correctamente.",
    "data": { ... }
}
 
Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: oxigeno.",
    "error": null
}
 
---
 
## PUT /api/v1/lecturasFisicoQuimicas/:id/activo
Realiza el borrado logico de una lectura.
Invierte el estado activo del registro.
 
Parametros URL:
- id: ID numerico de la lectura.
Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Estado actualizado correctamente.",
    "data": { ... }
}
 
Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lectura no encontrada.",
    "error": null
}
 
---
 
# Trazabilidad
 
## GET /api/v1/registrosTrazabilidad
Obtiene todos los registros de trazabilidad.
 
Respuesta:
200 OK
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [ ... ]
}
 
Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener los registros.",
    "error": "Mensaje detallado del error"
}
 
---
 
## GET /api/v1/registrosTrazabilidad/:id
Obtiene un registro de trazabilidad por su ID.
 
Parametros URL:
- id: ID numerico del registro.
Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": { ... }
}
 
Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}
 
---
 
## POST /api/v1/registrosTrazabilidad
Registra un nuevo movimiento de trazabilidad.
 
Body (JSON):
{
    "fincaId":           1,
    "estanqueOrigenId":  "E-01",
    "estanqueDestinoId": "E-05",
    "fecha":             "2026-07-03",
    "colaboradorId":     3,
    "tamano":            8.5,
    "dias":              45,
    "pl":                5000
}
 
Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro guardado correctamente.",
    "data": { ... }
}
 
Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El estanque origen y destino no pueden ser el mismo.",
    "error": null
}
 
---
 
## PUT /api/v1/registrosTrazabilidad/:id/activo
Realiza el borrado logico de un registro de trazabilidad.
Invierte el estado activo del registro.
 
Parametros URL:
- id: ID numerico del registro.
Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Estado actualizado correctamente.",
    "data": { ... }
}
 
Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}
 