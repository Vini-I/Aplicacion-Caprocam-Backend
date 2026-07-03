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

# Crecimiento
## GET /api/v0/crecimiento/fincas
Obtiene la lista de todas las fincas activas.

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
    "success": true,
    "message": "Fincas obtenidas correctamente.",
    "data": [
        {
            "id": 1,
            "codigo": "FIN001",
            "nombre": "Finca Central"
        },
        {
            "id": 2,
            "codigo": "FIN002",
            "nombre": "Finca Norte"
        }
    ]
}

Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener las fincas.",
    "error": "Mensaje detallado del error"
}

---

## GET /api/v0/crecimiento/fincas/:fincaId/estanques
Obtiene todos los estanques asociados a una finca especifica.

Parametros URL:
- fincaId: ID numerico de la finca.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Estanques obtenidos correctamente.",
    "data": [
        {
            "id": 1,
            "fincaId": 1,
            "codigo": "EST001",
            "nombre": "Estanque A",
            "diasCultivo": 45,
            "pesoActual": 180,
            "estado": "ACTIVO"
        }
    ]
}

Respuesta de error:
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener los estanques.",
    "error": "Mensaje detallado del error"
}

---

## GET /api/v0/crecimiento/estanque/:id
Obtiene la informacion detallada de un estanque especifico junto
con el peso de la ultima lectura (peso anterior).

Parametros URL:
- id: ID numerico del estanque.

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
    "success": true,
    "message": "Informacion del estanque obtenida correctamente.",
    "data": {
        "id": 1,
        "codigo": "EST001",
        "nombre": "Estanque A",
        "diasCultivo": 45,
        "pesoAnterior": 180,
        "estado": "ACTIVO"
    }
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
    "success": false,
    "message": "El estanque no existe.",
    "error": null
}

---

## POST /api/v0/crecimiento
Registra un nuevo control de crecimiento para un estanque y
actualiza de manera automatica su peso actual.

Body (JSON):
{
    "estanqueId": 1,
    "pesoActual": 195.5,
    "observacion": "Los peces muestran buena actividad y desarrollo alimenticio."
}

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Crecimiento registrado correctamente.",
    "data": {
        "id": 1,
        "estanqueId": 1,
        "pesoAnterior": 180,
        "pesoActual": 195.5,
        "incremento": 15.5,
        "fechaRegistro": "2026-06-29T08:30:00.000Z",
        "observacion": "Los peces muestran buena actividad y desarrollo alimenticio."
    }
}

Respuesta de error (Estanque no encontrado):
404 Not Found
{
    "success": false,
    "message": "El estanque no existe.",
    "error": null
}

Respuesta de error (Peso invalido):
400 Bad Request
{
    "success": false,
    "message": "El peso actual debe ser un numero mayor que cero.",
    "error": null
}