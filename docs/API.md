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

# Login

## POST /api/v1/login

Autentica un administrador web con usuario o correo y contrasena.

Body (JSON):
{
"usuario":    "admin01",
"contrasena": "Admin1234"
}

También se puede usar "correo" en lugar de "usuario":
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
"error": null
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Usuario no encontrado.",
"error": null
}

Respuesta de error:
401 Unauthorized
{
"success": false,
"message": "Credenciales incorrectas.",
"error": null
}


## POST /api/v1/login/registro

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
"data": {
"id":        4,
"nombre":    "Maria",
"apellidos": "Lopez",
"correo":    "maria@caprocam.com",
"usuario":   "maria01",
"rol":       "Administrador"
}
}

Respuesta de error:
400 Bad Request
{
"success": false,
"message": "Faltan campos requeridos: correo.",
"error": null
}

Respuesta de error:
409 Conflict
{
"success": false,
"message": "El correo ya esta registrado.",
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "La contrasena debe tener minimo 8 caracteres.",
"error": null
}


## POST /api/v1/login/registro-operario

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
"data": {
"id":     4,
"nombre": "Luis Fonseca",
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
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "El PIN debe tener exactamente 4 digitos numericos.",
"error": null
}


## POST /api/v1/login/verificar-pin

Verifica el PIN de un operario de campo desde la app movil.
Devuelve el rol y las pantallas permitidas para controlar
las vistas que se muestran en el dispositivo.

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
"error": null
}

Respuesta de error:
404 Not Found
{
"success": false,
"message": "Operario no encontrado.",
"error": null
}

Respuesta de error:
401 Unauthorized
{
"success": false,
"message": "PIN incorrecto.",
"error": null
}

Respuesta de error:
422 Unprocessable Entity
{
"success": false,
"message": "El PIN debe tener exactamente 4 digitos numericos.",
"error": null
}


## GET /api/v1/login/sincronizar

Devuelve la lista de operarios activos con sus hashes de PIN
para que la app movil los guarde en SQLite y pueda autenticar
sin conexion a internet. Requiere autenticacion.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Lista de operarios obtenida correctamente.",
    "data": [
        {
            "id":      2,
            "nombre":  "Carlos Mendoza",
            "pinHash": "2b$10
...",
            "rol":     "Operario de alimentacion"
        },
        {
            "id":      3,
            "nombre":  "Ana Solis",
            "pinHash": "2b$10
...",
            "rol":     "Supervisor de estanques"
        }
    ]
}


## GET /api/v1/login/:id

Obtiene un usuario por su ID. Requiere autenticacion.

Parametros URL:


id: ID numerico del usuario.


Respuesta exitosa:
200 OK
{
"success": true,
"message": "Usuario obtenido correctamente.",
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
404 Not Found
{
"success": false,
"message": "Usuario no encontrado.",
"error": null
}