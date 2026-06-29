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
import express from 'express';
import cors from 'cors';

// RUTAS DE LOS MODULOS
// Rutas agregadas por el equipo (Mantener los de develop)
// (Si tus compañeros tenian rutas como colaboradores, auth, etc., Express las cargara aqui)

// Tus rutas de este Sprint bajo el estandar
import productosRoutes from './routes/producto.routes.js';
import compradoresRoutes from './routes/comprador.routes.js';

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
// Rutas de tus modulos asignados
app.use('/api/v1/productos', productosRoutes);
app.use('/api/v1/compradores', compradoresRoutes);

/*
//////////////////////////////////////////////////////////
MANEJO DE RUTAS NO ENCONTRADAS (404)
//////////////////////////////////////////////////////////
*/
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'La ruta solicitada no existe en el servidor.'
    });
});

export default app;
