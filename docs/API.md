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
    "nombre": "Carlos",
    "apellidos": "Jiménez",
    "telefono": "66665555",
    "email": "carlos@empresa.com",
    "rol": "colaborador"
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
    "nombre": "Carlos",
    "apellidos": "Jiménez Corrected",
    "telefono": "66665555",
    "email": "carlos@empresa.com",
    "rol": "supervisor"
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

# Densidad Poblacional

## GET /api/v1/densidades-poblacionales
Obtiene todos los registros de densidad poblacional.

# Estanques

## GET /api/v0/estanques
Obtiene todos los estanques registrados.

Respuesta:
200 OK
{
    "success": true,
    "message": "Registros obtenidos correctamente.",

    "message": "Estanques obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/densidades-poblacionales/:id
Obtiene un registro por su ID.

Parametros URL:
- id: ID numerico del registro.

## GET /api/v0/estanques/:id
Obtiene un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro obtenido correctamente.",

    "message": "Estanque obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",

    "message": "Estanque no encontrado.",
    "error": null
}

---

## POST /api/v1/densidades-poblacionales
Crea un nuevo registro de densidad poblacional.

Body (JSON):
{
    "finca": 1,
    "estanque": 2,
    "fecha": "2026-06-29",
    "cantidadSiembra": 20,
    "areaEstanque": 3000,
    "metodoConteo": "Directo",
    "numeroCamarones": 250,
    "tirosAtarraya": 6,
    "areaAtarraya": 4.5,
    "promedioPorTiro": 41.6,
    "sobrevivencia": 89,
    "notasConteo": "Conteo inicial"
}

## POST /api/v0/estanques
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
    "message": "Registro creado correctamente.",

    "message": "Estanque creado correctamente.",
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Faltan campos requeridos.",

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

## PUT /api/v1/densidades-poblacionales/:id
Actualiza un registro existente.

Parametros URL:
- id: ID numerico del registro.

Body (JSON):
{
    "finca": 2,
    "estanque": 1,
    "fecha": "2026-06-30",
    "cantidadSiembra": 22,
    "areaEstanque": 2800,
    "metodoConteo": "Directo",
    "numeroCamarones": 260,
    "tirosAtarraya": 5,
    "areaAtarraya": 3.5,
    "promedioPorTiro": 52,
    "sobrevivencia": 91,
    "notasConteo": "Actualizacion"
}

## PUT /api/v0/estanques/:id
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
    "message": "Registro actualizado correctamente.",

    "message": "Estanque actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",

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

## DELETE /api/v1/densidades-poblacionales/:id
Elimina un registro por su ID.

## DELETE /api/v0/estanques/:id
Elimina un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro eliminado correctamente.",

    "message": "Estanque eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",

    "message": "Estanque no encontrado.",
    "error": null
}


# Crecimiento
## GET /api/v1/crecimiento
Obtiene todos los registros de crecimiento disponibles en la mockdata.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registros de crecimiento obtenidos correctamente.",
    "data": [
        {
            "id": "1",
            "finca": "Finca La Perla",
            "estanque": "EST-01",
            "pesoActual": 2.5
        },
        {
            "id": "2",
            "finca": "Finca La Perla",
            "estanque": "EST-02",
            "pesoActual": 3.1
        }
    ]
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

---

## GET /api/v1/crecimiento/:id
Obtiene un registro de crecimiento por su ID.

Parametros URL:
- id: Identificador del registro.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": {
        "id": "1",
        "finca": "Finca La Perla",
        "estanque": "EST-01",
        "pesoActual": 2.5
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

---

## POST /api/v1/crecimiento
Crea un nuevo registro de crecimiento.

Body (JSON):
{
    "id": "3",
    "finca": "Finca La Perla",
    "estanque": "EST-03",
    "pesoActual": 4.2
}

Campos requeridos:
- finca
- estanque
- pesoActual

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro de crecimiento creado correctamente.",
    "data": {
        "id": "3",
        "finca": "Finca La Perla",
        "estanque": "EST-03",
        "pesoActual": 4.2
    }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Finca y estanque son requeridos.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "El peso actual es requerido y debe ser un numero mayor o igual a cero.",
    "error": null
}

---

## PUT /api/v1/crecimiento/:id
Actualiza un registro de crecimiento existente.

Parametros URL:
- id: Identificador del registro a actualizar.

Body (JSON):
{
    "id": "1",
    "finca": "Finca La Perla",
    "estanque": "EST-01",
    "pesoActual": 5.1
}

Campos requeridos:
- finca
- estanque
- pesoActual

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro de crecimiento actualizado correctamente.",
    "data": {
        "id": "1",
        "finca": "Finca La Perla",
        "estanque": "EST-01",
        "pesoActual": 5.1
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado",
    "error": null
}

Respuesta de error:
400 Bad Request
{
    "success": false,
    "message": "Finca y estanque son requeridos.",
    "error": null
}# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto.
En el futuro se migrara a Swagger.

---

# Raleo

## GET /api/v1/raleo/
Obtiene todos los raleos
{
    "success": true,
    "message": "Raleos obtenidos correctamente.",

## GET /api/v1/raleo/1
Obtiene el raleo con id 1
{
    "success": true,
    "message": "Raleo obtenido correctamente.",
    "data": [ ... ]
}

---

---

## POST /api/v1/raleo/
crea un objeto raleo
ejemplo con JSON:
{
  "idFinca": 3,
  "idEstanque": 2,
  "idResponsable": 1,
  "fecha": "05/07/2026",
  "porcentaje": 30,
  "pesoEstimado": 0.35,
  "biomasaEstimado": 18,
  "objetivo": "Traslado a otro estanque",
  "metodo": "Atarraya",
  "notas": "Raleo realizado sin inconvenientes."
}
Respuesta:
{
    "success": true,
    "message": "Raleo creado correctamente.",
    "data": [ ... ]
}

## DELETE /api/v1/raleo/3
Elimina el raleo con id 3
{
    "success": true,
    "message": "Raleo eliminado correctamente.",
    "data": [ ... ]

# Alimentación

## GET /api/v1/alimentaciones

Obtiene todos los registros de alimentación.

Respuesta:
200 OK

json
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [ ... ]
}


---

## GET /api/v1/alimentaciones/:id

Obtiene un registro de alimentación por su ID.

*Parámetros URL:*

* id: ID numérico del registro.

*Respuesta exitosa:*
200 OK

json
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": { ... }
}


