# Documentacion de APIs

En esta carpeta se documentan todas las rutas disponibles del proyecto. En el
futuro se migrara a Swagger.

## Proveedores

### GET /api/v1/proveedores
Obtiene todos los proveedores activos.

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedores obtenidos correctamente.",
      "data": [
        {
          "id": 1,
          "nombre": "Alimentos del Pacifico",
          "tipoProducto": "alimento",
          "telefono": "+506 2233-4455",
          "correo": "alimentos@pacifico.com",
          "direccion": "Puntarenas, Costa Rica",
          "notas": "Proveedor principal de camarina"
        }
      ]
    }
    ```

---

### GET /api/v1/proveedores/:id
Obtiene un proveedor activo por su ID.

**Parametros URL:**
*   `id`: ID numerico del proveedor.

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor obtenido correctamente.",
      "data": {
        "id": 1,
        "nombre": "Alimentos del Pacifico",
        "tipoProducto": "alimento",
        "telefono": "+506 2233-4455",
        "correo": "alimentos@pacifico.com",
        "direccion": "Puntarenas, Costa Rica",
        "notas": "Proveedor principal de camarina"
      }
    }
    ```

**Respuesta de error (No encontrado):**
*   **Codigo:** 404 Not Found
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Proveedor no encontrado.",
      "error": null
    }
    ```

---

### POST /api/v1/proveedores
Crea un nuevo proveedor.

**Body (JSON):**
```json
{
  "nombre": "Alimentos del Pacifico",
  "tipoProducto": "alimento",
  "telefono": "+506 2233-4455",
  "correo": "alimentos@pacifico.com",
  "direccion": "Puntarenas, Costa Rica",
  "notas": "Proveedor principal de camarina"
}
```

**Respuesta exitosa:**
*   **Codigo:** 201 Created
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor creado correctamente.",
      "data": {
        "id": 4,
        "nombre": "Alimentos del Pacifico",
        "tipoProducto": "alimento",
        "telefono": "+506 2233-4455",
        "correo": "alimentos@pacifico.com",
        "direccion": "Puntarenas, Costa Rica",
        "notas": "Proveedor principal de camarina"
      }
    }
    ```

**Respuesta de error (Datos invalidos o duplicado):**
*   **Codigo:** 400 Bad Request
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Faltan campos requeridos: nombre.",
      "error": null
    }
    ```

---

### PUT /api/v1/proveedores/:id
Actualiza un proveedor activo existente.

**Parametros URL:**
*   `id`: ID numerico del proveedor.

**Body (JSON):**
```json
{
  "nombre": "Alimentos del Pacifico Modificado",
  "tipoProducto": "alimento",
  "telefono": "+506 2233-4455"
}
```

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor actualizado correctamente.",
      "data": {
        "id": 1,
        "nombre": "Alimentos del Pacifico Modificado",
        "tipoProducto": "alimento",
        "telefono": "+506 2233-4455"
      }
    }
    ```

**Respuesta de error:**
*   **Codigo:** 400 Bad Request / 404 Not Found
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Proveedor no encontrado.",
      "error": null
    }
    ```

---

### DELETE /api/v1/proveedores/:id
Desactiva un proveedor por su ID (borrado logico).

**Parametros URL:**
*   `id`: ID numerico del proveedor.

**Respuesta exitosa:**
*   **Codigo:** 200 OK
*   **Body (JSON):**
    ```json
    {
      "success": true,
      "message": "Proveedor eliminado correctamente.",
      "data": {
        "id": 1,
        "nombre": "Alimentos del Pacifico",
        "activo": false
      }
    }
    ```

**Respuesta de error:**
*   **Codigo:** 404 Not Found
*   **Body (JSON):**
    ```json
    {
      "success": false,
      "message": "Proveedor no encontrado.",
      "error": null
    }
    ```
