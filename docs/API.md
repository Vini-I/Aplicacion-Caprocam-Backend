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


# Crecimiento
## GET /api/v1/crecimiento/fincas
Obtiene la lista de todas las fincas activas.

Respuesta exitosa:
200 OK
{
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

## GET /api/v1/crecimiento/fincas/:fincaId/estanques
Obtiene todos los estanques asociados a una finca específica.

Parametros URL:
- fincaId: ID numérico de la finca.

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

## GET /api/v1/crecimiento/estanque/:id
Obtiene la información detallada de un estanque específico junto con el peso de la última lectura (peso anterior).

Parametros URL:
- id: ID numérico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Información del estanque obtenida correctamente.",
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
500 Internal Server Error
{
    "success": false,
    "message": "Error al obtener la información del estanque.",
    "error": "El estanque no existe."
}

---

## POST /api/v1/crecimiento/
Registra un nuevo control de crecimiento para un estanque y actualiza de manera automática su peso actual.

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

Respuesta de error (Validación):
400 Bad Request
{
    "success": false,
    "message": "El peso actual debe ser mayor que cero.",
    "error": null
}