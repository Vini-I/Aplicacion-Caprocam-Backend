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
        - id: Identificador unico                         (requerido)        
        - idFinca: Identificador de la finca              (requerido)
        - idEstanque: Identificador del estanque          (requerido)
        - idResponsable: Identificador del responsable    (requerido)
        - fecha: La fecha en la cual se realiza el raleo  (requerido)
        - porcentaje: Porcentaje del raleo                (requerido)
        - pesoEstimado: El peso estimado                  (requerido)
        - biomasaEstimado: Biomasa estimada               (requerido)
        - objetivo: El objetivo del raleo                 (requerido)
        - metodo: Mtodo de extraccion del raleo           (requerido)
        - notas: Apuntes adicionales del raleo            (opcional)  
        */
        id,
        idFinca,
        idEstanque,
        idResponsable,
        fecha,
        porcentaje,
        pesoEstimado,
        biomasaEstimado,
        objetivo,
        metodo,
        notas,
    }) {
        this.id              = id;
        this.idFinca         = Number(idFinca);
        this.idEstanque      = Number(idEstanque);
        this.idResponsable   = Number(idResponsable);
        this.fecha           = normalizarTexto(fecha);
        this.porcentaje      = Number(porcentaje);
        this.pesoEstimado    = normalizarTexto(pesoEstimado);
        this.biomasaEstimado = normalizarTexto(biomasaEstimado);
        this.objetivo        = normalizarTexto(objetivo);
        this.metodo          = normalizarTexto(metodo);
        this.notas           = normalizarTextoOpcional(notas);
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