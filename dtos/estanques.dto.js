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
Transforma y normaliza los datos recibidos antes de enviarlos
al modelo o devolverlos como respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo estado del estanque.
Estos valores deben coincidir con los permitidos en la base de datos.
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
Normaliza los campos recibidos desde el body antes de que sean
procesados por el controller y el model.
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
        Construye un objeto EstanqueDTO con los datos recibidos.

        Parametros:
        - id: Identificador numerico interno del estanque.
        - uuid: Identificador global usado para futura sincronizacion offline.
        - grupoDatos: Codigo del grupo de datos al que pertenece el estanque.
        - idFinca: Identificador de la finca recibido desde el frontend.
        - fincaId: Identificador alternativo de finca, usado si no viene idFinca.
        - codigo: Codigo unico del estanque dentro de una finca.
        - tipoEstanque: Tipo de estanque.
        - estado: Estado actual del estanque.
        - largo: Largo del estanque.
        - ancho: Ancho del estanque.
        - profundidad: Profundidad del estanque.
        - fuenteAgua: Fuente de agua del estanque.
        - especie: Especie cultivada.
        - fechaSiembra: Fecha de siembra.
        - fechaInicioEngorde: Fecha de inicio de engorde.
        - fechaMantenimiento: Fecha de mantenimiento.
        - densidadSiembra: Densidad de siembra.
        - usaPrecria: Indica si el estanque usa precria.
        - metodoAlimentacion: Metodo de alimentacion.
        - proveedorAlimento: Proveedor del alimento.
        - numeroAireadores: Cantidad de aireadores.
        - tieneAlimentadorAutomatico: Indica si tiene alimentador automatico.
        - activo: Estado logico del registro.
        - fechaCreacion: Fecha de creacion del registro.
        - fechaActualizacion: Fecha de ultima actualizacion.
        - deletedAt: Fecha de borrado logico.
        - version: Version del registro para control de cambios.

        Retorna:
        - Objeto EstanqueDTO con campos normalizados.
        */

        this.id = id;
        this.uuid = uuid;

        /*
        Si grupoDatos no viene definido, se utiliza 1 como valor
        temporal para pruebas mientras se implementa autenticacion.
        */
        if (grupoDatos === undefined || grupoDatos === null || String(grupoDatos).trim() === "") {
            this.grupoDatos = 1;
        } else {
            this.grupoDatos = Number(grupoDatos);
        }

        /*
        Se permite recibir idFinca o fincaId para mantener compatibilidad
        con diferentes nombres enviados desde el frontend.
        */
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

        /*
        Si activo no viene definido, el registro se considera activo
        por defecto.
        */
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

/*
//////////////////////////////////////////////////////////
FUNCIONES SECUNDARIAS
//////////////////////////////////////////////////////////

Contiene funciones internas para normalizar los datos recibidos.
Estas funciones no consultan base de datos.
*/

function normalizarTexto(valor) {
    /*
    Descripcion:
    Convierte un valor obligatorio a texto y elimina espacios
    al inicio y al final.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Texto normalizado.
    */
    return String(valor).trim();
}

function normalizarTextoOpcional(valor) {
    /*
    Descripcion:
    Normaliza campos de texto opcionales.
    Si el valor viene vacio, undefined o null, retorna null.

    Parametros:
    - valor: Valor opcional recibido.

    Retorna:
    - Texto normalizado o null.
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
    Si el valor viene vacio, undefined o null, retorna null.

    Parametros:
    - valor: Valor numerico opcional recibido.

    Retorna:
    - Numero normalizado o null.
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

    return Number(valor);
}

function normalizarBooleano(valor) {
    /*
    Descripcion:
    Convierte diferentes representaciones de verdadero o falso
    a un valor booleano.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - true si el valor representa verdadero.
    - false en cualquier otro caso.
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