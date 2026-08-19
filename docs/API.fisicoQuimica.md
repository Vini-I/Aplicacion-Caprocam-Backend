# Físico Química

## Descripción general

El módulo de Físico Química administra las mediciones realizadas en los
estanques.

La información se almacena en dos tablas:

- `fisico_quimico`: contiene la información general de la lectura.
- `fisico_quimico_detalle`: contiene cada medición registrada.

La relación entre ambas tablas se realiza mediante:

```text
fisico_quimico.id
        |
        v
fisico_quimico_detalle.lectura_id
```

La ruta base del módulo es:

```http
/api/v0/lecturasFisicoQuimicas
```

Todos los endpoints requieren autenticación mediante un token JWT.

---

## Contexto de autenticación

El backend utiliza:

```js
obtenerContextoPeticion(req)
```

para obtener de forma segura:

```js
{
  grupoDatos,
  creadoPorUsuarioId,
  creadoPorColaboradorId
}
```

### Usuario web

Cuando el registro lo realiza un usuario web:

```json
{
  "creadoPorUsuarioId": 15,
  "creadoPorColaboradorId": null
}
```

### Colaborador del APK

Cuando el registro lo realiza un colaborador:

```json
{
  "creadoPorUsuarioId": null,
  "creadoPorColaboradorId": 8
}
```

Los identificadores del creador no se reciben desde el body. El backend los
obtiene del token JWT.

El campo `grupoDatos` tampoco debe enviarse normalmente en el body. El backend
lo obtiene mediante `obtenerContextoPeticion(req)`.

Un usuario con acceso global puede indicar un `grupoDatos` en el body cuando
la lógica general de autenticación lo permita.

---

## Formato de una medición

Cada medición utiliza la siguiente estructura:

```json
{
  "valor": 7.8,
  "etiqueta": "dia"
}
```

Propiedades:

- `valor`: número correspondiente a la medición.
- `etiqueta`: texto que identifica el momento o número de la medición.

Ejemplos de etiquetas utilizadas por el sistema:

```text
1
2
3
4
5
dia
noche
```

El backend exige que `etiqueta` tenga contenido, pero no limita actualmente
sus valores a una lista cerrada.

---

## Reglas de validación

Los siguientes campos generales son obligatorios:

```text
fincaId
estanqueId
fecha
```

Los campos de medición son:

```text
ph
salinidad
temperatura
oxigenoDisuelto
```

Se debe cumplir lo siguiente:

- Debe enviarse al menos una medición.
- Cada campo de medición debe ser un arreglo.
- Los arreglos pueden estar vacíos.
- Los campos de medición que no se envíen se convierten internamente en `[]`.
- Cada elemento debe contener `valor` y `etiqueta`.
- `fincaId` y `estanqueId` deben ser identificadores válidos.
- `fecha` debe utilizar el formato `YYYY-MM-DD`.
- `fecha` no puede ser posterior a la fecha actual.

Este body es válido:

```json
{
  "fincaId": 1,
  "estanqueId": 2,
  "fecha": "2026-07-31",
  "ph": [
    {
      "valor": 7.5,
      "etiqueta": "1"
    }
  ]
}
```

Antes de llegar al controller, el middleware lo normaliza como:

```json
{
  "fincaId": 1,
  "estanqueId": 2,
  "fecha": "2026-07-31",
  "ph": [
    {
      "valor": 7.5,
      "etiqueta": "1"
    }
  ],
  "salinidad": [],
  "temperatura": [],
  "oxigenoDisuelto": []
}
```

Este body no es válido porque no contiene ninguna medición:

```json
{
  "fincaId": 1,
  "estanqueId": 2,
  "fecha": "2026-07-31",
  "ph": [],
  "salinidad": [],
  "temperatura": [],
  "oxigenoDisuelto": []
}
```

---

# Endpoints

## GET /api/v0/lecturasFisicoQuimicas

Obtiene todas las lecturas activas pertenecientes al `grupoDatos` de la
petición autenticada.

### Respuesta exitosa

