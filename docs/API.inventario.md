# Salud de la API

## GET /

Verifica que la API este funcionando correctamente.

Respuesta:
200 OK
```json
{
    "success": true,
    "message": "API CAPROCAM funcionando correctamente."
}
```

---

# Proveedores

## GET /api/v0/proveedores

Obtiene todos los proveedores activos.

Respuesta:
200 OK
```json
{
    "success": true,
    "message": "Proveedores obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "uuid": "uuid-del-proveedor",
            "nombre": "Acuacultura Del Pacifico SA",
            "tipoProducto": "Alimento",
            "telefono": "+506 8888-8888",
            "correo": "proveedor@correo.com",
            "direccion": "Direccion del proveedor",
            "notas": "Notas del proveedor",
            "activo": true,
            "fechaCreacion": "2026-07-06T00:00:00.000Z",
            "fechaActualizacion": "2026-07-06T00:00:00.000Z",
            "version": 1
        }
    ]
}
```

---

## GET /api/v0/proveedores/:id

Obtiene un proveedor por su ID.

Parametros URL:

- id: ID numerico del proveedor.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Proveedor obtenido correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-proveedor",
        "nombre": "Acuacultura Del Pacifico SA",
        "tipoProducto": "Alimento",
        "telefono": "+506 8888-8888",
        "correo": "proveedor@correo.com",
        "direccion": "Direccion del proveedor",
        "notas": "Notas del proveedor",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Proveedor no encontrado.",
    "error": null
}
```

---

## POST /api/v0/proveedores

Crea un nuevo proveedor.

Body:
```json
{
    "nombre": "Proveedor Demo",
    "tipoProducto": "Alimento",
    "telefono": "+506 8888-8888",
    "correo": "proveedor@correo.com",
    "direccion": "Direccion del proveedor",
    "notas": "Notas del proveedor"
}
```

Valores permitidos para tipoProducto:

- Alimento
- Antibiotico
- Fertilizante
- Probioticos
- Equipos
- Larva
- Otro

Respuesta exitosa:
201 Created
```json
{
    "success": true,
    "message": "Proveedor creado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-proveedor",
        "nombre": "Proveedor Demo",
        "tipoProducto": "Alimento",
        "telefono": "+506 8888-8888",
        "correo": "proveedor@correo.com",
        "direccion": "Direccion del proveedor",
        "notas": "Notas del proveedor",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
409 Conflict
```json
{
    "success": false,
    "message": "Ya existe un proveedor con ese nombre.",
    "error": null
}
```

Respuesta de error:
422 Unprocessable Entity
```json
{
    "success": false,
    "message": "Datos invalidos para el proveedor.",
    "error": [
        "El campo nombre es requerido."
    ]
}
```

---

## PUT /api/v0/proveedores/:id

Actualiza un proveedor existente.

Parametros URL:

- id: ID numerico del proveedor.

Body:
```json
{
    "nombre": "Proveedor Actualizado",
    "tipoProducto": "Equipos",
    "telefono": "+506 8888-8888",
    "correo": "proveedor@correo.com",
    "direccion": "Nueva direccion",
    "notas": "Nuevas notas"
}
```

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Proveedor actualizado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-proveedor",
        "nombre": "Proveedor Actualizado",
        "tipoProducto": "Equipos",
        "telefono": "+506 8888-8888",
        "correo": "proveedor@correo.com",
        "direccion": "Nueva direccion",
        "notas": "Nuevas notas",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 2
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Proveedor no encontrado.",
    "error": null
}
```

Respuesta de error:
409 Conflict
```json
{
    "success": false,
    "message": "Ya existe otro proveedor con ese nombre.",
    "error": null
}
```

---

## DELETE /api/v0/proveedores/:id

Elimina logicamente un proveedor.

Parametros URL:

- id: ID numerico del proveedor.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Proveedor eliminado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-proveedor",
        "nombre": "Proveedor Demo",
        "tipoProducto": "Alimento",
        "telefono": "+506 8888-8888",
        "correo": "proveedor@correo.com",
        "direccion": "Direccion del proveedor",
        "notas": "Notas del proveedor",
        "activo": false,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Proveedor no encontrado.",
    "error": null
}
```

---

# Inventario

## GET /api/v0/inventario

Obtiene todos los productos activos del inventario.

