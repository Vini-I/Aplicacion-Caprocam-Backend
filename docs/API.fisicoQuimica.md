# Fisico Quimica

## GET /api/v0/lecturasFisicoQuimicas
Obtiene todas las lecturas fisico quimicas activas, limitadas al grupo de datos del usuario autenticado (JWT).

Respuesta:
200 OK
{
    "success": true,
    "message": "Lecturas obtenidas correctamente.",
    "data": [
        {
            "id": 13,
            "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
            "grupoDatos": 1,
            "fincaId": 1,
            "estanqueId": 1,
            "fecha": "2026-07-19",
            "ph": 7.8,
            "salinidad": 18,
            "temperatura": 29,
            "oxigenoDisuelto": 6.2,
            "activo": true,
            "creadoEn": "2026-07-19T13:42:27.000Z",
            "actualizadoEn": "2026-07-19T13:42:27.000Z",
            "deletedAt": null,
            "version": 1
        }
    ]
}

Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener las lecturas.",
    "error": "Mensaje detallado del error"
}

---

## GET /api/v0/lecturasFisicoQuimicas/estanque/:estanqueId?fecha=YYYY-MM-DD
Busca la lectura fisico quimica de un estanque en una fecha especifica. Sirve para que el frontend sepa si ya existe un registro ese dia (debe actualizar, mostrando el boton "Actualizar") o no existe todavia (debe crear uno nuevo, mostrando el boton "Guardar"), y para precargar los valores en el formulario.

Parametros URL:
- estanqueId: ID numerico del estanque.

Query string:
- fecha: Fecha a consultar, formato YYYY-MM-DD (obligatorio).

Respuesta exitosa (ya existe lectura ese dia):
200 OK
{
    "success": true,
    "message": "Consulta realizada correctamente.",
    "data": {
        "id": 13,
        "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
        "grupoDatos": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fecha": "2026-07-19",
        "ph": 8,
        "salinidad": 17.5,
        "temperatura": 28.5,
        "oxigenoDisuelto": 6.5,
        "activo": true,
        "creadoEn": "2026-07-19T13:42:27.000Z",
        "actualizadoEn": "2026-07-19T13:49:42.000Z",
        "deletedAt": null,
        "version": 2
    }
}

Respuesta exitosa (no existe lectura ese dia):
200 OK
{
    "success": true,
    "message": "Consulta realizada correctamente.",
    "data": null
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Debe indicar una fecha valida (YYYY-MM-DD) en el query string.",
    "error": null
}

---

## GET /api/v0/lecturasFisicoQuimicas/:id
Obtiene una lectura fisico quimica por su ID.

Parametros URL:
- id: ID numerico de la lectura.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lectura obtenida correctamente.",
    "data": {
        "id": 13,
        "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
        "grupoDatos": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fecha": "2026-07-19",
        "ph": 7.8,
        "salinidad": 18,
        "temperatura": 29,
        "oxigenoDisuelto": 6.2,
        "activo": true,
        "creadoEn": "2026-07-19T13:42:27.000Z",
        "actualizadoEn": "2026-07-19T13:42:27.000Z",
        "deletedAt": null,
        "version": 1
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lectura no encontrada.",
    "error": null
}

---

## POST /api/v0/lecturasFisicoQuimicas
Registra una nueva lectura fisico quimica.

Body (JSON):
{
    "fincaId":          1,
    "estanqueId":       1,
    "fecha":            "2026-07-19",
    "ph":               7.8,
    "salinidad":        18,
    "temperatura":      29,
    "oxigenoDisuelto":  6.2
}

Notas:
- Todos los campos son obligatorios y numericos (excepto `fecha`).
- `fecha` no puede ser una fecha futura.

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Lectura registrada correctamente.",
    "data": {
        "id": 13,
        "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
        "grupoDatos": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fecha": "2026-07-19",
        "ph": 7.8,
        "salinidad": 18,
        "temperatura": 29,
        "oxigenoDisuelto": 6.2,
        "activo": true,
        "creadoEn": "2026-07-19T13:42:27.000Z",
        "actualizadoEn": "2026-07-19T13:42:27.000Z",
        "deletedAt": null,
        "version": 1
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: oxigenoDisuelto.",
    "error": null
}

---

## PUT /api/v0/lecturasFisicoQuimicas/:id
Actualiza los valores de una lectura fisico quimica existente.

Parametros URL:
- id: ID numerico de la lectura.

Body (JSON):
{
    "fincaId":          1,
    "estanqueId":       1,
    "fecha":            "2026-07-19",
    "ph":               8,
    "salinidad":        17.5,
    "temperatura":      28.5,
    "oxigenoDisuelto":  6.5
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lectura actualizada correctamente.",
    "data": {
        "id": 13,
        "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
        "grupoDatos": 1,
        "fincaId": 1,
        "estanqueId": 1,
        "fecha": "2026-07-19",
        "ph": 8,
        "salinidad": 17.5,
        "temperatura": 28.5,
        "oxigenoDisuelto": 6.5,
        "activo": true,
        "creadoEn": "2026-07-19T13:42:27.000Z",
        "actualizadoEn": "2026-07-19T13:49:42.000Z",
        "deletedAt": null,
        "version": 2
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Lectura no encontrada.",
    "error": null
}