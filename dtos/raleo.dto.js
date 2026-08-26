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
        - idSiembra: Identificador de la siembra                                 (requerido)
        - fecha: La fecha en la cual se realiza el raleo                         (requerido)
        - porcentaje: Porcentaje del raleo (esta se calcula en front y back)     (requerido)
        - kgRetirados: Kg que se restan de la biomasa anterior                   (requerido)
        - bimasaRestante: La biomasa restante                                    (requerido)
        - biomasaEstimada: Biomasa estimada                                      (requerido)
        - observaciones: Apuntes adicionales del raleo                           (opcional)
        - creadoPorUsuarioId: Identificador del usuario que creó el registro.
        - creadoPorColaboradorId: Identificador del colaborador que realizó el raleo.        
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
        idSiembra,
        fecha,
        porcentaje,
        kgRetirados,
        biomasaRestante,
        biomasaEstimada,
        observaciones,
        creadoPorUsuarioId,
        creadoPorColaboradorId,        
        activo,
        fechaCreacion,
        fechaActualizacion, 
        deletedAt,
        version

    }) {
        this.id                     = id;
        this.uuid                   = uuid;
        this.grupoDatos             = grupoDatos;
        this.idFinca                = Number(idFinca);
        this.idEstanque             = Number(idEstanque);
        this.idSiembra              = Number(idSiembra);
        this.fecha                  = normalizarTexto(fecha);
        this.porcentaje             = Number(porcentaje);
        this.kgRetirados            = Number(kgRetirados);
        this.biomasaRestante        = Number(biomasaRestante);
        this.biomasaEstimada        = Number(biomasaEstimada);
        this.observaciones          = normalizarTextoOpcional(observaciones);
        this.creadoPorUsuarioId     = normalizarNumeroOpcional(creadoPorUsuarioId);
        this.creadoPorColaboradorId = normalizarNumeroOpcional(creadoPorColaboradorId);        
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