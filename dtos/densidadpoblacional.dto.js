/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: densidadPoblacional.dto.js
Autor: Eduard Salas
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

IMPORTANTE (seguridad):
grupoDatos, creadoPorUsuarioId y creadoPorColaboradorId NO se
reciben del body. Se reciben en un segundo parametro "contexto",
que el controller arma siempre a partir de obtenerContextoPeticion
(req.user / req.colaborador, el payload ya verificado del JWT). Si
se aceptaran desde el body, cualquier cliente podria mandar esos
campos falsos y el backend terminaria guardando datos en el grupo
equivocado, o atribuyendo el registro a otro usuario/colaborador
que no lo creo. Por eso el constructor ya ni siquiera destructura
esos campos del body.

idColaborador (quien realizo el conteo/medicion, distinto de quien
autentico la peticion) SI se acepta del body, de forma opcional:
si no viene, el model asume por defecto el colaborador que
autentico la peticion (cuando fue registrado desde la APK).
*/

export class DensidadPoblacionalDTO {
    constructor(body, contexto = {}) {
        /*
        Descripcion:
        Construye un objeto DensidadPoblacionalDTO con los datos
        recibidos en el body de la peticion, mas el grupoDatos y
        creadoPorUsuarioId/creadoPorColaboradorId reales del usuario
        o colaborador autenticado.

        Parametros:
        - body: Campos recibidos en el body de la peticion (req.body).
            - id: Identificador numerico interno del registro.
            - uuid: Identificador global usado para futura sincronizacion offline.
            - idFinca / fincaId / finca: Identificador de la finca (se aceptan alias).
            - idEstanque / estanqueId / estanque: Identificador del estanque (se aceptan alias).
            - idColaborador / colaboradorId: Colaborador que realizo el conteo (opcional; se aceptan alias).
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
        - contexto: Datos de confianza que arma el controller a partir
          del JWT (via obtenerContextoPeticion), nunca del body.
            - grupoDatos: Grupo de datos del usuario/colaborador autenticado.
            - creadoPorUsuarioId: Id del usuario web autenticado (null si fue un colaborador).
            - creadoPorColaboradorId: Id del colaborador APK autenticado (null si fue un usuario web).

        Retorna:
        - Objeto DensidadPoblacionalDTO con campos normalizados.
        */

        const {
            id,
            uuid,
            idFinca,
            fincaId,
            finca,
            idEstanque,
            estanqueId,
            estanque,
            idColaborador,
            colaboradorId,
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
        } = body || {};

        this.id = id;
        this.uuid = uuid;

        /*
        grupoDatos SIEMPRE viene del contexto (JWT), nunca del body.
        Si por alguna razon llega vacio o invalido, se guarda null:
        el model rechazara la insercion en vez de asumir un grupo
        por defecto (evita que un registro quede huerfano o en el
        grupo equivocado).
        */
        this.grupoDatos = normalizarNumeroObligatorio(contexto.grupoDatos);

        /*
        creadoPorUsuarioId / creadoPorColaboradorId (quien hizo el
        registro) SIEMPRE vienen del contexto (JWT), nunca del body.
        Exactamente uno de los dos identifica a quien realizo la
        peticion (usuario web o colaborador APK); el otro queda null.
        */
        this.creadoPorUsuarioId = contexto.creadoPorUsuarioId ?? null;
        this.creadoPorColaboradorId = contexto.creadoPorColaboradorId ?? null;

        /*
        idColaborador (quien realizo el conteo) SI se acepta del
        body, de forma opcional y con alias.
        */
        this.idColaborador = normalizarNumeroOpcional(idColaborador !== undefined ? idColaborador : colaboradorId);

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

function normalizarNumeroObligatorio(valor) {
    /*
    Descripcion:
    Normaliza un campo numerico que es obligatorio (grupoDatos,
    usuarioId). A diferencia de normalizarNumeroOpcional, aqui un
    valor vacio o invalido se deja explicitamente en null para que
    el llamador (model) pueda rechazar la operacion en vez de
    inventar un valor por defecto.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero normalizado.
    - null si el valor no existe, esta vacio o no es numerico.
    */
    if (valor === undefined || valor === null) {
        return null;
    }

    if (String(valor).trim() === "") {
        return null;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return null;
    }

    return numero;
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