Respuesta:
200 OK
```json
{
    "success": true,
    "message": "Productos de inventario obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "uuid": "uuid-del-inventario",
            "productoId": 1,
            "nombre": "Alimento 35%",
            "categoria": "Alimento",
            "unidad": "kg",
            "precioUnidad": 100,
            "cantidad": 50,
            "stockMinimo": 10,
            "proveedorId": 1,
            "activo": true,
            "fechaCreacion": "2026-07-06T00:00:00.000Z",
            "fechaActualizacion": "2026-07-06T00:00:00.000Z",
            "version": 1,
            "stockBajo": false
        }
    ]
}
```

---

## GET /api/v0/inventario/:id

Obtiene un producto de inventario por su ID.

Parametros URL:

- id: ID numerico del registro de inventario.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Producto obtenido correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-inventario",
        "productoId": 1,
        "nombre": "Alimento 35%",
        "categoria": "Alimento",
        "unidad": "kg",
        "precioUnidad": 100,
        "cantidad": 50,
        "stockMinimo": 10,
        "proveedorId": 1,
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 1,
        "stockBajo": false
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}
```

---

## POST /api/v0/inventario

Crea un producto y su registro de inventario.

Body:
```json
{
    "nombre": "Alimento 35%",
    "categoria": "Alimento",
    "cantidad": 50,
    "unidad": "kg",
    "stockMinimo": 10,
    "proveedorId": 1,
    "precioUnidad": 100
}
```

Valores permitidos para unidad:

- kg
- litros
- unidades
- sacos
- gramos

Respuesta exitosa:
201 Created
```json
{
    "success": true,
    "message": "Producto creado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-inventario",
        "productoId": 1,
        "nombre": "Alimento 35%",
        "categoria": "Alimento",
        "unidad": "kg",
        "precioUnidad": 100,
        "cantidad": 50,
        "stockMinimo": 10,
        "proveedorId": 1,
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 1,
        "stockBajo": false
    }
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "El proveedor indicado no existe.",
    "error": null
}
```

Respuesta de error:
409 Conflict
```json
{
    "success": false,
    "message": "Ya existe un producto con ese nombre.",
    "error": null
}
```

---

## PUT /api/v0/inventario/:id

Actualiza un producto y su registro de inventario.

Parametros URL:

- id: ID numerico del registro de inventario.

Body:
```json
{
    "nombre": "Alimento 40%",
    "categoria": "Alimento",
    "cantidad": 75,
    "unidad": "kg",
    "stockMinimo": 15,
    "proveedorId": 1,
    "precioUnidad": 120
}
```

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Producto actualizado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-inventario",
        "productoId": 1,
        "nombre": "Alimento 40%",
        "categoria": "Alimento",
        "unidad": "kg",
        "precioUnidad": 120,
        "cantidad": 75,
        "stockMinimo": 15,
        "proveedorId": 1,
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 2,
        "stockBajo": false
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}
```

Respuesta de error:
409 Conflict
```json
{
    "success": false,
    "message": "Ya existe otro producto con ese nombre.",
    "error": null
}
```

---

## DELETE /api/v0/inventario/:id

Elimina logicamente un producto de inventario.

Parametros URL:

- id: ID numerico del registro de inventario.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Producto eliminado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-inventario",
        "productoId": 1,
        "nombre": "Alimento 35%",
        "categoria": "Alimento",
        "unidad": "kg",
        "precioUnidad": 100,
        "cantidad": 50,
        "stockMinimo": 10,
        "proveedorId": 1,
        "activo": false,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "fechaActualizacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Producto no encontrado.",
    "error": null
}
```

---

# Siembra - Lotes de Larva

## GET /api/v0/siembra/lotes

Obtiene todos los lotes de larva activos.

Respuesta:
200 OK
```json
{
    "success": true,
    "message": "Lotes de larva obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "uuid": "uuid-del-lote",
            "codigoLote": "LOTE-001",
            "proveedorId": 1,
            "laboratorio": "Laboratorio Demo",
            "procedencia": "Puntarenas",
            "certificadoLarva": "CERT-001",
            "plInicial": 12,
            "cantidadInicial": 5000,
            "fechaIngreso": "2026-07-06T00:00:00.000Z",
            "estadoLote": "Disponible",
            "activo": true,
            "fechaCreacion": "2026-07-06T00:00:00.000Z",
            "version": 1
        }
    ]
}
```

---

## GET /api/v0/siembra/lotes/:id

Obtiene un lote de larva por su ID.

Parametros URL:

- id: ID numerico del lote de larva.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Lote de larva obtenido correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-lote",
        "codigoLote": "LOTE-001",
        "proveedorId": 1,
        "laboratorio": "Laboratorio Demo",
        "procedencia": "Puntarenas",
        "certificadoLarva": "CERT-001",
        "plInicial": 12,
        "cantidadInicial": 5000,
        "fechaIngreso": "2026-07-06T00:00:00.000Z",
        "estadoLote": "Disponible",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Lote de larva no encontrado.",
    "error": null
}
```

