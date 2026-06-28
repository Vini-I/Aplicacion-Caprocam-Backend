import {obtenerRegistros,obtenerRegistroPorId,crearRegistro} from "../services/alimentacion.service.js";
import {fincas,estanques,horas,tiposAlimento,presentaciones,metodos,proveedores} from "../data/dataForm.js";

export async function actualizarAlimentacion(req, res, next) {
    try {
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
        } = req.dto;
        const [rowsFinca] = await pooldb.execute(
            `SELECT id_finca
            FROM finca
            WHERE nombre = ?`,
            [finca]
        );
        if (rowsFinca.length === 0) {
            return res.status(404).json({
                error: "No se encontró la finca."
            });
        }
        const [rowsEstanque] = await pooldb.execute(
            `SELECT id_estanque
            FROM estanque
            WHERE nombre = ?`,
            [estanque]
        );
        if (rowsEstanque.length === 0) {
            return res.status(404).json({
                error: "No se encontró el estanque."
            });
        }
        const idFinca = rowsFinca[0].id_finca;
        const idEstanque = rowsEstanque[0].id_estanque;
        await pooldb.execute(
            `INSERT INTO alimentacion
            (
                id_finca,
                id_estanque,
                fecha,
                hora,
                tipo,
                presentacion,
                metodo,
                cantidad,
                proveedor,
                notas
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idFinca,
                idEstanque,
                fecha,
                hora,
                tipo,
                presentacion,
                metodo,
                cantidad,
                proveedor,
                notas
            ]
        );
        return res.status(201).json({
            mensaje: "Registro actualizado correctamente."
        });
    } catch (error) {
        next(error);
    }
}

export async function obtenerAlimentaciones(req, res, next) {
    try {
        const registros = obtenerRegistros();
        return res.status(200).json(registros);
    } catch (error) {
        next(error);
    }
}

export async function obtenerAlimentacionPorId(req, res, next) {
    try {
        const { id } = req.params;
        const registro = obtenerRegistroPorId(id);
        if (!registro) {
            return res.status(404).json({
                error: "Registro no encontrado."
            });
        }
        return res.status(200).json(registro);
    } catch (error) {
        next(error);
    }
}

export async function registrarAlimentacion(req, res, next) {
    try {
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
        } = req.dto;
        if (!horas.includes(hora)) {
            return res.status(400).json({
                error: "La hora ingresada no es válida."
            });
        }
        if (!tiposAlimento.includes(tipo)) {
            return res.status(400).json({
                error: "El tipo de alimento no es válido."
            });
        }
        if (!presentaciones.includes(presentacion)) {
            return res.status(400).json({
                error: "La presentación no es válida."
            });
        }
        if (!metodos.includes(metodo)) {
            return res.status(400).json({
                error: "El método no es válido."
            });
        }
        if (!proveedores.includes(proveedor)) {
            return res.status(400).json({
                error: "El proveedor no es válido."
            });
        }
        const fincaEncontrada = fincas.find(
            f => f.nombre === finca
        );
        if (!fincaEncontrada) {
            return res.status(404).json({
                error: "No se encontró la finca."
            });
        }
        const estanqueEncontrado = estanques.find(
            e => e.nombre === estanque
        );
        if (!estanqueEncontrado) {
            return res.status(404).json({
                error: "No se encontró el estanque."
            });
        }
        const nuevoRegistro = crearRegistro({
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
        });
        return res.status(201).json({
            mensaje: "Registro creado correctamente.",
            registro: nuevoRegistro
        });
    } catch (error) {
        next(error);
    }
}