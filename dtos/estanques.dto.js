/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.dto.js
Autor: Gerald Alfaro
Fecha: 29/06/2026
Modulo: Estanques
Descripcion:
Archivo de transferencia de datos para estanques.
Transforma y normaliza los datos recibidos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo estado.
*/

export const EstadoEstanque = Object.freeze({
    ACTIVO: "Activo",
    EN_PREPARACION: "En preparacion",
    MANTENIMIENTO: "Mantenimiento",
    ENGORDE: "Engorde",
    COSECHADO: "Cosechado"
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de estanques.
*/

export class EstanqueDTO {
    constructor({
        id,
        idFinca,
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
        fechaCreacion,
        fechaActualizacion
    }) {
        /*
        Descripcion:
        Construye un objeto EstanqueDTO con los datos recibidos.

        Parametros:
        - id: Identificador unico
        - idFinca: Identificador de la finca
        - codigo: Codigo del estanque
        - tipoEstanque: Tipo de estanque
        - estado: Estado actual del estanque
        - largo: Largo del estanque
        - ancho: Ancho del estanque
        - profundidad: Profundidad del estanque
        - fuenteAgua: Fuente de agua
        - especie: Especie sembrada
        - fechaSiembra: Fecha de siembra
        - fechaInicioEngorde: Fecha de inicio de engorde
        - fechaMantenimiento: Fecha de mantenimiento
        - densidadSiembra: Densidad de siembra
        - usaPrecria: Indica si usa precria
        - metodoAlimentacion: Metodo de alimentacion
        - proveedorAlimento: Proveedor de alimento
        - numeroAireadores: Numero de aireadores
        - tieneAlimentadorAutomatico: Indica si tiene alimentador automatico
        - fechaCreacion: Fecha de creacion
        - fechaActualizacion: Fecha de actualizacion
        */
        this.id = id;
        this.idFinca = Number(idFinca);
        this.codigo = normalizarTexto(codigo);
        this.tipoEstanque = normalizarTexto(tipoEstanque);
        this.estado = normalizarTexto(estado);
        this.largo = Number(largo);
        this.ancho = Number(ancho);
        this.profundidad = Number(profundidad);
        this.fuenteAgua = normalizarTextoOpcional(fuenteAgua);
        this.especie = normalizarTextoOpcional(especie);
        this.fechaSiembra = normalizarTexto(fechaSiembra);
        this.fechaInicioEngorde = normalizarTextoOpcional(fechaInicioEngorde);
        this.fechaMantenimiento = normalizarTextoOpcional(fechaMantenimiento);
        this.densidadSiembra = Number(densidadSiembra);
        this.usaPrecria = normalizarBooleano(usaPrecria);
        this.metodoAlimentacion = normalizarTextoOpcional(metodoAlimentacion);
        this.proveedorAlimento = normalizarTextoOpcional(proveedorAlimento);
        this.numeroAireadores = normalizarNumeroOpcional(numeroAireadores);
        this.tieneAlimentadorAutomatico = normalizarBooleano(tieneAlimentadorAutomatico);
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas para normalizar datos.
*/

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
        return 0;
    }

    if (valor === null) {
        return 0;
    }

    if (String(valor).trim() === "") {
        return 0;
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