```http
200 OK
```

```json
{
  "success": true,
  "message": "Lecturas obtenidas correctamente.",
  "data": [
    {
      "id": 13,
      "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
      "grupoDatos": 1,
      "fincaId": 1,
      "estanqueId": 2,
      "fecha": "2026-07-31",
      "creadoPorUsuarioId": 15,
      "creadoPorColaboradorId": null,
      "ph": [
        {
          "valor": 7.5,
          "etiqueta": "1"
        }
      ],
      "salinidad": [],
      "temperatura": [],
      "oxigenoDisuelto": [],
      "activo": true,
      "creadoEn": "2026-07-31T14:20:00.000Z",
      "actualizadoEn": "2026-07-31T14:20:00.000Z",
      "deletedAt": null,
      "version": 1
    }
  ]
}
```

### Respuesta de error

```http
500 Internal Server Error
```

```json
{
  "success": false,
  "message": "Error al obtener las lecturas.",
  "error": "Mensaje detallado del error"
}
```

---

## GET /api/v0/lecturasFisicoQuimicas/estanque/:estanqueId?fecha=YYYY-MM-DD

Busca una lectura mediante:

- El identificador del estanque.
- La fecha.
- El grupo de datos autenticado.

### Parámetro URL

```text
estanqueId
```

### Query string

```text
fecha=YYYY-MM-DD
```

### Ejemplo

```http
GET /api/v0/lecturasFisicoQuimicas/estanque/2?fecha=2026-07-31
```

### Respuesta cuando existe

```http
200 OK
```

```json
{
  "success": true,
  "message": "Consulta realizada correctamente.",
  "data": {
    "id": 13,
    "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
    "grupoDatos": 1,
    "fincaId": 1,
    "estanqueId": 2,
    "fecha": "2026-07-31",
    "creadoPorUsuarioId": null,
    "creadoPorColaboradorId": 8,
    "ph": [
      {
        "valor": 7.5,
        "etiqueta": "1"
      }
    ],
    "salinidad": [
      {
        "valor": 16.4,
        "etiqueta": "2"
      }
    ],
    "temperatura": [],
    "oxigenoDisuelto": [],
    "activo": true,
    "creadoEn": "2026-07-31T14:20:00.000Z",
    "actualizadoEn": "2026-07-31T14:50:00.000Z",
    "deletedAt": null,
    "version": 1
  }
}
```

### Respuesta cuando no existe

```http
200 OK
```

```json
{
  "success": true,
  "message": "Consulta realizada correctamente.",
  "data": null
}
```

### Fecha inválida

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Debe indicar una fecha valida (YYYY-MM-DD) en el query string.",
  "error": null
}
```

---

## GET /api/v0/lecturasFisicoQuimicas/:id

Obtiene una lectura activa mediante su ID y el grupo de datos autenticado.

### Ejemplo

```http
GET /api/v0/lecturasFisicoQuimicas/13
```

### Respuesta exitosa

```http
200 OK
```

```json
{
  "success": true,
  "message": "Lectura obtenida correctamente.",
  "data": {
    "id": 13,
    "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
    "grupoDatos": 1,
    "fincaId": 1,
    "estanqueId": 2,
    "fecha": "2026-07-31",
    "creadoPorUsuarioId": 15,
    "creadoPorColaboradorId": null,
    "ph": [
      {
        "valor": 7.5,
        "etiqueta": "1"
      }
    ],
    "salinidad": [],
    "temperatura": [],
    "oxigenoDisuelto": [],
    "activo": true,
    "creadoEn": "2026-07-31T14:20:00.000Z",
    "actualizadoEn": "2026-07-31T14:20:00.000Z",
    "deletedAt": null,
    "version": 1
  }
}
```

### Lectura no encontrada

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Lectura no encontrada.",
  "error": null
}
```

---

## POST /api/v0/lecturasFisicoQuimicas

Registra mediciones físico-químicas.

### Comportamiento progresivo

La tabla principal permite una sola lectura por:

```text
grupoDatos + estanqueId + fecha
```

