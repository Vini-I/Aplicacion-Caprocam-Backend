# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto.
En el futuro se migrara a Swagger.

---

# Colaboradores

## GET /api/v0/colaboradores
Obtiene todos los colaboradores.

Respuesta:
200 OK
{
    "success": true,
    "message": "Colaboradores obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/colaboradores/:id
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

## POST /api/v0/colaboradores
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

## PUT /api/v0/colaboradores/:id
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

## DELETE /api/v0/colaboradores/:id
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

## GET /api/v0/productos
Obtiene todos los productos en estado ACTIVO.
---

# Estanques

## GET /api/v0/estanques
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

## GET /api/v0/productos/:id
Obtiene un producto activo por su ID.

Parametros URL:
- id: ID numerico del producto.

## GET /api/v0/estanques/:id
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

## POST /api/v0/productos
Crea un nuevo producto.

Body (JSON):
{
    "nombre": "Fertilizante Foliar H2",
    "categoria": "Fertilizante",
    "cantidad": 50,
    "stockMinimo": 10,
    "precioUnidad": 3500
}

## POST /api/v0/estanques
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

## PUT /api/v0/productos/:id/activos
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

## PUT /api/v0/productos/:id
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

## PUT /api/v0/estanques/:id
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

## DELETE /api/v0/estanques/:id
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

# Compradores

## GET /api/v0/compradores
Obtiene todos los compradores en estado ACTIVO.

Respuesta:
200 OK
{
    "success": true,
    "message": "Compradores obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/compradores/:id
Obtiene un comprador activo por su ID.

Parametros URL:
- id: ID numerico del comprador.

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}

---

## POST /api/v0/compradores
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

## PUT /api/v0/compradores/:id/activo
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

## PUT /api/v0/compradores/:id
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


# Crecimiento
## GET /api/v0/crecimiento
Obtiene todos los registros de crecimiento disponibles en la mockdata.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registros de crecimiento obtenidos correctamente.",
    "data": [
        {
            "id": "1",
            "finca": "Finca La Perla",
            "estanque": "EST-01",
            "pesoActual": 2.5
        },
        {
            "id": "2",
            "finca": "Finca La Perla",
            "estanque": "EST-02",
            "pesoActual": 3.1
        }
    ]
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

---

## GET /api/v0/crecimiento/:id
Obtiene un registro de crecimiento por su ID.

Parametros URL:
- id: Identificador del registro.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": {
        "id": "1",
        "finca": "Finca La Perla",
        "estanque": "EST-01",
        "pesoActual": 2.5
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

---

## POST /api/v0/crecimiento
Crea un nuevo registro de crecimiento.

Body (JSON):
{
    "id": "3",
    "finca": "Finca La Perla",
    "estanque": "EST-03",
    "pesoActual": 4.2
}

Campos requeridos:
- finca
- estanque
- pesoActual

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro de crecimiento creado correctamente.",
    "data": {
        "id": "3",
        "finca": "Finca La Perla",
        "estanque": "EST-03",
        "pesoActual": 4.2
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Finca y estanque son requeridos.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "El peso actual es requerido y debe ser un numero mayor o igual a cero.",
    "error": null
}

---

## PUT /api/v0/crecimiento/:id
Actualiza un registro de crecimiento existente.

Parametros URL:
- id: Identificador del registro a actualizar.

Body (JSON):
{
    "id": "1",
    "finca": "Finca La Perla",
    "estanque": "EST-01",
    "pesoActual": 5.1
}

Campos requeridos:
- finca
- estanque
- pesoActual

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro de crecimiento actualizado correctamente.",
    "data": {
        "id": "1",
        "finca": "Finca La Perla",
        "estanque": "EST-01",
        "pesoActual": 5.1
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado",
    "error": null
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Finca y estanque son requeridos.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "El peso actual es requerido y debe ser un numero mayor o igual a cero.",
    "error": null
}

---

## DELETE /api/v0/crecimiento/:id
Elimina un registro de crecimiento por su ID.

Parametros URL:
- id: Identificador del registro a eliminar.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro eliminado correctamente",
    "data": {
        "id": "1",
        "finca": "Finca La Perla",
        "estanque": "EST-01",
        "pesoActual": 2.5
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado",
    "error": null
}