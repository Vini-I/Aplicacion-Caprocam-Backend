/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.dto.js
Autor: Andres Gutierrez
Fecha: 03/07/2026
Modulo: Parasitologias
Descripcion:
Archivo de transferencia de datos para parasitologias.
Transforma y normaliza los datos recibidos antes de enviarlos
al modelo o devolverlos como respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el campo parasito.
Estos valores deben coincidir con los permitidos en la base de datos.
*/

export const ParasitoParasitologia = Object.freeze({
    GREGARINA: "gregarina",
    NEMATODO: "nematodo",
    EPICOMENSAL: "epicomensal",
    PROTOZOARIO: "protozoario",
    OTRO: "otro"
});

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para el grado de infeccion.
Estos valores deben coincidir con los permitidos en la base de datos.
*/

export const GradoInfeccion = Object.freeze({
    BAJO: "bajo",
    MEDIO: "medio",
    ALTO: "alto"
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de parasitologias.
Normaliza los campos recibidos desde el body antes de que sean
procesados por el controller y el model.
*/

export class ParasitologiaDTO {
    constructor({
        id,
        uuid,
        grupoDatos,
        fincaId,
        idFinca,
        estanqueId,
        idEstanque,
        colaboradorId,
        tipoRegistro,
        fechaReporte,
        responsable,
        parasito,
        camaronesMuestreados,
        camaronesInfectados,
        porcentajeInfeccion,
        gradoInfeccion,
        observaciones,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version
    }) {
        /*
        Descripcion:
        Construye un objeto ParasitologiaDTO con los datos recibidos.

        Parametros:
        - id: Identificador numerico interno del registro.
        - uuid: Identificador global usado para futura sincronizacion offline.
        - grupoDatos: Codigo del grupo de datos al que pertenece el registro.
        - fincaId: Identificador de la finca.
        - idFinca: Identificador alternativo de finca, usado si no viene fincaId.
        - estanqueId: Identificador del estanque.
        - idEstanque: Identificador alternativo del estanque, usado si no viene estanqueId.
        - colaboradorId: Identificador del colaborador que registra la informacion.
        - tipoRegistro: Tipo de registro del modulo.
        - fechaReporte: Fecha del reporte parasitologico.
        - responsable: Nombre del responsable del reporte.
        - parasito: Tipo de parasito encontrado.
        - camaronesMuestreados: Cantidad de camarones revisados.
        - camaronesInfectados: Cantidad de camarones infectados.
        - porcentajeInfeccion: Porcentaje calculado de infeccion.
        - gradoInfeccion: Nivel de infeccion calculado.
        - observaciones: Comentarios adicionales.
        - activo: Estado logico del registro.
        - fechaCreacion: Fecha de creacion del registro.
        - fechaActualizacion: Fecha de ultima actualizacion.
        - deletedAt: Fecha de borrado logico.
        - version: Version del registro para control de cambios.

        Retorna:
        - Objeto ParasitologiaDTO con campos normalizados.
        */

        this.id = id;
        this.uuid = uuid;

       /*
        El grupoDatos es proporcionado por el controller
        desde la informacion obtenida del JWT.
        */

        this.grupoDatos = Number(
         grupoDatos);

        /*
        Se permite recibir fincaId o idFinca para mantener compatibilidad
        con diferentes nombres enviados desde el frontend.
        */
        if (fincaId !== undefined && fincaId !== null && String(fincaId).trim() !== "") {
            this.fincaId = Number(fincaId);
        } else {
            this.fincaId = Number(idFinca);
        }

        /*
        Se permite recibir estanqueId o idEstanque para mantener compatibilidad
        con diferentes nombres enviados desde el frontend.
        */
        if (estanqueId !== undefined && estanqueId !== null && String(estanqueId).trim() !== "") {
            this.estanqueId = Number(estanqueId);
        } else {
            this.estanqueId = Number(idEstanque);
        }

        this.colaboradorId = normalizarNumeroOpcional(colaboradorId);

        if (tipoRegistro === undefined || tipoRegistro === null || String(tipoRegistro).trim() === "") {
            this.tipoRegistro = "parasitologia";
        } else {
            this.tipoRegistro = normalizarTexto(tipoRegistro);
        }

        this.fechaReporte = normalizarTexto(fechaReporte);
        this.responsable = normalizarTextoOpcional(responsable);
        this.parasito = normalizarTexto(parasito);
        this.camaronesMuestreados = Number(camaronesMuestreados);
        this.camaronesInfectados = Number(camaronesInfectados);
        this.porcentajeInfeccion = normalizarNumeroOpcional(porcentajeInfeccion);
        this.gradoInfeccion = normalizarTextoOpcional(gradoInfeccion);
        this.observaciones = normalizarTextoOpcional(observaciones);

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