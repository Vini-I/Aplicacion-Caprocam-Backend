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
IMPORTS
//////////////////////////////////////////////////////////

Servicios (formulas del muestreo con atarraya)
*/

import { calcularResultados, normalizarTiros } from "../services/densidadPoblacional.service.js";

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

IMPORTANTE (valores calculados):
El DTO NO acepta del body los valores que son producto de una
formula: totalCamaronesMuestra, tirosAtarraya, areaMuestreada,
promedioPorTiro, densidad, poblacionEstimada y sobrevivencia. Todos
se derivan aqui del detalle de tiros usando calcularResultados() del
service.

sobrevivencia dejo de ser un campo digitado: aunque el cliente lo
mande en el body, se ignora. Es un dato oculto que se calcula solo
(poblacion estimada del conteo actual contra la poblacion sembrada
originalmente) y no se le pide al usuario ni se le muestra en el
formulario.

Antes el frontend mandaba "numeroCamarones", "tirosAtarraya",
"promedioPorTiro" y "densidad" ya calculados y el backend los
guardaba tal cual. Eso permitia guardar un promedio o una densidad
que no correspondian al conteo real (por error de la app, por una
version vieja del cliente, o por una peticion armada a mano). Ahora
el detalle tiro por tiro es el unico dato de entrada y todo lo
demas se calcula del lado del servidor.

El campo idColaborador desaparecio: la tabla densidad_poblacional
ya no tiene la columna colaborador_id. Quien hizo el registro queda
identificado por creado_por_usuario_id / creado_por_colaborador_id,
que salen del JWT.
*/

export class DensidadPoblacionalDTO {
    constructor(body, contexto = {}) {
        /*
        Descripcion:
        Construye un objeto DensidadPoblacionalDTO con los datos
        recibidos en el body de la peticion, mas el grupoDatos y
        creadoPorUsuarioId/creadoPorColaboradorId reales del usuario
        o colaborador autenticado, y con todos los valores derivados
        ya calculados.

        Parametros:
        - body: Campos recibidos en el body de la peticion (req.body).
            - id: Identificador numerico interno del registro.
            - uuid: Identificador global usado para futura sincronizacion offline.
            - idFinca / fincaId / finca: Identificador de la finca (se aceptan alias).
            - idEstanque / estanqueId / estanque: Identificador del estanque (se aceptan alias).
            - fecha: Fecha del conteo.
            - cantidadSiembra: Siembra de referencia, en larvas por m2.
            - areaEstanque: Area del estanque en HECTAREAS.
            - areaAtarraya: Area que cubre cada tiro de atarraya, en m2.
            - tiros / detalleTiros: Detalle de camarones contados por tiro.
            - sobrevivencia: Porcentaje de sobrevivencia.
            - notasConteo: Observaciones del conteo.
            - activo: Estado logico del registro.
        - contexto: Datos de confianza que arma el controller a partir
          del JWT (via obtenerContextoPeticion), nunca del body.
            - grupoDatos: Grupo de datos del usuario/colaborador autenticado.
            - creadoPorUsuarioId: Id del usuario web autenticado (null si fue un colaborador).
            - creadoPorColaboradorId: Id del colaborador APK autenticado (null si fue un usuario web).

        Retorna:
        - Objeto DensidadPoblacionalDTO con campos normalizados y calculados.
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
            fecha,
            cantidadSiembra,
            areaEstanque,
            areaAtarraya,
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
        this.areaAtarraya = normalizarNumeroOpcional(areaAtarraya);
        this.notasConteo = normalizarTextoOpcional(notasConteo);

        /*
        Detalle tiro por tiro. Es el unico dato de conteo que se
        acepta del cliente; el model lo guarda en la tabla
        densidad_detalle_tiros.
        */
        const tiros = normalizarTiros(body) || [];

        this.tiros = tiros.map((tiro) => ({
            numeroTiro: tiro.numeroTiro,
            cantidadCamarones: Number(tiro.cantidadCamarones)
        }));

        /*
        Valores derivados. Se calculan aqui, nunca se leen del body.
        */
        const resultados = calcularResultados({
            tiros: this.tiros,
            areaAtarraya: this.areaAtarraya,
            areaEstanque: this.areaEstanque,
            cantidadSiembra: this.cantidadSiembra
        });

        this.tirosAtarraya = resultados.tirosAtarraya;
        this.totalCamaronesMuestra = resultados.totalCamaronesMuestra;
        this.areaMuestreada = resultados.areaMuestreada;
        this.promedioPorTiro = resultados.promedioPorTiro;
        this.densidad = resultados.densidad;
        this.poblacionEstimada = resultados.poblacionEstimada;
        this.sobrevivencia = resultados.sobrevivencia;

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
    Normaliza un campo numerico que es obligatorio (grupoDatos).
    A diferencia de normalizarNumeroOpcional, aqui un valor vacio o
    invalido se deja explicitamente en null para que el llamador
    (model) pueda rechazar la operacion en vez de inventar un valor
    por defecto.

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

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
        return null;
    }

    return numero;
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