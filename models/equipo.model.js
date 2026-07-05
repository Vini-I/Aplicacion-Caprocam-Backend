/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: equipo.model.js
Autor: Rodolfo Chaves
Fecha: 04/07/2026
Modulo: Equipo
Descripcion:
Capa de datos del modulo de equipos.
Por ahora trabaja con datos mock en memoria
para pruebas de rutas sin base de datos.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
IMPORTS
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/

let equipos = [
    {
        id: 1,
        codigo_interno: "EQ-001",
        descripcion: "Aireador principal",
        fecha_instalacion: "15/01/2026",
        tipo: "aireacion",
        estado: "activo",
        funcion_equipo: "Oxigenacion",
        fecha_creacion: "2026-01-15T09:00:00.000Z",
        fecha_actualizacion: "2026-01-15T09:00:00.000Z",
        deleted_at: null
    },
    {
        id: 2,
        codigo_interno: "EQ-002",
        descripcion: "Bomba secundaria",
        fecha_instalacion: "01/02/2026",
        tipo: "bombeo",
        estado: "mantenimiento",
        funcion_equipo: "Recirculacion",
        fecha_creacion: "2026-02-01T11:00:00.000Z",
        fecha_actualizacion: "2026-02-01T11:00:00.000Z",
        deleted_at: null
    }
];

let siguienteId = 3;

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////

Contiene las funciones exportables que interactuan
con datos mock del modulo.
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todos los equipos activos.

    Parametros:
    No posee.

    Retorna:
    - Lista de equipos encontrados.
    */
    return equipos
        .filter(equipo => equipo.deleted_at === null)
        .sort((a, b) => {
            const fechaA = Date.parse(a.fecha_creacion);
            const fechaB = Date.parse(b.fecha_creacion);
            return fechaB - fechaA;
        });
}

export function findById(id) {
    /*
    Descripcion:
    Obtiene un equipo por su ID.

    Parametros:
    - id: ID numerico del equipo.

    Retorna:
    - El objeto equipo si existe, null si no.
    */
    const idBuscado = Number(id);
    const equipo = equipos.find(
        item => item.id === idBuscado && item.deleted_at === null
    );

    if (!equipo) {
        return null;
    }

    return equipo;
}

export function findByCodigoInterno(codigoInterno) {
    /*
    Descripcion:
    Busca un equipo por su codigo interno.
    Usado para validar unicidad antes de crear.

    Parametros:
    - codigoInterno: String con el codigo a buscar.

    Retorna:
    - El objeto equipo si existe, null si no.
    */
    const equipo = equipos.find(
        item => item.codigo_interno === codigoInterno && item.deleted_at === null
    );

    if (!equipo) {
        return null;
    }

    return {
        id: equipo.id,
        codigo_interno: equipo.codigo_interno
    };
}

export function create(dto) {
    /*
    Descripcion:
    Crea un nuevo equipo en el mock en memoria.

    Parametros:
    - dto: Objeto EquipoDTO con los datos normalizados.

    Retorna:
    - El equipo recien creado con su ID asignado.
    */
    const ahora = new Date().toISOString();

    const nuevo = {
        id: siguienteId,
        codigo_interno: dto.codigoInterno,
        descripcion: dto.descripcion,
        fecha_instalacion: dto.fechaInstalacion,
        tipo: dto.tipo,
        estado: dto.estado,
        funcion_equipo: dto.funcionEquipo,
        fecha_creacion: ahora,
        fecha_actualizacion: ahora,
        deleted_at: null
    };

    equipos.push(nuevo);
    siguienteId = siguienteId + 1;

    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza un equipo existente en el mock.

    Parametros:
    - id:  ID numerico del equipo a actualizar.
    - dto: Objeto EquipoDTO con los datos normalizados.

    Retorna:
    - El equipo actualizado, o null si no existe.
    */
    const idBuscado = Number(id);
    const index = equipos.findIndex(
        item => item.id === idBuscado && item.deleted_at === null
    );

    if (index === -1) {
        return null;
    }

    const actual = equipos[index];

    equipos[index] = {
        ...actual,
        codigo_interno: dto.codigoInterno,
        descripcion: dto.descripcion,
        fecha_instalacion: dto.fechaInstalacion,
        tipo: dto.tipo,
        estado: dto.estado,
        funcion_equipo: dto.funcionEquipo,
        fecha_actualizacion: new Date().toISOString()
    };

    return equipos[index];
}

export function remove(id) {
    /*
    Descripcion:
    Realiza un borrado logico del equipo en el mock.

    Parametros:
    - id: ID numerico del equipo a eliminar.

    Retorna:
    - El equipo eliminado, o null si no existe.
    */
    const idBuscado = Number(id);
    const index = equipos.findIndex(
        item => item.id === idBuscado && item.deleted_at === null
    );

    if (index === -1) {
        return null;
    }

    const eliminado = {
        ...equipos[index],
        deleted_at: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
    };

    equipos[index] = eliminado;

    return eliminado;
}