import {createAlimentacionDTO} from "../dtos/alimentacion.dto.js";

export const validateAlimentacion = (req, res, next) => {
    const {
        fecha,
        hora,
        finca,
        estanque,
        tipo,
        presentacion,
        metodo,
        cantidad,
        proveedor,
        notas
    } = req.body;
    if (!fecha) {
        return res.status(400).json({
            success: false,
            message: "La fecha es obligatoria."
        });
    }
    if (!hora) {
        return res.status(400).json({
            success: false,
            message: "La hora es obligatoria."
        });
    }
    if (!finca) {
        return res.status(400).json({
            success: false,
            message: "La finca es obligatoria."
        });
    }
    if (!estanque) {
        return res.status(400).json({
            success: false,
            message: "El estanque es obligatorio."
        });
    }
    if (!tipo) {
        return res.status(400).json({
            success: false,
            message: "El tipo de alimento es obligatorio."
        });
    }
    if (!presentacion) {
        return res.status(400).json({
            success: false,
            message: "La presentación es obligatoria."
        });
    }
    if (!metodo) {
        return res.status(400).json({
            success: false,
            message: "El método es obligatorio."
        });
    }
    if (cantidad === undefined || cantidad === null) {
        return res.status(400).json({
            success: false,
            message: "La cantidad es obligatoria."
        });
    }
    if (!proveedor) {
        return res.status(400).json({
            success: false,
            message: "El proveedor es obligatorio."
        });
    }
    req.dto = new createAlimentacionDTO(
        null,
        null,
        null,
        fecha.trim(),
        hora.trim(),
        tipo.trim(),
        presentacion.trim(),
        metodo.trim(),
        Number(cantidad),
        proveedor.trim(),
        notas ? notas.trim() : ""
    );
    next();
};

export const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Error interno del servidor"
    });
};

export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`
    });
};

export const validateDto = (dtoFunction) => {
  return (req, res, next) => {
    try {
      const result = dtoFunction(req.body);
      req.dto = result;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Error en validación de datos",
        error: error.message,
      });
    }
  };
};