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

<<<<<<< HEAD
# Densidad Poblacional

## GET /api/v1/densidades-poblacionales
Obtiene todos los registros de densidad poblacional.
=======
# Estanques

## GET /api/v1/estanques
Obtiene todos los estanques registrados.
>>>>>>> origin/develop

Respuesta:
200 OK
{
    "success": true,
<<<<<<< HEAD
    "message": "Registros obtenidos correctamente.",
=======
    "message": "Estanques obtenidos correctamente.",
>>>>>>> origin/develop
    "data": [ ... ]
}

---

<<<<<<< HEAD
## GET /api/v1/densidades-poblacionales/:id
Obtiene un registro por su ID.

Parametros URL:
- id: ID numerico del registro.
=======
## GET /api/v1/estanques/:id
Obtiene un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.
>>>>>>> origin/develop

Respuesta exitosa:
200 OK
{
    "success": true,
<<<<<<< HEAD
    "message": "Registro obtenido correctamente.",
=======
    "message": "Estanque obtenido correctamente.",
>>>>>>> origin/develop
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
<<<<<<< HEAD
    "message": "Registro no encontrado.",
=======
    "message": "Estanque no encontrado.",
>>>>>>> origin/develop
    "error": null
}

---

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/develop
}

Respuesta exitosa:
201 Created
{
    "success": true,
<<<<<<< HEAD
    "message": "Registro creado correctamente.",
=======
    "message": "Estanque creado correctamente.",
>>>>>>> origin/develop
    "data": { ... }
}

Respuesta de error:
400 Bad Request
{
    "success": false,
<<<<<<< HEAD
    "message": "Faltan campos requeridos.",
=======
    "message": "Faltan campos requeridos: codigo.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe un estanque con ese codigo en la finca.",
>>>>>>> origin/develop
    "error": null
}

---

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/develop
}

Respuesta exitosa:
200 OK
{
    "success": true,
<<<<<<< HEAD
    "message": "Registro actualizado correctamente.",
=======
    "message": "Estanque actualizado correctamente.",
>>>>>>> origin/develop
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
<<<<<<< HEAD
    "message": "Registro no encontrado.",
=======
    "message": "Estanque no encontrado.",
    "error": null
}

Respuesta de error:
409 Conflict
{
    "success": false,
    "message": "Ya existe otro estanque con ese codigo en la finca.",
>>>>>>> origin/develop
    "error": null
}

---

<<<<<<< HEAD
## DELETE /api/v1/densidades-poblacionales/:id
Elimina un registro por su ID.
=======
## DELETE /api/v1/estanques/:id
Elimina un estanque por su ID.

Parametros URL:
- id: ID numerico del estanque.
>>>>>>> origin/develop

Respuesta exitosa:
200 OK
{
    "success": true,
<<<<<<< HEAD
    "message": "Registro eliminado correctamente.",
=======
    "message": "Estanque eliminado correctamente.",
>>>>>>> origin/develop
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
<<<<<<< HEAD
    "message": "Registro no encontrado.",
=======
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
>>>>>>> origin/develop
    "error": null
}# Documentacion de APIs

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

# Densidad Poblacional

## GET /api/v1/densidades-poblacionales
Obtiene todos los registros de densidad poblacional.

Respuesta:
200 OK
{
    "success": true,
    "message": "Registros obtenidos correctamente.",
    "data": [ ... ]
}

---

## GET /api/v1/densidades-poblacionales/:id
Obtiene un registro por su ID.

Parametros URL:
- id: ID numerico del registro.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro obtenido correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
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

Respuesta exitosa:
201 Created
{
    "success": true,
    "message": "Registro creado correctamente.",
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

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro actualizado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

---

## DELETE /api/v1/densidades-poblacionales/:id
Elimina un registro por su ID.

Respuesta exitosa:
200 OK
{
    "success": true,
    "message": "Registro eliminado correctamente.",
    "data": { ... }
}

Respuesta de error:
404 Not Found
{
    "success": false,
    "message": "Registro no encontrado.",
    "error": null
}

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