---

## POST /api/v0/siembra/lotes

Crea un nuevo lote de larva.

Body:
```json
{
    "codigo_lote": "LOTE-001",
    "proveedor_id": 1,
    "laboratorio": "Laboratorio Demo",
    "procedencia": "Puntarenas",
    "certificado_larva": "CERT-001",
    "pl_inicial": 12,
    "cantidad_inicial": 5000,
    "fecha_ingreso": "2026-07-06"
}
```

Respuesta exitosa:
201 Created
```json
{
    "success": true,
    "message": "Lote de larva creado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-lote",
        "codigoLote": "LOTE-001",
        "proveedorId": 1,
        "laboratorio": "Laboratorio Demo",
        "procedencia": "Puntarenas",
        "certificadoLarva": "CERT-001",
        "plInicial": 12,
        "cantidadInicial": 5000,
        "fechaIngreso": "2026-07-06T00:00:00.000Z",
        "estadoLote": "Disponible",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "El proveedor indicado no existe.",
    "error": null
}
```

Respuesta de error:
409 Conflict
```json
{
    "success": false,
    "message": "Ya existe un lote con ese codigo.",
    "error": null
}
```

---

## PUT /api/v0/siembra/lotes/:id

Actualiza un lote de larva existente.

Parametros URL:

- id: ID numerico del lote de larva.

Body:
```json
{
    "codigo_lote": "LOTE-001-ACT",
    "proveedor_id": 1,
    "laboratorio": "Laboratorio Actualizado",
    "procedencia": "Guanacaste",
    "certificado_larva": "CERT-002",
    "pl_inicial": 14,
    "cantidad_inicial": 6000,
    "fecha_ingreso": "2026-07-07"
}
```

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Lote de larva actualizado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-lote",
        "codigoLote": "LOTE-001-ACT",
        "proveedorId": 1,
        "laboratorio": "Laboratorio Actualizado",
        "procedencia": "Guanacaste",
        "certificadoLarva": "CERT-002",
        "plInicial": 14,
        "cantidadInicial": 6000,
        "fechaIngreso": "2026-07-07T00:00:00.000Z",
        "estadoLote": "Disponible",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 2
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Lote de larva no encontrado.",
    "error": null
}
```

Respuesta de error:
409 Conflict
```json
{
    "success": false,
    "message": "Ya existe otro lote con ese codigo.",
    "error": null
}
```

---

## DELETE /api/v0/siembra/lotes/:id

Elimina logicamente un lote de larva.

Parametros URL:

- id: ID numerico del lote de larva.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Lote de larva eliminado correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-del-lote",
        "codigoLote": "LOTE-001",
        "proveedorId": 1,
        "laboratorio": "Laboratorio Demo",
        "procedencia": "Puntarenas",
        "certificadoLarva": "CERT-001",
        "plInicial": 12,
        "cantidadInicial": 5000,
        "fechaIngreso": "2026-07-06T00:00:00.000Z",
        "estadoLote": "Disponible",
        "activo": false,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Lote de larva no encontrado.",
    "error": null
}
```

---

# Siembra - Pre-crias

## GET /api/v0/siembra/precrias

Obtiene todas las pre-crias activas.

Respuesta:
200 OK
```json
{
    "success": true,
    "message": "Pre-crias obtenidas correctamente.",
    "data": [
        {
            "id": 1,
            "uuid": "uuid-de-la-precria",
            "loteLarvaId": 1,
            "fincaId": 1,
            "estanqueId": 1,
            "fechaInicio": "2026-07-06T00:00:00.000Z",
            "fechaFin": null,
            "duracionDias": null,
            "cantidadInicial": 1000,
            "cantidadFinal": null,
            "plInicial": 12,
            "plFinal": null,
            "estado": "Activa",
            "activo": true,
            "fechaCreacion": "2026-07-06T00:00:00.000Z",
            "version": 1
        }
    ]
}
```

