/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.dto.js
Autor: Rodolfo Chaves
Fecha: 20/07/2026
Modulo: Equipo
Descripcion:
DTO y constantes de dominio para el modulo de equipos.
Actualizado para reflejar la nueva estructura de la
tabla equipos (identificador, nombre_equipo, tipo_equipo,
estado_operativo, estado, estanque_id, horas_mantenimiento
y horas_actuales).
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////

Define los valores permitidos para tipo_equipo,
estado_operativo y estado. Estos valores deben coincidir
exactamente con los ENUM definidos en 001_schema.sql.
*/

export const TipoEquipo = Object.freeze({
    AIREACION: "Aireacion",
    BOMBEO: "Bombeo",
    ALIMENTACION: "Alimentacion",
    MONITOREO: "Monitoreo",
    MANTENIMIENTO: "Mantenimiento",
    OTRO: "Otro"
});

export const EstadoOperativoEquipo = Object.freeze({
    ACTIVO: "Activo",
    INACTIVO: "Inactivo",
    MANTENIMIENTO: "Mantenimiento"
});

export const EstadoEquipo = Object.freeze({
    ENCENDIDO: "Encendido",
    APAGADO: "Apagado"
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de equipos.

Mapeo frontend (camelCase) -> columna MySQL:
  grupoDatos          -> grupo_datos     (viene del JWT)
  identificador       -> identificador
  nombreEquipo        -> nombre_equipo
  descripcion         -> descripcion
  tipoEquipo          -> tipo_equipo
  fechaInstalacion    -> fecha_instalacion (DATE)
  funcionEquipo       -> funcion_equipo
  estanqueId          -> estanque_id     (opcional)
  horasMantenimiento  -> horas_mantenimiento (opcional)
  horasActuales       -> horas_actuales  (opcional, default 0)
  estadoOperativo     -> estado_operativo
  estado              -> estado          (Encendido/Apagado)
*/

export class EquipoDTO {
    constructor({
        id,
        uuid,
        grupoDatos,
        identificador,
        nombreEquipo,
        descripcion,
        tipoEquipo,
        fechaInstalacion,
        funcionEquipo,
        estanqueId,
        horasMantenimiento,
        horasActuales,
        estadoOperativo,
        estado,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version
    }) {
        /*
        Descripcion:
        Construye un objeto EquipoDTO con los datos
        normalizados.

        El grupoDatos debe ser enviado por el controller
        desde la informacion obtenida del JWT, nunca desde
        el body del cliente.
        */

        this.id = id;
        this.uuid = uuid;
        this.grupoDatos = Number(grupoDatos);

        this.identificador = normalizarTexto(identificador);
        this.nombreEquipo = normalizarTexto(nombreEquipo);
        this.descripcion = normalizarTexto(descripcion);
        this.tipoEquipo = normalizarTexto(tipoEquipo);
        this.fechaInstalacion = normalizarTexto(fechaInstalacion);
        this.funcionEquipo = normalizarTexto(funcionEquipo);

        this.estanqueId = normalizarNumeroOpcional(estanqueId);
        this.horasMantenimiento = normalizarNumeroOpcional(horasMantenimiento);

        if (
            horasActuales === undefined ||
            horasActuales === null ||
            String(horasActuales).trim() === ""
        ) {
            this.horasActuales = 0;
        } else {
            this.horasActuales = Number(horasActuales);
        }

        this.estadoOperativo = normalizarTexto(estadoOperativo);

        if (estado === undefined || estado === null || String(estado).trim() === "") {
            this.estado = EstadoEquipo.APAGADO;
        } else {
            this.estado = normalizarTexto(estado);
        }

        this.activo = activo;
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

Funciones internas de normalizacion.
La clase EquipoDTO depende de estas funciones para trabajar.
*/

function normalizarTexto(valor) {
    /*
    Descripcion:
    Convierte un valor a texto y elimina espacios al inicio
    y al final. Retorna null si el valor no existe.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Texto normalizado o null.
    */

    if (valor === undefined || valor === null) {
        return null;
    }

    const texto = String(valor).trim();

    return texto.length === 0 ? null : texto;
}

function normalizarNumeroOpcional(valor) {
    /*
    Descripcion:
    Normaliza un campo numerico opcional.

    Parametros:
    - valor: Valor recibido.

    Retorna:
    - Numero o null si no existe.
    */

    if (valor === undefined || valor === null || String(valor).trim() === "") {
        return null;
    }

    return Number(valor);
}