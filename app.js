/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     app.js
Autor:       Marco Vásquez / Greivin Arguedas / Felipe Salas
Fecha:       29/06/2026
Modulo:      Core
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

Librerías externas
*/

import express from "express";
import cors from "cors";

// Rutas — módulo Colaboradores
import colaboradoresRouter from "./routes/colaborador.routes.js";

// Rutas — módulo Alimentación
import alimentacionRouter from "./alimentacion/routes/alimentacion.routes.js";

// Rutas — módulo Crecimiento
import crecimientoRouter from "./routes/mantCrecimiento.routes.js";

// Rutas — módulo Estanques
import estanquesRouter from "./routes/estanques.routes.js";

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

app.use("/api/v1/colaboradores", colaboradoresRouter);
app.use("/api/v1/alimentaciones", alimentacionRouter);
app.use("/api/v1/crecimiento", crecimientoRouter);
app.use("/api/v1/estanques", estanquesRouter);

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