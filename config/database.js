/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: database.js
Autor: Gerald Alfaro
Fecha: 03/07/2026
Modulo: Config
Descripcion:
Configuracion de conexion a la base de datos principal
MySQL del proyecto Caprocam.
Este archivo centraliza la conexion para que los modelos
puedan consultar la base de datos usando el mismo pool.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////

Librerias externas
*/

import mysql from "mysql2/promise";
import dotenv from "dotenv";

/*
//////////////////////////////////////////////////////////
CONFIGURACION DE VARIABLES DE ENTORNO
//////////////////////////////////////////////////////////

Carga las variables definidas en el archivo .env.
Estas variables contienen los datos necesarios para conectarse
a la base de datos.
*/

dotenv.config();

/*
//////////////////////////////////////////////////////////
POOL DE CONEXION
//////////////////////////////////////////////////////////

Crea un pool de conexiones a MySQL.
El pool permite reutilizar conexiones y evita abrir una nueva
conexion por cada consulta realizada desde los modelos.
*/

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/*
//////////////////////////////////////////////////////////
PRUEBA DE CONEXION
//////////////////////////////////////////////////////////

Verifica que el backend pueda conectarse correctamente
a la base de datos al iniciar la aplicacion.
*/

try {
    /*
    Descripcion:
    Obtiene una conexion del pool para validar que los datos
    de conexion sean correctos.

    Retorna:
    - Mensaje en consola si la conexion es exitosa.
    - Mensaje de error si la conexion falla.
    */

    const connection = await pool.getConnection();

    console.log("Base de datos MySQL conectada correctamente.");

    connection.release();
} catch (error) {
    console.log("Error al conectar con la base de datos MySQL.");
    console.log(error.message);
}

/*
//////////////////////////////////////////////////////////
EXPORTACION
//////////////////////////////////////////////////////////

Exporta el pool de conexiones para que los modelos puedan
ejecutar consultas SQL mediante pool.execute().
*/

export default pool;