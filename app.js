/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: app.js
Autor: Greivin Arguedas, Marco Vásquez, Eduard Salas, Felipe Salas, Jose Espinoza
Fecha: 29/06/2026
Modulo: Core / Configuracion
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
import densidadPoblacionalRouter from "./routes/densidadPoblacional.routes.js";
import alimentacionRouter from "./alimentacion/routes/alimentacion.routes.js";

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

// Colaboradores
app.use("/api/v0/colaboradores", colaboradoresRouter);

// Alimentación
app.use("/api/v0/alimentaciones", alimentacionRouter);

// Crecimiento
app.use("/api/v0/crecimiento", crecimientoRouter);

// Estanques
app.use("/api/v0/estanques", estanquesRouter);

// Densidad Poblacional
app.use("/api/v0/densidades-poblacionales", densidadPoblacionalRouter);

// Modulos Team 6
app.use("/api/v0/productos", productoRouter);
app.use("/api/v0/compradores", compradorRouter);

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
MANEJO DE RUTAS NO ENCONTRADAS
//////////////////////////////////////////////////////////
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "La ruta solicitada no existe."

    });

});

/*
//////////////////////////////////////////////////////////
EXPORTACION
//////////////////////////////////////////////////////////
*/

export default app;