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
    "nombre":          "Carlos",
    "apellidos":       "Jiménez",
    "telefono":        "66665555",
    "email":           "carlos@empresa.com",
    "rolId":           1,
    "nombreUsuario":   "cjimenez",
    "pinHash":         "1234",
    "tipoColaborador": "external_collab"
}

Campos requeridos: nombre, apellidos, rolId, nombreUsuario, pinHash
Campos opcionales: telefono, email, fincaId, tipoColaborador

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
    "message": "Faltan campos requeridos: rolId.",
    "error": null
}

---

## PUT /api/v0/colaboradores/:id
Actualiza un colaborador existente.

Parametros URL:
- id: ID numerico del colaborador.

Body (JSON):
{
    "nombre":          "Carlos",
    "apellidos":       "Jiménez Corrected",
    "telefono":        "66665555",
    "email":           "carlos@empresa.com",
    "rolId":           1,
    "tipoColaborador": "caprocam_collab"
}

Campos requeridos: nombre, apellidos, rolId
Campos opcionales: telefono, email, fincaId, tipoColaborador

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
Elimina un colaborador por su ID (borrado logico).

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
