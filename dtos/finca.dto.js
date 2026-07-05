/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: Finca.dto.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Archivo de transferencia de datos para finca.
Es un caparazon para almacenar los datos requeridos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////

Caparazon de datos para el modulo de finca.
*/

export class FincaDTO {
    /*
    Descripcion:
    Caparazon de datos para el modulo de finca.

    Parametros:
    - id: ID de la finca.
    - idCBO: ID del CBO asociado a la finca.
    - nombreFinca: Nombre de la finca. 
    - provincia: Provincia donde se encuentra la finca.
    - canton: Cantón donde se encuentra la finca.
    - distrito: Distrito donde se encuentra la finca.
    - otrasSenas: Otras señas de la finca.
    - propietarioResponsable: Nombre del propietario o responsable de la finca.
    - telefono: Teléfono de contacto del propietario o responsable.
    - areaTotal: Área total de la finca en hectáreas.
    - espejosAgua: Área de espejos de agua en la finca en hectáreas.

    Retorna:
    - Un objeto de tipo FincaDTO con los datos proporcionados.
    */
    constructor(
        id,
        idCBO,
        nombreFinca,
        provincia,
        canton,
        distrito,
        otrasSenas,
        propietarioResponsable,
        telefono,
        areaTotal,
        espejosAgua
    ) {
        this.id = id || null;
        this.idCBO = idCBO;
        this.nombreFinca = nombreFinca;
        this.provincia = provincia;
        this.canton = canton;
        this.distrito = distrito;
        this.otrasSenas = otrasSenas;
        this.propietarioResponsable = propietarioResponsable;
        this.telefono = telefono;
        this.areaTotal = areaTotal;
        this.espejosAgua = espejosAgua;
    }
}