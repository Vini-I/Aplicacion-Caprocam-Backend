/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.dto.js
Autor: Gerald Alfaro
Fecha: 03/07/2026
Modulo: Estanques
Descripcion:
Archivo de transferencia de datos para estanques.
Transforma y normaliza los datos recibidos.
//////////////////////////////////////////////////////////
*/

export const EstadoEstanque = Object.freeze({
    ACTIVO: "Activo",
    EN_PREPARACION: "En preparacion",
    MANTENIMIENTO: "Mantenimiento",
    ENGORDE: "Engorde",
    COSECHADO: "Cosechado"
});

export class EstanqueDTO {
    constructor({
        id,
        uuid,
        grupoDatos,
        idFinca,
        fincaId,
        codigo,
        tipoEstanque,
        estado,
        largo,
        ancho,
        profundidad,
        fuenteAgua,
        especie,
        fechaSiembra,
        fechaInicioEngorde,
        fechaMantenimiento,
        densidadSiembra,
        usaPrecria,
        metodoAlimentacion,
        proveedorAlimento,
        numeroAireadores,
        tieneAlimentadorAutomatico,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version
    }) {
        this.id = id;
        this.uuid = uuid;

        if (grupoDatos === undefined || grupoDatos === null || String(grupoDatos).trim() === "") {
            this.grupoDatos = 1;
        } else {
            this.grupoDatos = Number(grupoDatos);
        }

        if (idFinca !== undefined && idFinca !== null && String(idFinca).trim() !== "") {
            this.idFinca = Number(idFinca);
        } else {
            this.idFinca = Number(fincaId);
        }

        this.codigo = normalizarTexto(codigo);
        this.tipoEstanque = normalizarTexto(tipoEstanque);
        this.estado = normalizarTexto(estado);
        this.largo = Number(largo);
        this.ancho = Number(ancho);
        this.profundidad = Number(profundidad);
        this.fuenteAgua = normalizarTextoOpcional(fuenteAgua);
        this.especie = normalizarTextoOpcional(especie);
        this.fechaSiembra = normalizarTextoOpcional(fechaSiembra);
        this.fechaInicioEngorde = normalizarTextoOpcional(fechaInicioEngorde);
        this.fechaMantenimiento = normalizarTextoOpcional(fechaMantenimiento);
        this.densidadSiembra = normalizarNumeroOpcional(densidadSiembra);
        this.usaPrecria = normalizarBooleano(usaPrecria);
        this.metodoAlimentacion = normalizarTextoOpcional(metodoAlimentacion);
        this.proveedorAlimento = normalizarTextoOpcional(proveedorAlimento);
        this.numeroAireadores = normalizarNumeroOpcional(numeroAireadores);
        this.tieneAlimentadorAutomatico = normalizarBooleano(tieneAlimentadorAutomatico);

        if (activo === undefined || activo === null) {
            this.activo = true;
        } else {
            this.activo = normalizarBooleano(activo);
        }

        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.deletedAt = deletedAt;
        this.version = version;
    }
}

function normalizarTexto(valor) {
    return String(valor).trim();
}

function normalizarTextoOpcional(valor) {
    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim() === "") {
        return null;
    }

    return String(valor).trim();
}

function normalizarNumeroOpcional(valor) {
    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim() === "") {
        return null;
    }

    return Number(valor);
}

function normalizarBooleano(valor) {
    if (valor === true) {
        return true;
    }

    if (valor === "true") {
        return true;
    }

    if (valor === "Si") {
        return true;
    }

    if (valor === "si") {
        return true;
    }

    if (valor === 1) {
        return true;
    }

    if (valor === "1") {
        return true;
    }

    return false;
}