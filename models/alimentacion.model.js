/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo:     alimentacion.model.js
Autor:       Felipe Salas
Fecha:       29/06/2026
Modulo:      Alimentacion
Descripcion:
Capa de acceso a datos del modulo de alimentacion.
Por ahora trabaja con datos mock en memoria que simulan
la base de datos. Cuando se integre una DB real, solo
este archivo cambia — el resto del modulo no se toca.
//////////////////////////////////////////////////////////
*/
 
/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
 
Simulacro de base de datos con registros representativos.
Cubre todos los campos que maneja el frontend del modulo:
finca, estanque, hora, metodo, cantidad, tipo, proveedor.
*/
 
let registros = [
    {
        id:           1,
        finca:        'Finca Norte',
        estanque:     'Estanque A',
        fecha:        '28/06/2026',
        hora:         '7:00 AM',
        metodo:       'Boleo',
        cantidadKg:   10,
        presentacion: 'Granulado',
        proveedor:    'Biomar',
        tipoAlimento: 'Balanceado engorde 38%',
        observaciones: 'Sin novedad.',
    },
    {
        id:           2,
        finca:        'Finca Sur',
        estanque:     'Estanque B',
        fecha:        '29/06/2026',
        hora:         '3:00 PM',
        metodo:       'Plato',
        cantidadKg:   8,
        presentacion: 'Polvo',
        proveedor:    'Biomar',
        tipoAlimento: 'Balanceado iniciador 35%',
        observaciones: '',
    },
];
 
/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
 
Operaciones CRUD sobre la fuente de datos.
El controlador nunca accede a estos datos directamente;
siempre pasa por estas funciones.
*/
 
export function findAll() {
    /*
    Descripcion:
    Devuelve todos los registros de alimentacion.
 
    Parametros:
    No posee.
 
    Retorna:
    - Array con todos los registros almacenados.
    */
    return registros;
}
 
export function findById(id) {
    /*
    Descripcion:
    Busca un registro de alimentacion por su ID.
 
    Parametros:
    - id: Identificador del registro a buscar.
 
    Retorna:
    - El objeto del registro si existe, null si no.
    */
    return registros.find(r => r.id === Number(id)) || null;
}
 
export function create(datos) {
    /*
    Descripcion:
    Inserta un nuevo registro de alimentacion.
    Asigna automaticamente el ID correlativo.
 
    Parametros:
    - datos: Objeto con los campos del nuevo registro.
 
    Retorna:
    - El registro recien creado con su ID asignado.
    */
    const nuevo = { ...datos, id: registros.length + 1 };
    registros.push(nuevo);
    return nuevo;
}
 
export function update(id, datos) {
    /*
    Descripcion:
    Actualiza un registro existente fusionando los
    nuevos datos sobre los campos actuales.
 
    Parametros:
    - id:    ID del registro a actualizar.
    - datos: Objeto con los campos actualizados.
 
    Retorna:
    - El registro actualizado, o null si no existe.
    */
    const index = registros.findIndex(r => r.id === Number(id));
    if (index === -1) return null;
 
    registros[index] = { ...registros[index], ...datos };
    return registros[index];
}
 
export function remove(id) {
    /*
    Descripcion:
    Elimina un registro de alimentacion por su ID.
 
    Parametros:
    - id: ID del registro a eliminar.
 
    Retorna:
    - El registro eliminado, o null si no existe.
    */
    const index = registros.findIndex(r => r.id === Number(id));
    if (index === -1) return null;
 
    const eliminado = registros[index];
    registros.splice(index, 1);
    return eliminado;
}