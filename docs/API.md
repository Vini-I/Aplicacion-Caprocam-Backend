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


# Crecimiento
## GET /api/v0/crecimiento/fincas
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

---

# Parasitologias

## GET /api/v0/parasitologias
Obtiene todos los registros de parasitologias.

Parametros Query opcionales:
- finca: Filtra los registros por finca.
- estanque: Filtra los registros por estanque.
- parasito: Filtra los registros por tipo de parasito.
- fechaReporte: Filtra los registros por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Parasitologias obtenidas correctamente.",
    "data": [ ... ]
}

---

## GET /api/v0/parasitologias/:id
Obtiene un registro de parasitologia por su ID.

Parametros URL:
- id: ID numerico del registro de parasitologia.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Parasitologia obtenida correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "No se pudo obtener la parasitologia.",
    "error": "El id de la parasitologia no es valido"
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "No se pudo obtener la parasitologia.",
    "error": "Registro de parasitologia no encontrado"
}

---

## GET /api/v0/parasitologias/resumen
Obtiene un resumen general de los registros de parasitologias.

Parametros Query opcionales:
- finca: Filtra el resumen por finca.
- estanque: Filtra el resumen por estanque.
- parasito: Filtra el resumen por tipo de parasito.
- fechaReporte: Filtra el resumen por fecha de reporte.

Respuesta:
200 OK
{
    "success": true,
    "message": "Resumen de parasitologias obtenido correctamente.",
    "data": {
        "totalRegistros": 2,
        "totalCamaronesMuestreados": 110,
        "totalCamaronesInfectados": 37,
        "promedioInfeccion": 32.84,
        "gradosFrecuentes": [ ... ],
        "parasitosFrecuentes": [ ... ]
    }
}

---

## GET /api/v0/parasitologias/catalogos/parasitos
Obtiene el catalogo de parasitos disponibles para registrar parasitologias.

Respuesta:
200 OK
{
    "success": true,
    "message": "Catalogo de parasitos obtenido correctamente.",
    "data": [
        {
            "label": "Gregarina",
            "value": "gregarina"
        },
        {
            "label": "Nematodo",
            "value": "nematodo"
        },
        {
            "label": "Epicomensal",
            "value": "epicomensal"
        },
        {
            "label": "Protozoario",
            "value": "protozoario"
        },
        {
            "label": "Otro",
            "value": "otro"
        }
    ]
}

---

## POST /api/v0/parasitologias
Crea un nuevo registro de parasitologia.

Body (JSON):
{
    "finca": "1",
    "fincaNombre": "Finca La Reina",
    "estanque": "EST-001",
    "fechaReporte": "30/06/2026",
    "responsable": "Andres Gutierrez",
    "parasito": "gregarina",
    "camaronesMuestreados": 50,
    "camaronesInfectados": 12,
    "observaciones": "Registro de control parasitologico."
}

Campos requeridos:
- finca
- estanque
- fechaReporte
- parasito
- camaronesMuestreados
- camaronesInfectados

Campos opcionales:
- fincaNombre
- responsable
- observaciones

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Parasitologia creada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos: parasito.",
    "error": null
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Datos invalidos para crear la parasitologia.",
    "error": [ ... ]
}

---

## PUT /api/v0/parasitologias/:id
Actualiza un registro de parasitologia existente.

Parametros URL:
- id: ID numerico del registro de parasitologia.

Body (JSON):
{
    "finca": "1",
    "fincaNombre": "Finca La Reina",
    "estanque": "EST-001",
    "fechaReporte": "30/06/2026",
    "responsable": "Andres Gutierrez",
    "parasito": "nematodo",
    "camaronesMuestreados": 60,
    "camaronesInfectados": 18,
    "observaciones": "Registro actualizado despues del monitoreo."
}

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Parasitologia actualizada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "No se pudo actualizar la parasitologia.",
    "error": "El id de la parasitologia no es valido"
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Datos invalidos para actualizar la parasitologia.",
    "error": [ ... ]
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "No se pudo actualizar la parasitologia.",
    "error": "Registro de parasitologia no encontrado"
}

---

## DELETE /api/v0/parasitologias/:id
Elimina un registro de parasitologia por su ID.

Parametros URL:
- id: ID numerico del registro de parasitologia.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Parasitologia eliminada correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "No se pudo eliminar la parasitologia.",
    "error": "El id de la parasitologia no es valido"
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "No se pudo eliminar la parasitologia.",
    "error": "Registro de parasitologia no encontrado"
}