---

## GET /api/v0/siembra/precrias/:id

Obtiene una pre-cria por su ID.

Parametros URL:

- id: ID numerico de la pre-cria.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Pre-cria obtenida correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-de-la-precria",
        "loteLarvaId": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fechaInicio": "2026-07-06T00:00:00.000Z",
        "fechaFin": null,
        "duracionDias": null,
        "cantidadInicial": 1000,
        "cantidadFinal": null,
        "plInicial": 12,
        "plFinal": null,
        "estado": "Activa",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Pre-cria no encontrada.",
    "error": null
}
```

---

## POST /api/v0/siembra/precrias

Crea una nueva pre-cria.

Body:
```json
{
    "lote_larva_id": 1,
    "finca_id": 1,
    "estanque_id": 1,
    "fecha_inicio": "2026-07-06",
    "cantidad_inicial": 1000,
    "pl_inicial": 12,
    "estado": "Activa"
}
```

Respuesta exitosa:
201 Created
```json
{
    "success": true,
    "message": "Pre-cria creada correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-de-la-precria",
        "loteLarvaId": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fechaInicio": "2026-07-06T00:00:00.000Z",
        "fechaFin": null,
        "duracionDias": null,
        "cantidadInicial": 1000,
        "cantidadFinal": null,
        "plInicial": 12,
        "plFinal": null,
        "estado": "Activa",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "El lote de larva indicado no existe.",
    "error": null
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "La finca indicada no existe.",
    "error": null
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "El estanque indicado no existe o no pertenece a la finca.",
    "error": null
}
```

---

## PUT /api/v0/siembra/precrias/:id

Actualiza una pre-cria existente.

Parametros URL:

- id: ID numerico de la pre-cria.

Body:
```json
{
    "lote_larva_id": 1,
    "finca_id": 1,
    "estanque_id": 1,
    "fecha_inicio": "2026-07-06",
    "cantidad_inicial": 1200,
    "pl_inicial": 13,
    "estado": "Activa"
}
```

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Pre-cria actualizada correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-de-la-precria",
        "loteLarvaId": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fechaInicio": "2026-07-06T00:00:00.000Z",
        "fechaFin": null,
        "duracionDias": null,
        "cantidadInicial": 1200,
        "cantidadFinal": null,
        "plInicial": 13,
        "plFinal": null,
        "estado": "Activa",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 2
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Pre-cria no encontrada.",
    "error": null
}
```

---

## POST /api/v0/siembra/precrias/:id/finalizar

Finaliza una pre-cria activa.

Parametros URL:

- id: ID numerico de la pre-cria.

Body:
```json
{
    "fecha_fin": "2026-07-10",
    "cantidad_final": 900,
    "pl_final": 14
}
```

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Pre-cria finalizada correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-de-la-precria",
        "loteLarvaId": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fechaInicio": "2026-07-06T00:00:00.000Z",
        "fechaFin": "2026-07-10",
        "duracionDias": 4,
        "cantidadInicial": 1000,
        "cantidadFinal": 900,
        "plInicial": 12,
        "plFinal": 14,
        "estado": "Finalizada",
        "activo": true,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 2
    }
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "fecha_fin no puede ser menor que fecha_inicio.",
    "error": null
}
```

Respuesta de error:
400 Bad Request
```json
{
    "success": false,
    "message": "cantidad_final no puede ser mayor que cantidad_inicial.",
    "error": null
}
```

---

## DELETE /api/v0/siembra/precrias/:id

Elimina logicamente una pre-cria.

Parametros URL:

- id: ID numerico de la pre-cria.

Respuesta exitosa:
200 OK
```json
{
    "success": true,
    "message": "Pre-cria eliminada correctamente.",
    "data": {
        "id": 1,
        "uuid": "uuid-de-la-precria",
        "loteLarvaId": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fechaInicio": "2026-07-06T00:00:00.000Z",
        "fechaFin": null,
        "duracionDias": null,
        "cantidadInicial": 1000,
        "cantidadFinal": null,
        "plInicial": 12,
        "plFinal": null,
        "estado": "Activa",
        "activo": false,
        "fechaCreacion": "2026-07-06T00:00:00.000Z",
        "version": 1
    }
}
```

Respuesta de error:
404 Not Found
```json
{
    "success": false,
    "message": "Pre-cria no encontrada.",
    "error": null
}
```
