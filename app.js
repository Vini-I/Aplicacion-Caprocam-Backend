/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: app.js
Autor: Greivin Arguedas, Marco Vásquez, Eduard Salas, Felipe Salas
Fecha: 29/06/2026
Modulo: Core
Descripcion:
Punto de entrada del servidor. Configura Express,
monta los middlewares globales y registra las rutas
de todos los módulos del proyecto.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import express from "express";
import cors from "cors";

// Rutas
import colaboradoresRouter from "./routes/colaborador.routes.js";
import crecimientoRouter from "./routes/mantCrecimiento.routes.js";
import estanquesRouter from "./routes/estanques.routes.js";
//import densidadPoblacionalRouter from "./routes/densidadPoblacional.routes.js";
//import alimentacionRouter from "./alimentacion/routes/alimentacion.routes.js";
import raleoRouter from "./routes/raleo.routes.js"

/*
//////////////////////////////////////////////////////////
CONSTANTES
//////////////////////////////////////////////////////////
*/

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
RUTAS
//////////////////////////////////////////////////////////
*/

// Colaboradores
app.use("/api/v1/colaboradores", colaboradoresRouter);

// Alimentación
//app.use("/api/v1/alimentaciones", alimentacionRouter);

// Crecimiento
app.use("/api/v1/crecimiento", crecimientoRouter);

// Estanques
app.use("/api/v1/estanques", estanquesRouter);

// Densidad Poblacional
//app.use("/api/v1/densidades-poblacionales", densidadPoblacionalRouter);

// Raleo
app.use("/api/v1/raleo", raleoRouter);

/*
//////////////////////////////////////////////////////////
ENDPOINT DE VERIFICACION
//////////////////////////////////////////////////////////
Permite comprobar que la API se
encuentra ejecutándose correctamente.
*/

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "API CAPROCAM funcionando correctamente."
    });
});

/*
//////////////////////////////////////////////////////////
EXPORTACION
//////////////////////////////////////////////////////////
*/

export default app;