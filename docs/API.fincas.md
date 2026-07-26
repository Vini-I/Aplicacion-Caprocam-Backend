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

## GET /api/v0/fincas/:codigoCBO
Obtiene una finca por su Codigo CBO.

Parametros URL:
- codigoCBO: ID CBO de la finca.

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
  "codigoCBO": "CBO-999",
  "nombreFinca": "Finca Linda Vista",
  "provincia": "Guanacaste",
  "canton": "Cañas",
  "distrito": "Cañas",
  "otrasSenas": "50 metros norte del cruce principal",
  "propietarioResponsable": "Roberto Gomez",
  "telefono": "88889999",
  "areaTotal": 45.5,
  "espejosAgua": 12.2
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

## PUT /api/v0/fincas/:codigoCBO
Actualiza una finca existente.

Parametros URL:
- codigoCBO: ID CBO de la finca a actualizar.

Body (JSON):
{
  "codigoCBO": "CBO-999",
  "nombreFinca": "Finca Linda Vista",
  "provincia": "Guanacaste",
  "canton": "Cañas",
  "distrito": "Cañas",
  "otrasSenas": "50 metros norte del cruce principal",
  "propietarioResponsable": "Roberto Gomez",
  "telefono": "87292564",
  "areaTotal": 45.5,
  "espejosAgua": 12.2
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

## DELETE /api/v0/fincas/:codigoCBO
Elimina una finca por su codigo CBO (borrado logico).

Parametros URL:
- codigoCBO: ID CBO de la finca a eliminar.

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
