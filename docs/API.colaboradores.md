# Colaboradores

## GET /api/v0/colaboradores
Obtiene todos los colaboradores del grupo.

Respuesta:
200 OK
{ "success": true, "message": "Colaboradores obtenidos correctamente.", "data": [...] }

---

## GET /api/v0/colaboradores/:id
Obtiene un colaborador por su ID.

Parametros URL:
- id: ID numerico del colaborador.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v0/colaboradores
Crea un nuevo colaborador.

Body (JSON):
{
    "nombre":          "Carlos",
    "apellidos":       "Jiménez",
    "cedula":          "123456789",
    "telefono":        "66665555",
    "email":           "carlos@empresa.com",
    "rolId":           1,
    "nombreUsuario":   "cjimenez",
    "pinHash":         "1234",
    "tipoColaborador": "external_collab"
}

Campos requeridos: nombre, apellidos, rolId, nombreUsuario, pinHash
Campos opcionales: cedula, telefono, email, fincaId, tipoColaborador

Respuesta exitosa:   201 Created
Respuesta de error:  400 Bad Request

---

## PUT /api/v0/colaboradores/:id
Actualiza un colaborador existente.

Parametros URL:
- id: ID numerico del colaborador.

Body (JSON):
{
    "nombre":          "Carlos",
    "apellidos":       "Jiménez Actualizado",
    "cedula":          "123456789",
    "telefono":        "66665555",
    "email":           "carlos@empresa.com",
    "rolId":           1,
    "tipoColaborador": "caprocam_collab"
}

Campos requeridos: nombre, apellidos, rolId
Campos opcionales: cedula, telefono, email, fincaId, tipoColaborador

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## DELETE /api/v0/colaboradores/:id
Elimina un colaborador por su ID (borrado logico).

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found