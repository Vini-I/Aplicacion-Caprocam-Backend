import routesAlimentacion from "./routes/alimentacion.routes.js";

const express = require('express');
const app = express();
const PORT = 4000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
})

app.use(/api/alimentacion,routesAlimentacion);

app.listen(PORT, () => {
    console.log(`El server esta corriendo en http://localhost:${PORT}`)
})