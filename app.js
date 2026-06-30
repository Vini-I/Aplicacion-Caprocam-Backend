import express from "express";
import rutaProveedor from "./routes/proveedor.route.js";

const app = express();
const PORT = 4000;

app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.use("/api/v1/proveedores", rutaProveedor);


app.listen(PORT, () => {
    console.log(`El server esta corriendo en http://localhost:${PORT}`);
});