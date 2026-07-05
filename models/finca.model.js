/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: mantFinca.model.js
Autor: Greivin Arguedas
Fecha: 04/07/2026
Modulo: Finca
Descripcion:
Capa de datos del modulo de finca.
Por ahora trabaja con datos mock.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

import { FincaDTO } from "../dtos/finca.dto.js";

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/

let fincas = [
    {
        id: "FIN001",
        idCBO: "CBO001",
        nombreFinca: "Finca La Esperanza",
        provincia: "Puntarenas",
        canton: "Golfito",
        distrito: "Guaycará",
        otrasSenas: "300 metros norte de la escuela",
        propietarioResponsable: "Juan Pérez",
        telefono: "88888888",
        areaTotal: 25.5,
        espejosAgua: 18.2
    },
    {
        id: "FIN002",
        idCBO: "CBO002",
        nombreFinca: "Finca El Oasis",
        provincia: "Guanacaste",
        canton: "Nicoya",
        distrito: "Mansión",
        otrasSenas: "Frente al salón comunal",
        propietarioResponsable: "María Rodríguez",
        telefono: "87777777",
        areaTotal: 30,
        espejosAgua: 20
    }
];

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todos los registros de fincas.

    Parametros:
    - Ninguno

    Retorna:
    - Un arreglo con todos los registros de fincas.
    */
    return fincas;
}

export function findByIdCBO(idCBO) {
    /*
    Descripcion:
    Obtiene un registro de finca por su ID CBO.

    Parametros:
    - idCBO: ID CBO de la finca a buscar.

    Retorna:
    - El registro de finca correspondiente al ID CBO proporcionado, o null si no se encuentra.
    */
    return fincas.find(f => f.idCBO === idCBO) || null;
}

export function findById(id) {
    return findByIdCBO(id);
}

export function create(dto) {
    /*
    Descripcion:
    Crea un nuevo registro de finca.

    Parametros:
    - dto: Objeto con los datos de la finca a crear.    

    Retorna:
    - El registro de finca creado.
    */
    const nuevaFinca = {
        id: dto.id,
        idCBO: dto.idCBO,
        nombreFinca: dto.nombreFinca,
        provincia: dto.provincia,
        canton: dto.canton,
        distrito: dto.distrito,
        otrasSenas: dto.otrasSenas,
        propietarioResponsable: dto.propietarioResponsable,
        telefono: dto.telefono,
        areaTotal: dto.areaTotal,
        espejosAgua: dto.espejosAgua
    };

    fincas.push(nuevaFinca);

    return nuevaFinca;
}

export function update(idCBO, dto) {
    /*
    Descripcion:
    Actualiza un registro de finca existente.

    Parametros:
    - idCBO: ID CBO de la finca a actualizar.
    - dto: Objeto con los datos de la finca a actualizar.

    Retorna:
    - El registro de finca actualizado, o null si no se encuentra.
    */
    const index = fincas.findIndex(f => f.idCBO === idCBO);
    if (index === -1) return null;
    fincas[index] = {
        ...fincas[index],
        idCBO: dto.idCBO || fincas[index].idCBO,
        nombreFinca: dto.nombreFinca || fincas[index].nombreFinca,
        provincia: dto.provincia || fincas[index].provincia,
        canton: dto.canton || fincas[index].canton,
        distrito: dto.distrito || fincas[index].distrito,
        otrasSenas: dto.otrasSenas || fincas[index].otrasSenas,
        propietarioResponsable: dto.propietarioResponsable || fincas[index].propietarioResponsable,
        telefono: dto.telefono || fincas[index].telefono,
        areaTotal: dto.areaTotal !== undefined ? dto.areaTotal : fincas[index].areaTotal,
        espejosAgua: dto.espejosAgua !== undefined ? dto.espejosAgua : fincas[index].espejosAgua
    };
    return fincas[index];
}

export function remove(idCBO) {
    /*
    Descripcion:
    Elimina un registro de finca existente.

    Parametros:
    - idCBO: ID CBO de la finca a eliminar.

    Retorna:
    - El registro de finca eliminado, o null si no se encuentra.
    */
    const index = fincas.findIndex(f => f.idCBO === idCBO);
    if (index === -1) return null;
    const eliminado = fincas.splice(index, 1);
    return eliminado[0];
}