Cuando todavía no existe una lectura para el estanque y fecha:

1. Se crea el registro en `fisico_quimico`.
2. Se registra el creador.
3. Se insertan las mediciones en `fisico_quimico_detalle`.

Cuando la lectura ya existe:

1. Se reutiliza el mismo registro principal.
2. Se agregan las nuevas mediciones en la tabla detalle.
3. No se eliminan las mediciones anteriores.
4. Se conserva el creador original si la lectura continúa activa.

Si la lectura había sido desactivada:

1. Se reactiva la lectura principal.
2. Se actualiza el creador con la identidad autenticada actual.
3. Se agregan las nuevas mediciones.

### Primer registro del día

```json
{
  "fincaId": 1,
  "estanqueId": 2,
  "fecha": "2026-07-31",
  "ph": [
    {
      "valor": 7.5,
      "etiqueta": "1"
    }
  ]
}
```

### Registro posterior de salinidad

Treinta minutos después puede enviarse:

```json
{
  "fincaId": 1,
  "estanqueId": 2,
  "fecha": "2026-07-31",
  "salinidad": [
    {
      "valor": 16.4,
      "etiqueta": "2"
    }
  ]
}
```

El segundo `POST` utiliza la misma lectura principal y agrega la salinidad sin
eliminar el pH registrado anteriormente.

> Cada `POST` agrega nuevos detalles. No se debe reenviar una medición que ya
> fue almacenada, porque se registraría nuevamente como otro detalle.

### Respuesta exitosa

```http
201 Created
```

```json
{
  "success": true,
  "message": "Lectura registrada correctamente.",
  "data": {
    "id": 13,
    "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
    "grupoDatos": 1,
    "fincaId": 1,
    "estanqueId": 2,
    "fecha": "2026-07-31",
    "creadoPorUsuarioId": null,
    "creadoPorColaboradorId": 8,
    "ph": [
      {
        "valor": 7.5,
        "etiqueta": "1"
      }
    ],
    "salinidad": [
      {
        "valor": 16.4,
        "etiqueta": "2"
      }
    ],
    "temperatura": [],
    "oxigenoDisuelto": [],
    "activo": true,
    "creadoEn": "2026-07-31T14:20:00.000Z",
    "actualizadoEn": "2026-07-31T14:20:00.000Z",
    "deletedAt": null,
    "version": 1
  }
}
```

### Sin mediciones

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Debe incluir al menos una medicion.",
  "error": null
}
```

### Campos generales faltantes

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Faltan campos requeridos: fecha.",
  "error": null
}
```

---

## PUT /api/v0/lecturasFisicoQuimicas/:id

Actualiza una lectura existente.

### Comportamiento del PUT

El `PUT` reemplaza el estado completo de las mediciones:

1. Actualiza finca, estanque y fecha.
2. Elimina los detalles anteriores.
3. Inserta únicamente las mediciones recibidas en el nuevo body.

Por esa razón, el frontend debe enviar todas las mediciones que desea
conservar.

Los campos de medición que no se envíen se convierten en arreglos vacíos y sus
mediciones anteriores no permanecerán después del `PUT`.

El creador original no se modifica durante una actualización.

### Ejemplo

```http
PUT /api/v0/lecturasFisicoQuimicas/13
```

```json
{
  "fincaId": 1,
  "estanqueId": 2,
  "fecha": "2026-07-31",
  "ph": [
    {
      "valor": 7.5,
      "etiqueta": "1"
    }
  ],
  "salinidad": [
    {
      "valor": 16.4,
      "etiqueta": "2"
    }
  ],
  "temperatura": [
    {
      "valor": 28.6,
      "etiqueta": "3"
    }
  ],
  "oxigenoDisuelto": []
}
```

### Respuesta exitosa

```http
200 OK
```

