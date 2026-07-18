# Fincas

## GET /api/v0/fincas
Obtiene todas las fincas registradas.

Respuesta:
200 OK
{
    "success": true,
    "message": "Fincas obtenidas correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/fincas/:idCBO
Obtiene una finca por su ID CBO.

Parametros URL:
- idCBO: ID CBO de la finca.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Finca obtenida correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Finca no encontrada.",
    "error": null
}

---

## POST /api/v0/fincas
Crea una nueva finca.

Body (JSON):
{
    "idCBO":                   1,
    "nombreFinca":             "Finca La Reina",
    "provincia":               "Guanacaste",
    "canton":                  "Nandayure",
    "distrito":                "Bongo",
    "otrasSenas":              "Frente a la carretera principal",
    "propietarioResponsable":  "Juan Pérez",
    "telefono":                "88776655",
    "areaTotal":               50,
    "espejosAgua":             15
}

Campos requeridos: idCBO, nombreFinca, provincia, canton, distrito, propietarioResponsable, telefono, areaTotal, espejosAgua
Campos opcionales: otrasSenas

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Finca creada correctamente.",
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

## PUT /api/v0/fincas/:idCBO
Actualiza una finca existente.

Parametros URL:
- idCBO: ID CBO de la finca a actualizar.

Body (JSON):
{
    "idCBO":                   1,
    "nombreFinca":             "Finca La Reina Actualizada",
    "provincia":               "Guanacaste",
    "canton":                  "Nandayure",
    "distrito":                "Bongo",
    "otrasSenas":              "Frente a la carretera principal, sector este",
    "propietarioResponsable":  "Juan Pérez García",
    "telefono":                "88776655",
    "areaTotal":               55,
    "espejosAgua":             18
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Finca actualizada correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Finca no encontrada.",
    "error": null
}

---

## DELETE /api/v0/fincas/:idCBO
Elimina una finca por su ID CBO (borrado logico).

Parametros URL:
- idCBO: ID CBO de la finca a eliminar.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Finca eliminada correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Finca no encontrada.",
    "error": null
}
