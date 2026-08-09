/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: parasitologias.dto.js
Autor: Andres Gutierrez
Fecha: 30/07/2026
Modulo: Parasitologias
Descripcion:
DTO del modulo de parasitologias con auditoria dual para
usuario web y colaborador movil.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUMS
//////////////////////////////////////////////////////////
*/

/*
Descripcion:
Define los parasitos permitidos por el modulo.
*/

export const ParasitoParasitologia = Object.freeze({
    GREGARINA: "gregarina",
    NEMATODO: "nematodo",
    EPICOMENSAL: "epicomensal",
    PROTOZOARIO: "protozoario",
    OTRO: "otro"
});

/*
Descripcion:
Define los grados de infeccion permitidos por el modulo.
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
*/

/*
Descripcion:
Normaliza la estructura de un registro de parasitologia.

Instancia normalizada del DTO.

Parametros:

- La auditoria utiliza creadoPorUsuarioId y
  creadoPorColaboradorId.
- No utiliza colaboradorId.
- El grado de infeccion es obligatorio y se recibe
  seleccionado por el usuario.

Retorna:

- grupoDatos: Grupo obtenido desde el JWT.
- fincaId o idFinca: Identificador de la finca.
- estanqueId o idEstanque: Identificador del estanque.
- creadoPorUsuarioId: Usuario web creador o null.
- creadoPorColaboradorId: Colaborador movil creador o null.
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
        creadoPorUsuarioId,
        creadoPorColaboradorId,
        tipoRegistro,
        fechaReporte,
        responsable,
        parasito,
        gradoInfeccion,
        observaciones,
        activo,
        fechaCreacion,
        fechaActualizacion,
        deletedAt,
        version
    }) {
        this.id = id;
        this.uuid = uuid;

        this.grupoDatos = Number(grupoDatos);

        this.fincaId =
            fincaId !== undefined &&
            fincaId !== null &&
            String(fincaId).trim() !== ""
                ? Number(fincaId)
                : Number(idFinca);

        this.estanqueId =
            estanqueId !== undefined &&
            estanqueId !== null &&
            String(estanqueId).trim() !== ""
                ? Number(estanqueId)
                : Number(idEstanque);

        this.creadoPorUsuarioId = normalizarNumeroOpcional(creadoPorUsuarioId);
        this.creadoPorColaboradorId = normalizarNumeroOpcional(creadoPorColaboradorId);

        this.tipoRegistro =
            tipoRegistro === undefined ||
            tipoRegistro === null ||
            String(tipoRegistro).trim() === ""
                ? "parasitologia"
                : normalizarTexto(tipoRegistro);

        this.fechaReporte = normalizarTexto(fechaReporte);
        this.responsable = normalizarTextoOpcional(responsable);
        this.parasito = normalizarTexto(parasito);
        this.gradoInfeccion = normalizarTexto(gradoInfeccion).toLowerCase();
        this.observaciones = normalizarTextoOpcional(observaciones);

        this.activo =
            activo === undefined || activo === null
                ? true
                : normalizarBooleano(activo);

        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.deletedAt = deletedAt;
        this.version = version;
    }
}

/*
Descripcion:
Convierte un valor requerido a texto sin espacios externos.

Parametros:

- valor: Valor recibido.

Retorna:

- Texto normalizado.
*/

function normalizarTexto(valor) {
    return String(valor).trim();
}

/*
Descripcion:
Normaliza un texto opcional.

Parametros:

- valor: Valor recibido.

Retorna:

- Texto normalizado o null.
*/

function normalizarTextoOpcional(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    return String(valor).trim();
}

/*
Descripcion:
Normaliza un numero opcional.

Parametros:

- valor: Valor recibido.

Retorna:

- Numero o null.
*/

function normalizarNumeroOpcional(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ""
    ) {
        return null;
    }

    return Number(valor);
}

/*
Descripcion:
Convierte distintas representaciones afirmativas a booleano.

Parametros:

- valor: Valor recibido.

Retorna:

- true o false.
*/

function normalizarBooleano(valor) {
    return (
        valor === true ||
        valor === "true" ||
        valor === "Si" ||
        valor === "si" ||
        valor === 1 ||
        valor === "1"
    );
}