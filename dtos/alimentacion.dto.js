/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: alimentacion.dto.js
Autor: Felipe Salas
Fecha: 06/07/2026
Modulo: Alimentacion
Descripcion:
Archivo de transferencia de datos para alimentacion.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUMS
//////////////////////////////////////////////////////////

Valores permitidos para los campos clave del modulo.
Reflejan las opciones del frontend. La base de datos
permite cualquier texto (VARCHAR), pero el negocio
restringe a estas opciones.
*/

export const MetodoAlimentacion = Object.freeze({
    PLATO: "Plato",
    BOLEO: "Boleo"
});

export const PresentacionAlimento = Object.freeze({
    POLVO: "Polvo",
    GRANULADO: "Granulado"
});

export const HoraAlimentacion = Object.freeze({
    MANANA: "7:00 AM",
    TARDE: "3:00 PM"
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de alimentacion.
Normaliza los campos recibidos desde el body antes de que sean
procesados por el controller y el model.
*/

export class AlimentacionDTO {
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
        idProveedor,
        proveedorId,
        idProducto,
        productoId,
        fecha,
        hora,
        metodo,
        cantidadKg,
        presentacion,
        proveedor,
        tipoAlimento,
        observaciones,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version
    }) {
        /*
        Descripcion:
        Construye un objeto AlimentacionDTO con los datos recibidos.

        Parametros:
        - id: Identificador numerico interno del registro.
        - uuid: Identificador global usado para futura sincronizacion offline.
        - grupoDatos: Codigo del grupo de datos al que pertenece el registro.
        - idFinca / fincaId / finca: Identificador de la finca (se aceptan alias).
        - idEstanque / estanqueId / estanque: Identificador del estanque (se aceptan alias).
        - idProveedor / proveedorId: Identificador del proveedor (opcional).
        - idProducto / productoId: Identificador del producto (opcional).
        - fecha: Fecha de la alimentacion.
        - hora: Hora de alimentacion.
        - metodo: Metodo de alimentacion.
        - cantidadKg: Cantidad suministrada en kg.
        - presentacion: Presentacion del alimento.
        - proveedor: Nombre del proveedor (texto libre).
        - tipoAlimento: Tipo de alimento.
        - observaciones: Notas del registro.
        - activo: Estado logico del registro.
        - fechaCreacion: Fecha de creacion del registro.
        - fechaActualizacion: Fecha de ultima actualizacion.
        - deletedAt: Fecha de borrado logico.
        - version: Version del registro para control de cambios.

        Retorna:
        - Objeto AlimentacionDTO con campos normalizados.
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

        this.idProveedor = normalizarNumeroOpcional(idProveedor !== undefined ? idProveedor : proveedorId);
        this.idProducto = normalizarNumeroOpcional(idProducto !== undefined ? idProducto : productoId);

        this.fecha = normalizarTextoOpcional(fecha);
        this.hora = normalizarTextoOpcional(hora);
        this.metodo = normalizarTextoOpcional(metodo);
        this.cantidadKg = Number(cantidadKg);
        this.presentacion = normalizarTextoOpcional(presentacion);
        this.proveedor = normalizarTextoOpcional(proveedor);
        this.tipoAlimento = normalizarTextoOpcional(tipoAlimento);
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