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
//////////////////////////////////////////////////////////
*/

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

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

try {
    const connection = await pool.getConnection();

    console.log("Base de datos MySQL conectada correctamente.");

    connection.release();
} catch (error) {
    console.log("Error al conectar con la base de datos MySQL.");
    console.log(error.message);
}

export default pool;