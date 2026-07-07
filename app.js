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
import parasitologiasRouter from "./routes/parasitologias.routes.js";
import enfermedadesRouter from "./routes/enfermedades.routes.js";
import densidadPoblacionalRouter from "./routes/densidadPoblacional.routes.js";
import alimentacionRouter from "./routes/alimentacion.routes.js";
import raleoRouter from "./routes/raleo.routes.js"
import ventasRouter from "./routes/mantVentas.routes.js";
import mantenimientoRouter from './routes/mantenimiento.routes.js';
import tareaRouter from './routes/tarea.routes.js';
import loginRouter     from "./routes/loginUsuarios.routes.js";
import fincaRoutes from "./routes/finca.routes.js";
import equipoRouter    from "./routes/equipo.routes.js";
import fisicoQuimicaRoutes from './routes/fisicoQuimica.routes.js';
import trazabilidadRoutes from './routes/trazabilidad.routes.js';

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

app.use("/api/v0/colaboradores", colaboradoresRouter);
app.use("/api/v0/crecimiento", crecimientoRouter);
app.use("/api/v0/estanques", estanquesRouter);
app.use("/api/v0/parasitologias", parasitologiasRouter);
app.use("/api/v0/enfermedades", enfermedadesRouter);
app.use("/api/v0/alimentaciones", alimentacionRouter);
app.use("/api/v0/densidad-poblacional", densidadPoblacionalRouter);
app.use("/api/v0/raleo", raleoRouter);
app.use("/api/v0/ventas", ventasRouter);
app.use('/api/v0/mantenimientos', mantenimientoRouter);
app.use('/api/v0/tareas', tareaRouter);
app.use("/api/v0/login",  loginRouter);
app.use("/api/v0/fincas", fincaRoutes);
app.use("/api/v0/equipos", equipoRouter);
app.use('/api/v0/lecturasFisicoQuimicas', fisicoQuimicaRoutes);
app.use('/api/v0/registrosTrazabilidad', trazabilidadRoutes);

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