```json
{
  "success": true,
  "message": "Lectura actualizada correctamente.",
  "data": {
    "id": 13,
    "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
    "grupoDatos": 1,
    "fincaId": 1,
    "estanqueId": 2,
    "fecha": "2026-07-31",
    "creadoPorUsuarioId": null,
    "creadoPorColaboradorId": 8,
    "ph": [
      {
        "valor": 7.5,
        "etiqueta": "1"
      }
    ],
    "salinidad": [
      {
        "valor": 16.4,
        "etiqueta": "2"
      }
    ],
    "temperatura": [
      {
        "valor": 28.6,
        "etiqueta": "3"
      }
    ],
    "oxigenoDisuelto": [],
    "activo": true,
    "creadoEn": "2026-07-31T14:20:00.000Z",
    "actualizadoEn": "2026-07-31T15:30:00.000Z",
    "deletedAt": null,
    "version": 2
  }
}
```

### Lectura no encontrada

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Lectura no encontrada.",
  "error": null
}
```

---

## PUT /api/v0/lecturasFisicoQuimicas/:id/activo

Realiza el borrado lógico de la lectura principal y sus mediciones.

No requiere body.

### Ejemplo

```http
PUT /api/v0/lecturasFisicoQuimicas/13/activo
```

### Respuesta exitosa

```http
200 OK
```

```json
{
  "success": true,
  "message": "Estado actualizado correctamente.",
  "data": {
    "id": 13,
    "uuid": "638cc9ba-8345-11f1-a686-06337dcb40ba",
    "grupoDatos": 1,
    "fincaId": 1,
    "estanqueId": 2,
    "fecha": "2026-07-31",
    "creadoPorUsuarioId": null,
    "creadoPorColaboradorId": 8,
    "ph": [
      {
        "valor": 7.5,
        "etiqueta": "1"
      }
    ],
    "salinidad": [
      {
        "valor": 16.4,
        "etiqueta": "2"
      }
    ],
    "temperatura": [],
    "oxigenoDisuelto": [],
    "activo": true,
    "creadoEn": "2026-07-31T14:20:00.000Z",
    "actualizadoEn": "2026-07-31T14:20:00.000Z",
    "deletedAt": null,
    "version": 1
  }
}
```

El objeto retornado corresponde al estado de la lectura antes de realizar el
borrado lógico.

### Lectura no encontrada

```http
404 Not Found
```

```json
{
  "success": false,
  "message": "Lectura no encontrada.",
  "error": null
}
```

---

## Resumen de comportamiento

| Operación | Comportamiento de las mediciones |

| `POST` nuevo | Crea la lectura y agrega las mediciones |
| `POST` mismo estanque y fecha | Agrega mediciones sin borrar las anteriores |
| `PUT /:id` | Reemplaza todas las mediciones |
| `PUT /:id/activo` | Desactiva la lectura y sus detalles |

---

## Pruebas recomendadas en Postman

### Prueba 1: registro realizado por usuario web

Iniciar sesión como usuario web y crear una lectura.

Verificar:

```text
creadoPorUsuarioId = ID del usuario
creadoPorColaboradorId = null
```

### Prueba 2: registro realizado por colaborador

Iniciar sesión mediante PIN y crear una lectura.

Verificar:

```text
creadoPorUsuarioId = null
creadoPorColaboradorId = ID del colaborador
```

### Prueba 3: medición parcial

Registrar solamente pH y comprobar que los otros arreglos regresen vacíos.

### Prueba 4: medición progresiva

Registrar pH y después registrar salinidad para el mismo estanque y fecha.

Verificar:

- Se mantiene el mismo ID de la lectura.
- Se conserva el pH.
- Se agrega la salinidad.

### Prueba 5: consulta por estanque y fecha

```http
GET /api/v0/lecturasFisicoQuimicas/estanque/2?fecha=2026-07-31
```

### Prueba 6: actualización completa

Enviar un `PUT` con todas las mediciones que deben conservarse.

### Prueba 7: borrado lógico

Desactivar la lectura y comprobar que ya no aparezca en los endpoints de
consulta.

### Prueba 8: separación por grupo de datos

Probar con dos usuarios o colaboradores pertenecientes a grupos diferentes y
comprobar que no puedan consultar ni modificar registros ajenos.