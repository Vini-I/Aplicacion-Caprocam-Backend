/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: app.js
Autor: Greivin Arguedas, Marco Vásquez, Eduard Salas, Felipe Salas, Jose Espinoza
Fecha: 29/06/2026
Modulo: Core / Configuracion
Descripcion:
Autor: Greivin Arguedas, Marco Vásquez, Eduard Salas, Felipe Salas
Fecha: 06/07/2026
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
//import alimentacionRouter from "./routes/alimentacion.routes.js";
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

const PORT = 4000;
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
app.use('/api/v0/lecturasFisicoQuimicas', fisicoQuimicaRoutes);
app.use('/api/v0/registrosTrazabilidad', trazabilidadRoutes);

/*
//////////////////////////////////////////////////////////
app.use("/api/v0/colaboradores", colaboradoresRouter);
app.use("/api/v0/crecimiento", crecimientoRouter);
app.use("/api/v0/estanques", estanquesRouter);
app.use("/api/v0/parasitologias", parasitologiasRouter);
app.use("/api/v0/enfermedades", enfermedadesRouter);
//app.use("/api/v0/alimentaciones", alimentacionRouter);
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
MANEJO DE RUTAS NO ENCONTRADAS
//////////////////////////////////////////////////////////
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,
        message: "La ruta solicitada no existe."

    });

/*
//////////////////////////////////////////////////////////
INICIALIZACION DEL SERVIDOR
//////////////////////////////////////////////////////////
Levanta el servicio HTTP para comenzar a escuchar las
peticiones entrantes.
*/
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto http://localhost:${PORT}`);
});

/*
//////////////////////////////////////////////////////////
EXPORTACION
//////////////////////////////////////////////////////////
*/

export default app;
