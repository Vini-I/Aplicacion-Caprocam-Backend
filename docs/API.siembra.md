# Siembra (Lotes de Larva y Pre-crias)

## GET /api/v1/siembra/lotes
Obtiene todos los lotes de larva activos.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lotes de larva obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/siembra/lotes/:id
Obtiene un lote de larva activo por su ID.

Parametros URL:
- id: ID numerico del lote.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lote de larva obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lote de larva no encontrado.",
    "error": null
}

---

## POST /api/v1/siembra/lotes
Crea un nuevo lote de larva.

Body (JSON):
{
    "codigo_lote":       "LOT-2026-02",
    "proveedor":         "Alimentos del Pacífico",
    "laboratorio":       "LabMar",
    "procedencia":       "Nacional",
    "certificado_larva": "CERT-093",
    "pl_inicial":        12,
    "cantidad_inicial":  150000,
    "fecha_ingreso":     "2026-07-04"
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Lote de larva creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El proveedor indicado no existe.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un lote con ese codigo.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "Datos invalidos para el lote.",
    "error": [ "El campo pl_inicial debe ser un entero positivo." ]
}

---

## PUT /api/v1/siembra/lotes/:id
Actualiza un lote de larva existente.

Parametros URL:
- id: ID numerico del lote.

Body (JSON):
{
    "codigo_lote":       "LOT-2026-02-REV",
    "proveedor":         "Alimentos del Pacífico",
    "laboratorio":       "LabMar",
    "procedencia":       "Nacional",
    "certificado_larva": "CERT-093",
    "pl_inicial":        12,
    "cantidad_inicial":  150000,
    "fecha_ingreso":     "2026-07-04"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lote de larva actualizado correctamente.",
    "data": { ... }
}

---

## DELETE /api/v1/siembra/lotes/:id
Elimina un lote de larva por su ID (borrado logico).

Parametros URL:
- id: ID numerico del lote.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lote de larva eliminado correctamente.",
    "data": { ... }
}

---

## GET /api/v1/siembra/precrias
Obtiene todas las pre-crias activas.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-crias obtenidas correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/siembra/precrias/:id
Obtiene una pre-cria activa por su ID.

Parametros URL:
- id: ID numerico de la pre-cria.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-cria obtenida correctamente.",
    "data": { ... }
}

---

## POST /api/v1/siembra/precrias
Crea una nueva pre-cria.

Body (JSON):
{
    "id_lote_larva":    1,
    "id_finca":         1,
    "unidad_precria":   "Precria B",
    "fecha_inicio":     "2026-07-04",
    "cantidad_inicial": 80000,
    "pl_inicial":       10
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Pre-cria creada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El lote de larva indicado no existe.",
    "error": null
}

---

## POST /api/v1/siembra/precrias/:id/finalizar
Finaliza una pre-cria en estado ACTIVA.

Parametros URL:
- id: ID numerico de la pre-cria a finalizar.

Body (JSON):
{
    "fecha_fin":       "2026-07-10",
    "cantidad_final":  75000,
    "pl_final":        15
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-cria finalizada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "fecha_fin no puede ser menor que fecha_inicio.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "Datos invalidos para finalizar pre-cria.",
    "error": [ "cantidad_final debe ser entero positivo." ]
}

---

## DELETE /api/v1/siembra/precrias/:id
Elimina una pre-cria por su ID (borrado logico).

Parametros URL:
- id: ID numerico de la pre-cria.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Pre-cria eliminada correctamente.",
    "data": { ... }
}
