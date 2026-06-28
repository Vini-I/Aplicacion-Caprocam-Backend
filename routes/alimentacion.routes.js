import { Router } from "express";
import {actualizarAlimentacion,obtenerAlimentaciones,obtenerAlimentacionPorId,registrarAlimentacion} from "../controllers/alimentacion.controller.js";
import { createAlimentacionDTO } from "../dtos/alimentacion.dto.js";
import {validateDto} from "../middlewares/alimentacion.middleware.js";

const router = Router();

router.post("/actualizar",validateDto(createAlimentacionDTO),actualizarAlimentacion);
router.get("/buscar",obtenerAlimentaciones);
router.get("/buscarPorId/:id",obtenerAlimentacionPorId);
router.post("/registrar",validateDto(createAlimentacionDTO),registrarAlimentacion);

export default router;