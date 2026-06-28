import Alimentacion,{alimentacionDB} from "../models/alimentacion.model.js";
import {createAlimentacionDTO} from "../dtos/alimentacion.dto.js";

export function obtenerRegistros() {
    return alimentacionDB;
}

export function obtenerRegistroPorId(id) {
    return alimentacionDB.find(
        item => item.id === Number(id)
    );

}

export function crearRegistro(data) {
    const dto = createAlimentacionDTO(data);
    const nuevoRegistro = new Alimentacion({
        id: alimentacionDB.length > 0
            ? alimentacionDB[alimentacionDB.length - 1].id + 1
            : 1,
        ...dto
    });
    alimentacionDB.push(nuevoRegistro);
    return nuevoRegistro;
}