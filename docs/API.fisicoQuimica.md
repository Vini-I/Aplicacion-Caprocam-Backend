# Fisico Quimica

## GET /api/v0/lecturasFisicoQuimicas

Obtiene todas las lecturas fisico quimicas activas, limitadas al grupo de datos
del usuario autenticado mediante JWT.

Respuesta:

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
      "estanqueId": 1,
      "fecha": "2026-07-19",
      "ph": [
        {
          "valor": 7.8,
          "etiqueta": "manana"
        }
      ],
      "salinidad": [
        {
          "valor": 18,
          "etiqueta": "manana"
        }
      ],
      "temperatura": [
        {
          "valor": 29,
          "etiqueta": "manana"
        }
      ],
      "oxigenoDisuelto": [
        {
          "valor": 6.2,
          "etiqueta": "manana"
        }
      ],
      "activo": true,
      "creadoEn": "2026-07-19T13:42:27.000Z",
      "actualizadoEn": "2026-07-19T13:42:27.000Z",
      "deletedAt": null,
      "version": 1
    }
  ]
}
```

Respuesta de error:

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

Busca la lectura fisico quimica de un estanque en una fecha especifica.

Sirve para que el frontend determine si ya existe un registro ese dia. Si
existe, debe mostrar el boton `Actualizar` y precargar los valores en el
formulario. Si no existe, debe mostrar el boton `Guardar`.

Parametros URL:

- `estanqueId`: ID numerico del estanque.

Query string:

- `fecha`: Fecha obligatoria con formato `YYYY-MM-DD`.

Respuesta exitosa cuando existe una lectura:

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
    "estanqueId": 1,
    "fecha": "2026-07-19",
    "ph": [
      {
        "valor": 8,
        "etiqueta": "manana"
      }
    ],
    "salinidad": [
      {
        "valor": 17.5,
        "etiqueta": "manana"
      }
    ],
    "temperatura": [
      {
        "valor": 28.5,
        "etiqueta": "manana"
      }
    ],
    "oxigenoDisuelto": [
      {
        "valor": 6.5,
        "etiqueta": "manana"
      }
    ],
    "activo": true,
    "creadoEn": "2026-07-19T13:42:27.000Z",
    "actualizadoEn": "2026-07-19T13:49:42.000Z",
    "deletedAt": null,
    "version": 2
  }
}
```

Respuesta exitosa cuando no existe una lectura:

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

Respuesta de error:

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

Obtiene una lectura fisico quimica por su ID.

Parametros URL:

- `id`: ID numerico de la lectura.

Respuesta exitosa:

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
    "estanqueId": 1,
    "fecha": "2026-07-19",
    "ph": [
      {
        "valor": 7.8,
        "etiqueta": "manana"
      }
    ],
    "salinidad": [
      {
        "valor": 18,
        "etiqueta": "manana"
      }
    ],
    "temperatura": [
      {
        "valor": 29,
        "etiqueta": "manana"
      }
    ],
    "oxigenoDisuelto": [
      {
        "valor": 6.2,
        "etiqueta": "manana"
      }
    ],
    "activo": true,
    "creadoEn": "2026-07-19T13:42:27.000Z",
    "actualizadoEn": "2026-07-19T13:42:27.000Z",
    "deletedAt": null,
    "version": 1
  }
}
```

Respuesta de error:

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

Registra una nueva lectura fisico quimica.

Body:

```json
{
  "fincaId": 1,
  "estanqueId": 1,
  "fecha": "2026-07-19",
  "ph": [
    {
      "valor": 7.8,
      "etiqueta": "manana"
    }
  ],
  "salinidad": [
    {
      "valor": 18,
      "etiqueta": "manana"
    }
  ],
  "temperatura": [
    {
      "valor": 29,
      "etiqueta": "manana"
    }
  ],
  "oxigenoDisuelto": [
    {
      "valor": 6.2,
      "etiqueta": "manana"
    }
  ]
}
```

Notas:

- Todos los campos son obligatorios.
- `fincaId` y `estanqueId` deben ser identificadores numericos validos.
- `fecha` debe tener el formato `YYYY-MM-DD` y no puede ser futura.
- `ph`, `salinidad`, `temperatura` y `oxigenoDisuelto` deben enviarse
  como arreglos de objetos.
- Cada medicion debe contener las propiedades `valor` y `etiqueta`.
- `grupoDatos` no debe enviarse en el body. El backend lo obtiene desde
  `req.user.grupoDatos`.

Respuesta exitosa:

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
    "estanqueId": 1,
    "fecha": "2026-07-19",
    "ph": [
      {
        "valor": 7.8,
        "etiqueta": "manana"
      }
    ],
    "salinidad": [
      {
        "valor": 18,
        "etiqueta": "manana"
      }
    ],
    "temperatura": [
      {
        "valor": 29,
        "etiqueta": "manana"
      }
    ],
    "oxigenoDisuelto": [
      {
        "valor": 6.2,
        "etiqueta": "manana"
      }
    ],
    "activo": true,
    "creadoEn": "2026-07-19T13:42:27.000Z",
    "actualizadoEn": "2026-07-19T13:42:27.000Z",
    "deletedAt": null,
    "version": 1
  }
}
```

Respuesta de error:

```http
400 Bad Request
```

```json
{
  "success": false,
  "message": "Faltan campos requeridos: oxigenoDisuelto.",
  "error": null
}
```

---

## PUT /api/v0/lecturasFisicoQuimicas/:id

Actualiza los valores de una lectura fisico quimica existente.

La lectura debe pertenecer al grupo de datos del usuario autenticado.

Parametros URL:

- `id`: ID numerico de la lectura.

Body:

```json
{
  "fincaId": 1,
  "estanqueId": 1,
  "fecha": "2026-07-19",
  "ph": [
    {
      "valor": 8,
      "etiqueta": "manana"
    }
  ],
  "salinidad": [
    {
      "valor": 17.5,
      "etiqueta": "manana"
    }
  ],
  "temperatura": [
    {
      "valor": 28.5,
      "etiqueta": "manana"
    }
  ],
  "oxigenoDisuelto": [
    {
      "valor": 6.5,
      "etiqueta": "manana"
    }
  ]
}
```

Notas:

- Los campos de mediciones deben mantenerse como arreglos de objetos.
- Cada medicion debe contener las propiedades `valor` y `etiqueta`.
- `grupoDatos` no debe enviarse en el body. El backend lo obtiene desde
  `req.user.grupoDatos`.

Respuesta exitosa:

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
    "estanqueId": 1,
    "fecha": "2026-07-19",
    "ph": [
      {
        "valor": 8,
        "etiqueta": "manana"
      }
    ],
    "salinidad": [
      {
        "valor": 17.5,
        "etiqueta": "manana"
      }
    ],
    "temperatura": [
      {
        "valor": 28.5,
        "etiqueta": "manana"
      }
    ],
    "oxigenoDisuelto": [
      {
        "valor": 6.5,
        "etiqueta": "manana"
      }
    ],
    "activo": true,
    "creadoEn": "2026-07-19T13:42:27.000Z",
    "actualizadoEn": "2026-07-19T13:49:42.000Z",
    "deletedAt": null,
    "version": 2
  }
}
```

Respuesta de error:

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
