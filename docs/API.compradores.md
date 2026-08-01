# Compradores

## GET /api/compradores
Obtiene todos los compradores en estado ACTIVO del grupo de datos.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Compradores obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "grupoDatos": 2,
            "nombre": "Hernesto Alfaro",
            "contacto": "798465132",
            "telefono": "12457836",
            "correo": "HernestoGuapo@gmail.com",
            "direccion": "San José, Costa Rica",
            "notas": "Observaciones adicionales...",
            "estado": "ACTIVO"
        }
    ]
}

---

## GET /api/compradores/:id
Obtiene un comprador activo por su ID.

Parametros URL:
- id: ID numerico del comprador.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador obtenido correctamente.",
    "data": {
        "id": 1,
        "grupoDatos": 2,
        "nombre": "Hernesto Alfaro",
        "contacto": "798465132",
        "telefono": "12457836",
        "correo": "HernestoGuapo@gmail.com",
        "direccion": "San José, Costa Rica",
        "notas": "Observaciones adicionales...",
        "estado": "ACTIVO"
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}

---

## POST /api/compradores
Crea un nuevo comprador.

Body (JSON):
{
    "nombre":    "Hernesto Alfaro",
    "cedula":    "798465132",
    "telefono":  "12457836",
    "email":     "HernestoGuapo@gmail.com",
    "direccion": "San José, Costa Rica",
    "notas":     "Observaciones adicionales..."
}

Campos requeridos: nombre

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Comprador creado correctamente.",
    "data": {
        "id": 1,
        "grupoDatos": 2,
        "nombre": "Hernesto Alfaro",
        "contacto": "798465132",
        "telefono": "12457836",
        "correo": "HernestoGuapo@gmail.com",
        "direccion": "San José, Costa Rica",
        "notas": "Observaciones adicionales...",
        "estado": "ACTIVO"
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "El nombre es requerido.",
    "error": null
}

---

## PUT /api/compradores/:id
Actualiza un comprador existente.

Parametros URL:
- id: ID numerico del comprador.

Body (JSON):
{
    "nombre":    "Hernesto Alfaro",
    "cedula":    "798465132",
    "telefono":  "12457836",
    "email":     "HernestoGuapo@gmail.com",
    "direccion": "San José, Costa Rica",
    "notas":     "Notas actualizadas"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador actualizado correctamente.",
    "data": {
        "id": 1,
        "grupoDatos": 2,
        "nombre": "Hernesto Alfaro",
        "contacto": "798465132",
        "telefono": "12457836",
        "correo": "HernestoGuapo@gmail.com",
        "direccion": "San José, Costa Rica",
        "notas": "Notas actualizadas",
        "estado": "ACTIVO"
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}

---

## DELETE /api/compradores/:id
Desactiva un comprador (borrado logico).

Parametros URL:
- id: ID numerico del comprador.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Comprador desactivado correctamente.",
    "data": {
        "id": 1,
        "grupoDatos": 2,
        "nombre": "Hernesto Alfaro",
        "estado": "INACTIVO"
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Comprador no encontrado.",
    "error": null
}