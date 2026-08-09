# Login

## Contrato de errores (nuevo)
Todos los endpoints de login ahora devuelven errores con un codigo estable (`code`) y detalles estructurados (`details`) para que backend y frontend personalicen mensajes por caso sin depender del texto en `message`.

Formato:
{
    "success": false,
    "message": "Mensaje legible para usuario (opcional usar en frontend)",
    "code": "CODIGO_ESTABLE_PARA_FRONTEND",
    "details": {
        "field": "campo-opcional",
        "fields": ["lista", "de", "campos"],
        "intentosRestantes": 3,
        "tiempoRestanteMinutos": 12
    },
    "error": null
}

## POST /api/v0/login
Autentica un administrador web con usuario o correo y contrasena.

Body (JSON):
{
    "usuario":    "admin01",
    "contrasena": "Admin1234"
}

Tambien se puede usar correo en lugar de usuario:
{
    "correo":     "marco@caprocam.com",
    "contrasena": "Admin1234"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Login exitoso.",
    "data": {
        "id":        1,
        "nombre":    "Marco",
        "apellidos": "Vasquez",
        "correo":    "marco@caprocam.com",
        "usuario":   "admin01",
        "rol":       "Administrador"
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: contrasena.",
    "code": "LOGIN_FIELDS_REQUIRED",
    "details": {
        "fields": ["contrasena"]
    },
    "error": null
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Usuario no encontrado.",
    "code": "LOGIN_USER_NOT_FOUND",
    "details": null,
    "error": null
}

Respuesta de error:
401 Unauthorized
{
    "success": false,
    "message": "Credenciales incorrectas.",
    "code": "LOGIN_PASSWORD_INVALID",
    "details": {
        "intentosRestantes": 2
    },
    "error": null
}

---

## POST /api/v0/login/registro
Registra un nuevo administrador web. Requiere autenticacion.

Body (JSON):
{
    "nombre":     "Maria",
    "apellidos":  "Lopez",
    "correo":     "maria@caprocam.com",
    "usuario":    "maria01",
    "contrasena": "Segura2024",
    "rolId":      1
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Administrador registrado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: correo.",
    "code": "REGISTER_FIELDS_REQUIRED",
    "details": {
        "fields": ["correo"]
    },
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "El correo ya esta registrado.",
    "code": "REGISTER_EMAIL_CONFLICT",
    "details": {
        "field": "correo"
    },
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "La contrasena debe tener minimo 8 caracteres.",
    "code": "REGISTER_PASSWORD_WEAK",
    "details": {
        "field": "contrasena"
    },
    "error": null
}

---

## POST /api/v0/login/registro-operario
Registra un nuevo operario de campo con PIN de 4 digitos.
Solo accesible por administradores. Requiere autenticacion.

Body (JSON):
{
    "nombre": "Luis Fonseca",
    "rolId":  2,
    "pin":    "3391"
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Operario registrado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: pin.",
    "code": "OPERARIO_REGISTER_FIELDS_REQUIRED",
    "details": {
        "fields": ["pin"]
    },
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "El PIN debe tener exactamente 4 digitos numericos.",
    "code": "OPERARIO_PIN_INVALID_FORMAT",
    "details": {
        "field": "pin"
    },
    "error": null
}

---

## POST /api/v0/login/verificar-pin
Verifica el PIN de un operario de campo desde la app movil.
Devuelve el rol y las pantallas permitidas.

Body (JSON):
{
    "operarioId": 2,
    "pin":        "1984"
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "PIN verificado correctamente.",
    "data": {
        "id":     2,
        "nombre": "Carlos Mendoza",
        "rol": {
            "id":                  2,
            "nombre":              "Operario de alimentacion",
            "pantallasPermitidas": ["registro-alimentacion", "historial-estanques"]
        }
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: pin.",
    "code": "VERIFY_PIN_FIELDS_REQUIRED",
    "details": {
        "fields": ["pin"]
    },
    "error": null
}

Respuesta de error:
401 Unauthorized
{
    "success": false,
    "message": "PIN incorrecto.",
    "code": "VERIFY_PIN_INVALID",
    "details": {
        "field": "pin"
    },
    "error": null
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Operario no encontrado.",
    "code": "VERIFY_PIN_OPERARIO_NOT_FOUND",
    "details": null,
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "El PIN debe tener exactamente 4 digitos numericos.",
    "code": "VERIFY_PIN_INVALID_FORMAT",
    "details": {
        "field": "pin"
    },
    "error": null
}

---

## GET /api/v0/login/sincronizar
Devuelve la lista de operarios activos con sus hashes de PIN
para que la app movil los guarde en SQLite y pueda autenticar sin conexion.
Requiere autenticacion.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lista de operarios obtenida correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/login/:id
Obtiene un usuario por su ID. Requiere autenticacion.

Parametros URL:
- id: ID numerico del usuario.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Usuario obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Usuario no encontrado.",
    "code": "USER_NOT_FOUND",
    "details": null,
    "error": null
}
