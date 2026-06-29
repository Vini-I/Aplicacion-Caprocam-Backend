/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: app.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Raiz / Configuracion
Descripcion:
Archivo principal del backend. Configura los middlewares globales
e integra las rutas de los modulos del proyecto.
//////////////////////////////////////////////////////////
*/

// Librerias externas (Usando imports por el cambio a type: module)
import express from "express";
import cors from "cors";

// Rutas de tus modulos de este Sprint
import productosRoutes from "./routes/productos.routes.js";
import compradoresRoutes from "./routes/compradores.routes.js";

const app = express();

/*
//////////////////////////////////////////////////////////
MIDDLEWARES GLOBALES
//////////////////////////////////////////////////////////
*/
app.use(cors());
app.use(express.json());

/*
//////////////////////////////////////////////////////////
INYECCION DE RUTAS
//////////////////////////////////////////////////////////
*/
// Rutas del modulo de Productos
app.use("/api/v1/productos", productosRoutes);

// Rutas del modulo de Compradores
app.use("/api/v1/compradores", compradoresRoutes);

/*
//////////////////////////////////////////////////////////
MANEJO DE RUTAS NO ENCONTRADAS (404)
//////////////////////////////////////////////////////////
*/
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "La ruta solicitada no existe en el servidor."
    });
});

export default app;