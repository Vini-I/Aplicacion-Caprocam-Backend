/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.dto.js
Autor: Eduard Salas
Fecha: 6/07/2026
Modulo: Densidad Poblacional
Descripcion:
Archivo de transferencia de datos para densidad poblacional.
Transforma y normaliza los datos recibidos antes de enviarlos
al modelo o devolverlos como respuesta.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de densidad poblacional.
Normaliza los campos recibidos desde el body antes de que sean
procesados por el controller y el model.
*/

export class DensidadPoblacionalDTO {
    constructor({
        id,
        uuid,
        grupoDatos,
        idFinca,
        fincaId,
        finca,
        idEstanque,
        estanqueId,
        estanque,
        fecha,
        cantidadSiembra,
        areaEstanque,
        numeroCamarones,
        tirosAtarraya,
        areaAtarraya,
        promedioPorTiro,
        sobrevivencia,
        densidad,
        notasConteo,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version
    }) {
        /*
        Descripcion:
        Construye un objeto DensidadPoblacionalDTO con los datos recibidos.

        Parametros:
        - id: Identificador numerico interno del registro.
        - uuid: Identificador global usado para futura sincronizacion offline.
        - grupoDatos: Codigo del grupo de datos al que pertenece el registro.
        - idFinca / fincaId / finca: Identificador de la finca (se aceptan alias).
        - idEstanque / estanqueId / estanque: Identificador del estanque (se aceptan alias).
        - fecha: Fecha del conteo.
        - cantidadSiembra: Cantidad sembrada.
        - areaEstanque: Area del estanque.
        - numeroCamarones: Total de camarones contados.
        - tirosAtarraya: Cantidad de tiros de atarraya.
        - areaAtarraya: Area cubierta por la atarraya.
        - promedioPorTiro: Promedio de camarones por tiro.
        - sobrevivencia: Porcentaje de sobrevivencia.
        - densidad: Densidad poblacional calculada.
        - notasConteo: Observaciones del conteo.
        - activo: Estado logico del registro.
        - fechaCreacion: Fecha de creacion del registro.
        - fechaActualizacion: Fecha de ultima actualizacion.
        - deletedAt: Fecha de borrado logico.
        - version: Version del registro para control de cambios.

        Retorna:
        - Objeto DensidadPoblacionalDTO con campos normalizados.
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
        Se permite recibir idFinca, fincaId o finca para mantener
        compatibilidad con diferentes nombres enviados desde el frontend.
        */
        if (idFinca !== undefined && idFinca !== null && String(idFinca).trim() !== "") {
            this.idFinca = Number(idFinca);
        } else if (fincaId !== undefined && fincaId !== null && String(fincaId).trim() !== "") {
            this.idFinca = Number(fincaId);
        } else {
            this.idFinca = Number(finca);
        }

        /*
        Se permite recibir idEstanque, estanqueId o estanque para mantener
        compatibilidad con diferentes nombres enviados desde el frontend.
        */
        if (idEstanque !== undefined && idEstanque !== null && String(idEstanque).trim() !== "") {
            this.idEstanque = Number(idEstanque);
        } else if (estanqueId !== undefined && estanqueId !== null && String(estanqueId).trim() !== "") {
            this.idEstanque = Number(estanqueId);
        } else {
            this.idEstanque = Number(estanque);
        }

        this.fecha = normalizarTextoOpcional(fecha);
        this.cantidadSiembra = normalizarNumeroOpcional(cantidadSiembra);
        this.areaEstanque = normalizarNumeroOpcional(areaEstanque);
        this.numeroCamarones = normalizarNumeroOpcional(numeroCamarones);
        this.tirosAtarraya = normalizarNumeroOpcional(tirosAtarraya);
        this.areaAtarraya = normalizarNumeroOpcional(areaAtarraya);
        this.promedioPorTiro = normalizarNumeroOpcional(promedioPorTiro);
        this.sobrevivencia = normalizarNumeroOpcional(sobrevivencia);
        this.densidad = normalizarNumeroOpcional(densidad);
        this.notasConteo = normalizarTextoOpcional(notasConteo);

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