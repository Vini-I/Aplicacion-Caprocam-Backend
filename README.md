# Estandar de longitud de lineas:
Para realizar comentarios, funciones y codigo de forma mas legible y/o facil de trabajar
al dividir 2 pestañas en la pantalla, se solicita que ninguna linea pase de la columna 90
(Idealmente, se entiende que a veces se puede pasar uno o dos caracteres MAXIMO).

## Como se puede medir esto?
Visual Studio Code tiene entre los parametros que se encuentran en la parte de abajo uno
que muestra la linea (Ln) y la columna (Col) en la que actualmente se esta escribiendo:

Si no pueden ver la imagen, busquen en su propio IDE la ubicacion de esta informacion.
Todo este codigo y el codigo de ejemplo siguen esta clausula para facilitar su legibilidad.

# Estandard de respuestas JSON:
Se crea para devolver respuestas json estandar en todos los archivos a la hora de
trabjar.
## Ejemplo positivo:
{
    success: true,
    message: "Usuario obtenido correctamente",
    data: usuario
}

## Ejemplo de error:
{
    success: false,
    message: "Usuario no encontrado",
    error: error.message
}

# Nombres de rutas:
Las rutas inciales se van a trabjar siempre mediante /api/nombreDeLaRuta. Es importante
notar que el nombre de la ruta tiene que ir siempre en plural.
## Ejemplo:
/api/v1/usuarios
/api/v1/clientes
/api/v1/productos

### Vamos a estar utilizando los siguientes metodos HTTP:
| Method | Action     |
| ------ | ---------- |
| GET    | Obtener    |
| POST   | Crear      |
| PUT    | Actualizar |
| DELETE | Eliminar   |

## Ejemplos con metodos HTTP:
GET /api/v1/usuarios
GET /api/v1/usuarios/:id
POST /api/v1/usuarios
PUT /api/v1/usuarios/:id
DELETE /api/v1/usuarios/:id

# Version del backend:
Para mantener un versionamiento limpio y claro del backend, vamos a trabajar con las 
versiones de la siguiente forma:

En caso de no poder abrir la imagen, la idea es la siguiente:

### Version mayor.menor.parche

## Ejemplo:

### Version 1.2.34

- En el campo "mayor" (el campo del 1) van cambios mayores a la API, la clase de cambios que son capaces de romper el API por completo si salen mal.

- En el campo "menor" (el campo del 2) van cambios menores a la API, cambios que no son capaces de romper algo mas alla de un modulo.

- En el campo "patch" (el campo del 34) van arreglos sumamente pequeños, como refactors o parcheo de bugs.

Es importante siempre que se haga una actualizacion en el API comunicar a los compañeros en
el grupo respecto a dicha actualizacion.

## Ejemplo:
Cambie la version del API de 0.1.0 a 0.1.1 ya que realice un refactor en la funcion
conseguirNombres porque estaba devolviendo error todo el tiempo. Por favor actualicen el
versionamiento de forma local en sus proyectos.

# Documentacion de APIs
En una carpeta docs bajo el archivo API.md se ubicaran direcciones de la siguiente forma:

# Usuarios

## GET /api/usuarios

Obtiene todos los usuarios.

Respuesta:
200 OK

De esta forma manenemos claras las direcciones de prueba a utilizar en postman por ejemplo.

# Otras clausulas no definidas pero pensadas:

## Patron de la capa de servicio
| Layer       | Responsibility          |
| ----------- | ----------------------- |
| Routes      | Define endpoints        |
| Controllers | Handle request/response |
| Services    | Business logic          |
| Models      | Database operations     |
| Utils       | Shared helpers          |

Se penso esta estructura para lo que seria la capa de servicio y su separacion

## Uso de DTOs
Utilizar DTOs para controlar que entra, sale y que campos estan expuestos en el proyecto

### Ejemplo:
Base de datos:
{
    id: 1,
    nombre: "Marco",
    contrasena: "HASH",
    correo: "test@gmail.com"
}

Respuesta con DTO:
{
    id: 1,
    nombre: "Marco",
    correo: "test@gmail.com"
}

## Log para auditoria
Generar un log que de seguimiento a cosas como:
Quien cambio que?
Cuando?
Desde donde?

### Ejemplo:
[24/06/2026 2:15PM]
Usuario admin actualizo producto 15
