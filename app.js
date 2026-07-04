import express from 'express';
import fisicoQuimicaRoutes from './routes/fisicoQuimica.routes.js';
import trazabilidadRoutes from './routes/trazabilidad.routes.js';

const app = express();

/*
//////////////////////////////////////////////////////////
MIDDLEWARES GLOBALES
//////////////////////////////////////////////////////////
*/

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/api/v1/lecturasFisicoQuimicas', fisicoQuimicaRoutes);
app.use('/api/v1/registrosTrazabilidad', trazabilidadRoutes);

app.listen(PORT, () => {
    console.log(`El server esta corriendo en http://localhost:${PORT}`);
});