*Respuesta de error:*
404 Not Found

json
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}


---

## POST /api/v1/alimentaciones

Crea un nuevo registro de alimentación.

*Body (JSON):*

json
{
    "finca": 1,
    "estanque": 2,
    "fecha": "2026-06-29",
    "hora": "7:00 AM",
    "metodo": "Boleo",
    "cantidadKg": 10,
    "presentacion": "Granulado",
    "proveedor": "Biomar",
    "tipoAlimento": "Balanceado engorde 38%",
    "observaciones": "Sin novedad."
}


*Respuesta exitosa:*
201 Created

json
{
    "success": true,
    "message": "Registro creado correctamente.",
    "data": { ... }
}


*Respuesta de error:*
400 Bad Request

json
{
    "success": false,
    "message": "Faltan campos requeridos.",
    "error": null
}


---

## PUT /api/v1/alimentaciones/:id

Actualiza un registro existente de alimentación.

*Parámetros URL:*

* id: ID numérico del registro.

*Body (JSON):*

json
{
    "finca": 1,
    "estanque": 2,
    "fecha": "2026-06-30",
    "hora": "3:00 PM",
    "metodo": "Plato",
    "cantidadKg": 12,
    "presentacion": "Polvo",
    "proveedor": "Biomar",
    "tipoAlimento": "Balanceado premium 40%",
    "observaciones": "Actualizacion de registro."
}


*Respuesta exitosa:*
200 OK

json
{
    "success": true,
    "message": "Registro actualizado correctamente.",
    "data": { ... }
}


*Respuesta de error:*
404 Not Found

json
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}


---

## DELETE /api/v1/alimentaciones/:id

Elimina un registro de alimentación por su ID.

*Respuesta exitosa:*
200 OK

json
{
    "success": true,
    "message": "Registro eliminado correctamente.",
    "data": { ... }
}


*Respuesta de error:*
404 Not Found

json
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

Respuesta de error:
422 Unprocessable Entity
{
    "success": false,
    "message": "El peso actual es requerido y debe ser un numero mayor o igual a cero.",
    "error": null
}

---

## DELETE /api/v1/crecimiento/:id
Elimina un registro de crecimiento por su ID.

Parametros URL:
- id: Identificador del registro a eliminar.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro eliminado correctamente",
    "data": {
        "id": "1",
        "finca": "Finca La Perla",
        "estanque": "EST-01",
        "pesoActual": 2.5
    }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado",
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

---

# Tareas

## GET /api/v1/tareas
Obtiene todas las tareas.

Respuesta:
200 OK
{ "success": true, "message": "Tareas obtenidas correctamente.", "data": [...] }

---

## GET /api/v1/tareas/catalogo
Retorna lista reducida de tareas para poblar selects en el frontend.

Respuesta:
200 OK
{ "success": true, "message": "Catalogo de tareas obtenido correctamente.",
  "data": [{ "id": 1, "nombre": "Limpieza de filtros" }] }

---

## GET /api/v1/tareas/:id
Obtiene una tarea por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v1/tareas
Crea una nueva tarea.

Body (JSON):
{
    "nombre":           "Revision de aireadores",
    "descripcion":      "Inspeccion y limpieza de aireadores.",
    "categoria":        "preventivo",
    "duracionEstimada": 3
}

Respuesta exitosa:   201 Created
Respuesta de error:  400 / 422

Categorias validas: preventivo, correctivo, instalacion, inspeccion

---

## PUT /api/v1/tareas/:id
Actualiza una tarea existente. Mismo body que POST.

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 422 / 404

---

## DELETE /api/v1/tareas/:id
Elimina una tarea por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

# Mantenimientos

## GET /api/v1/mantenimientos
Obtiene todos los mantenimientos.

Respuesta:
200 OK
{ "success": true, "message": "Mantenimientos obtenidos correctamente.", "data": [...] }

---

## GET /api/v1/mantenimientos/:id
Obtiene un mantenimiento por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found

---

## POST /api/v1/mantenimientos
Crea un nuevo ticket de mantenimiento.

Body (JSON):
{
    "fechaHora":   "2026-07-04T10:30:00",
    "creadoPor":   "Marco Vásquez",
    "titulo":      "Falla en bomba estanque 3",
    "equipo":      "Bomba estanque 3",
    "tarea":       1,
    "descripcion": "La bomba presenta vibracion inusual."
}

Respuesta exitosa:   201 Created
Respuesta de error:  400 / 422

Nota: creadoPor sera reemplazado por sesion JWT cuando se implemente auth.
Estados validos: abierto, en_progreso, cerrado

---

## PUT /api/v1/mantenimientos/:id
Actualiza un mantenimiento existente.
Mismo body que POST. Adicionalmente acepta el campo "estado".

Respuesta exitosa:   200 OK
Respuesta de error:  400 / 422 / 404

---

## DELETE /api/v1/mantenimientos/:id
Elimina un mantenimiento por su ID.

Respuesta exitosa:   200 OK
Respuesta de error:  404 Not Found