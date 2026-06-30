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
    "nombre": "Carlos",
    "apellidos": "Jiménez",
    "telefono": "66665555",
    "email": "carlos@empresa.com",
    "rol": "colaborador"
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
    "nombre": "Carlos",
    "apellidos": "Jiménez Corrected",
    "telefono": "66665555",
    "email": "carlos@empresa.com",
    "rol": "supervisor"
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

---

# Densidad Poblacional

## GET /api/v1/densidades-poblacionales
Obtiene todos los registros de densidad poblacional.

Respuesta:
200 OK
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/densidades-poblacionales/:id
Obtiene un registro por su ID.

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

## POST /api/v1/densidades-poblacionales
Crea un nuevo registro de densidad poblacional.

Body (JSON):
{
    "finca": 1,
    "estanque": 2,
    "fecha": "2026-06-29",
    "cantidadSiembra": 20,
    "areaEstanque": 3000,
    "metodoConteo": "Directo",
    "numeroCamarones": 250,
    "tirosAtarraya": 6,
    "areaAtarraya": 4.5,
    "promedioPorTiro": 41.6,
    "sobrevivencia": 89,
    "notasConteo": "Conteo inicial"
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos.",
    "error": null
}

---

## PUT /api/v1/densidades-poblacionales/:id
Actualiza un registro existente.

Parametros URL:
- id: ID numerico del registro.

Body (JSON):
{
    "finca": 2,
    "estanque": 1,
    "fecha": "2026-06-30",
    "cantidadSiembra": 22,
    "areaEstanque": 2800,
    "metodoConteo": "Directo",
    "numeroCamarones": 260,
    "tirosAtarraya": 5,
    "areaAtarraya": 3.5,
    "promedioPorTiro": 52,
    "sobrevivencia": 91,
    "notasConteo": "Actualizacion"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro actualizado correctamente.",
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

## DELETE /api/v1/densidades-poblacionales/:id
Elimina un registro por su ID.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}