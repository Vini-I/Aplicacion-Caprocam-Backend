/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: estanques.dto.js
Autor: Gerald Alfaro
Fecha: 18/07/2026
Modulo: Estanques
Descripcion:
Archivo de transferencia de datos para estanques.
Transforma y normaliza los datos recibidos antes de
enviarlos al modelo o devolverlos como respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el estado del estanque.
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
        precria,
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
        /*
        Descripcion:
        Construye un objeto EstanqueDTO con los datos
        normalizados.

        El grupoDatos debe ser enviado por el controller
        desde la informacion obtenida del JWT.
        */

        this.id = id;
        this.uuid = uuid;

        this.grupoDatos = Number(
            grupoDatos
        );

        if (
            idFinca !== undefined &&
            idFinca !== null &&
            String(idFinca).trim() !== ""
        ) {
            this.idFinca = Number(
                idFinca
            );
        } else {
            this.idFinca = Number(
                fincaId
            );
        }

        this.fincaId = this.idFinca;

        this.codigo = normalizarTexto(
            codigo
        );

        this.tipoEstanque = normalizarTexto(
            tipoEstanque
        );

        this.estado = normalizarTexto(
            estado
        );

        this.largo = Number(
            largo
        );

        this.ancho = Number(
            ancho
        );

        this.profundidad = Number(
            profundidad
        );

        this.fuenteAgua = normalizarTextoOpcional(
            fuenteAgua
        );

        this.especie = normalizarTextoOpcional(
            especie
        );

        this.fechaSiembra = normalizarTextoOpcional(
            fechaSiembra
        );

        this.fechaInicioEngorde =
            normalizarTextoOpcional(
                fechaInicioEngorde
            );

        this.fechaMantenimiento =
            normalizarTextoOpcional(
                fechaMantenimiento
            );

        this.densidadSiembra =
            normalizarNumeroOpcional(
                densidadSiembra
            );

        let valorPrecria = usaPrecria;

        if (
            valorPrecria === undefined ||
            valorPrecria === null
        ) {
            valorPrecria = precria;
        }

        this.usaPrecria = normalizarBooleano(
            valorPrecria
        );

        /*
        Alias mantenido para compatibilidad con codigo
        anterior del frontend.
        */

        this.precria = this.usaPrecria;

        this.metodoAlimentacion =
            normalizarTextoOpcional(
                metodoAlimentacion
            );

        this.proveedorAlimento =
            normalizarTextoOpcional(
                proveedorAlimento
            );

        this.numeroAireadores =
            normalizarNumeroOpcional(
                numeroAireadores
            );

        this.tieneAlimentadorAutomatico =
            normalizarBooleano(
                tieneAlimentadorAutomatico
            );

        if (
            activo === undefined ||
            activo === null
        ) {
            this.activo = true;
        } else {
            this.activo = normalizarBooleano(
                activo
            );
        }

        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.deletedAt = deletedAt;
        this.version = version;
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas para normalizar los datos.
*/

function normalizarTexto(valor) {
    /*
    Descripcion:
    Convierte un valor obligatorio a texto y elimina
    espacios al inicio y al final.
    */

    return String(valor).trim();
}

function normalizarTextoOpcional(valor) {
    /*
    Descripcion:
    Normaliza campos de texto opcionales.
    */

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
    /*
    Descripcion:
    Normaliza campos numericos opcionales.
    */

    if (valor === undefined) {
        return null;
    }

    if (valor === null) {
        return null;
    }

    if (String(valor).trim() === "") {
        return null;
    }

    return Number(
        valor
    );
}

function normalizarBooleano(valor) {
    /*
    Descripcion:
    Convierte diferentes representaciones a booleano.
    */

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