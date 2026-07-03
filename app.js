/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: app.js
Autor: Jose Espinoza
Fecha: 29/06/2026
Modulo: Raiz / Configuracion
Descripcion:
Archivo principal del backend configurado con ES Modules.
Integra los middlewares globales y enruta todos los modulos.
//////////////////////////////////////////////////////////
*/

// Librerias externas
import express from "express";
import cors from "cors";

// Rutas existentes
import colaboradoresRouter from "./routes/colaborador.routes.js";
import estanquesRouter from "./routes/estanques.routes.js";

// Rutas Team 6
import productoRouter from "./routes/producto.routes.js";
import compradorRouter from "./routes/comprador.routes.js";

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

// Modulos existentes
app.use("/api/v1/colaboradores", colaboradoresRouter);
app.use("/api/v1/estanques", estanquesRouter);

// Modulos Team 6
app.use("/api/v1/productos", productoRouter);
app.use("/api/v1/compradores", compradorRouter);

/*
//////////////////////////////////////////////////////////
MANEJO DE RUTAS NO ENCONTRADAS
//////////////////////////////////////////////////////////
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "La ruta solicitada no existe."

    });

});

export default app;