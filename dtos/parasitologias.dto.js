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
Define los grados de infeccion calculados.
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
- Los campos de muestreo pueden ser opcionales.

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
        this.id = id;
        this.uuid = uuid;
        this.grupoDatos = Number(
            grupoDatos
        );

        if (
            fincaId !== undefined &&
            fincaId !== null &&
            String(fincaId).trim() !== ""
        ) {
            this.fincaId = Number(
                fincaId
            );
        } else {
            this.fincaId = Number(
                idFinca
            );
        }

        if (
            estanqueId !== undefined &&
            estanqueId !== null &&
            String(estanqueId).trim() !== ""
        ) {
            this.estanqueId = Number(
                estanqueId
            );
        } else {
            this.estanqueId = Number(
                idEstanque
            );
        }

        this.creadoPorUsuarioId =
            normalizarNumeroOpcional(
                creadoPorUsuarioId
            );

        this.creadoPorColaboradorId =
            normalizarNumeroOpcional(
                creadoPorColaboradorId
            );

        if (
            tipoRegistro === undefined ||
            tipoRegistro === null ||
            String(tipoRegistro).trim() === ""
        ) {
            this.tipoRegistro =
                "parasitologia";
        } else {
            this.tipoRegistro =
                normalizarTexto(
                    tipoRegistro
                );
        }

        this.fechaReporte =
            normalizarTexto(
                fechaReporte
            );

        this.responsable =
            normalizarTextoOpcional(
                responsable
            );

        this.parasito =
            normalizarTexto(
                parasito
            );

        this.camaronesMuestreados =
            normalizarNumeroOpcional(
                camaronesMuestreados
            );

        this.camaronesInfectados =
            normalizarNumeroOpcional(
                camaronesInfectados
            );

        this.porcentajeInfeccion =
            normalizarNumeroOpcional(
                porcentajeInfeccion
            );

        this.gradoInfeccion =
            normalizarTextoOpcional(
                gradoInfeccion
            );

        this.observaciones =
            normalizarTextoOpcional(
                observaciones
            );

        if (
            activo === undefined ||
            activo === null
        ) {
            this.activo = true;
        } else {
            this.activo =
                normalizarBooleano(
                    activo
                );
        }

        this.fechaCreacion =
            fechaCreacion;

        this.fechaActualizacion =
            fechaActualizacion;

        this.deletedAt =
            deletedAt;

        this.version =
            version;
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
    return String(
        valor
    ).trim();
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

    return String(
        valor
    ).trim();
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

    return Number(
        valor
    );
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
    if (
        valor === true ||
        valor === "true" ||
        valor === "Si" ||
        valor === "si" ||
        valor === 1 ||
        valor === "1"
    ) {
        return true;
    }

    return false;
}