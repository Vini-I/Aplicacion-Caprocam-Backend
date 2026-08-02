/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: raleo.dto.js
Autor: Sebastian Villegas Barquero
Fecha: 02/07/2026
Modulo: Raleo
Descripcion:
Archivo de transferencia de datos para raleo.
Transforma y normaliza los datos recibidos.
//////////////////////////////////////////////////////////
*/
/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
Define los valores permitidos para el campo metodo.
*/
export const MetodoRaleo = Object.freeze({
    ATARRAYA: "Atarraya",
    RED_DE_ARRASTRE: "Red de arrastre",
    BOLEO: "Boleo",
    TRAMPA_SELECTIVA: "Trampa selectiva",
});
/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
Caparazon de datos para el modulo de raleo.
*/
export class RaleoDTO {
    constructor({
        /*
        Descripcion:
        Construye un objeto RaleoDTO con los datos recibidos.
        Parametros:
        - id: Identificador unico                                                (requerido)
        - uuid: Identificador global usado para futura sincronizacion offline
        - grupoDatos: Codigo del grupo de datos al que pertenece el raleo        
        - idFinca: Identificador de la finca                                     (requerido)
        - idEstanque: Identificador del estanque                                 (requerido)
        - idColaborador: Identificador del colaborador                           (opcional)
        - fecha: La fecha en la cual se realiza el raleo                         (requerido)
        - porcentaje: Porcentaje del raleo                                       (requerido)
        - pesoEstimado: El peso estimado                                         (requerido)
        - biomasaEstimado: Biomasa estimada                                      (requerido)
        - objetivo: El objetivo del raleo                                        (requerido)
        - metodo: Mtodo de extraccion del raleo                                  (requerido)
        - observaciones: Apuntes adicionales del raleo                           (opcional)
        - activo: Estado logico del registro.
        - fechaCreacion: Fecha de creacion del registro.
        - fechaActualizacion: Fecha de ultima actualizacion.
        - deletedAt: Fecha de borrado logico.
        - version: Version del registro para control de cambios.

        Retorna:
        - Objeto RaleoDTO con campos normalizados.
        */
        id,
        uuid,
        grupoDatos,
        idFinca,
        idEstanque,
        idColaborador,
        fecha,
        porcentaje,
        pesoEstimado,
        biomasaEstimado,
        objetivo,
        metodo,
        observaciones,
        activo,
        fechaCreacion,
        fechaActualizacion, 
        deletedAt,
        version

    }) {
        this.id              = id;
        this.uuid            = uuid;
        this.grupoDatos      = grupoDatos;
        this.idFinca         = Number(idFinca);
        this.idEstanque      = Number(idEstanque);
        /*
        idColaborador es opcional (columna colaborador_id es NULL en
        la base de datos, igual que en crecimientos): representa el
        colaborador que realizo fisicamente el raleo, elegido en un
        Select por quien llena el formulario. Si no viene, queda en
        null en vez de forzar Number(undefined) = NaN.
        */
        this.idColaborador   = normalizarNumeroOpcional(idColaborador);
        this.fecha           = normalizarTexto(fecha);
        this.porcentaje      = Number(porcentaje);
        this.pesoEstimado    = Number(pesoEstimado);
        this.biomasaEstimado = Number(biomasaEstimado);
        this.objetivo        = normalizarTexto(objetivo);
        this.metodo          = normalizarTexto(metodo);
        this.observaciones   = normalizarTextoOpcional(observaciones);
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
Contiene funciones internas para normalizar datos.
*/
function normalizarTexto(valor) {
    return String(valor).trim();
}

function normalizarNumeroOpcional(valor) {
    /*
    Descripcion:
    Convierte un valor a numero, permitiendo que quede en null si
    no viene definido. A diferencia de Number(undefined) (que da
    NaN), esto evita insertar NaN en columnas nullable.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero si el valor es valido, null si no vino definido/vacio.
    */
    if (valor === undefined || valor === null || String(valor).trim() === "") {
        return null;
    }

    const numero = Number(valor);

    return Number.isNaN(numero) ? null : numero;
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