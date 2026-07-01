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

---

# Estanques

## GET /api/v1/estanques
Obtiene todos los estanques registrados.

Respuesta:
200 OK
{
    "success": true,
    "message": "Estanques obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/estanques/:id
Obtiene un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Estanque obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Estanque no encontrado.",
    "error": null
}

---

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
    "message": "Estanque creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
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
    "message": "Estanque actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
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

## DELETE /api/v1/estanques/:id
Elimina un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Estanque eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Estanque no encontrado.",
    "error": null
}