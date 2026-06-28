export const createAlimentacionDTO = (data) => {

    if (!data.fecha) {
        throw new Error("La fecha es obligatoria.");
    }
    if (!data.hora) {
        throw new Error("La hora es obligatoria.");
    }
    if (!data.finca) {
        throw new Error("La finca es obligatoria.");
    }
    if (!data.estanque) {
        throw new Error("El estanque es obligatorio.");
    }
    if (!data.tipo) {
        throw new Error("El tipo de alimento es obligatorio.");
    }
    if (!data.presentacion) {
        throw new Error("La presentación es obligatoria.");
    }
    if (!data.metodo) {
        throw new Error("El método es obligatorio.");
    }
    if (data.cantidad === undefined || data.cantidad === null) {
        throw new Error("La cantidad es obligatoria.");
    }
    if (!data.proveedor) {
        throw new Error("El proveedor es obligatorio.");
    }
    return {
        fecha: data.fecha.trim(),
        hora: data.hora.trim(),
        finca: data.finca.trim(),
        estanque: data.estanque.trim(),
        tipo: data.tipo.trim(),
        presentacion: data.presentacion.trim(),
        metodo: data.metodo.trim(),
        cantidad: Number(data.cantidad),
        proveedor: data.proveedor.trim(),
        notas: data.notas ? data.notas.trim() : ""
    };
};

export const updateAlimentacionDTO = (data) => {
    const dto = {};
    if (data.fecha !== undefined) {
        dto.fecha = data.fecha.trim();
    }
    if (data.hora !== undefined) {
        dto.hora = data.hora.trim();
    }
    if (data.finca !== undefined) {
        dto.finca = data.finca.trim();
    }
    if (data.estanque !== undefined) {
        dto.estanque = data.estanque.trim();
    }
    if (data.tipo !== undefined) {
        dto.tipo = data.tipo.trim();
    }
    if (data.presentacion !== undefined) {
        dto.presentacion = data.presentacion.trim();
    }
    if (data.metodo !== undefined) {
        dto.metodo = data.metodo.trim();
    }
    if (data.cantidad !== undefined) {
        dto.cantidad = Number(data.cantidad);
    }
    if (data.proveedor !== undefined) {
        dto.proveedor = data.proveedor.trim();
    }
    if (data.notas !== undefined) {
        dto.notas = data.notas.trim();
    }
    return dto;
};

export const responseAlimentacionDTO = (data) => {
    return {
        id: data.id,
        fecha: data.fecha,
        hora: data.hora,
        finca: data.finca,
        estanque: data.estanque,
        tipo: data.tipo,
        presentacion: data.presentacion,
        metodo: data.metodo,
        cantidad: data.cantidad,
        proveedor: data.proveedor,
        notas: data.notas
    };
};