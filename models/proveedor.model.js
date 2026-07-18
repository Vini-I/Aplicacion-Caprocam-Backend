/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.model.js
Autor: Joan
Fecha: 29/06/2026
Modulo: Proveedores
Descripcion:
Capa de datos del modulo de proveedores.
Por ahora trabaja con datos mock en memoria.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
*/

let proveedores = [
    {
        id: 1,
        nombre: "Alimentos del Pacífico",
        tipoProducto: "alimento",
        telefono: "+506 2233-4455",
        correo: "alimentos@pacifico.com",
        direccion: "Puntarenas, Costa Rica",
        notas: "Proveedor principal de camarina",
        activo: true
    },
    {
        id: 2,
        nombre: "FarmaMar",
        tipoProducto: "antibiotico",
        telefono: "+506 2566-7788",
        correo: "contacto@farmamar.com",
        direccion: "San José, Costa Rica",
        notes: "Antibióticos y probióticos aprobados",
        activo: true
    },
    {
        id: 3,
        nombre: "Fertilizantes del Sur",
        tipoProducto: "fertilizantes",
        telefono: "+506 2788-9900",
        correo: "ventas@fertisur.com",
        direccion: "Limón, Costa Rica",
        notas: "Fertilizantes orgánicos",
        activo: true
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
    Obtiene todos los proveedores que esten activos.

    Parametros:
    No posee.

    Retorna:
    - Lista de proveedores activos.
    */
    return proveedores.filter(p => p.activo === true);
}

export function findById(id) {
    /*
    Descripcion:
    Busca un proveedor activo por su ID.

    Parametros:
    - id: ID del proveedor a buscar.

    Retorna:
    - Proveedor encontrado o null.
    */
    const proveedor = proveedores.find(p => p.id === Number(id));
    if (!proveedor || proveedor.activo === false) {
        return null;
    }
    return proveedor;
}

export function findByName(nombre) {
    /*
    Descripcion:
    Busca un proveedor activo por su nombre exacto (case-insensitive).

    Parametros:
    - nombre: Nombre a buscar.

    Retorna:
    - Proveedor encontrado o null.
    */
    const nombreNormalizado = nombre.toLowerCase().trim();
    return proveedores.find(p => 
        p.nombre.toLowerCase().trim() === nombreNormalizado && p.activo === true
    ) || null;
}

export function findByNameIgnorandoId(nombre, idIgnorado) {
    /*
    Descripcion:
    Busca un proveedor activo por nombre omitiendo un ID especifico.

    Parametros:
    - nombre: Nombre a buscar.
    - idIgnorado: ID que se omitira de la busqueda.

    Retorna:
    - Proveedor duplicado encontrado o null.
    */
    const nombreNormalizado = nombre.toLowerCase().trim();
    const numeroIgnorado = Number(idIgnorado);
    return proveedores.find(p => 
        p.nombre.toLowerCase().trim() === nombreNormalizado && 
        p.activo === true && 
        p.id !== numeroIgnorado
    ) || null;
}

export function create(dto) {
    /*
    Descripcion:
    Crea un nuevo proveedor en la lista en memoria.

    Parametros:
    - dto: Objeto con los datos de entrada del proveedor.

    Retorna:
    - Proveedor creado con su ID.
    */
    const nuevo = {
        ...dto,
        id: proveedores.length + 1,
        activo: true
    };
    proveedores.push(nuevo);
    return nuevo;
}

export function update(id, dto) {
    /*
    Descripcion:
    Actualiza los datos de un proveedor activo por su ID.

    Parametros:
    - id: ID del proveedor.
    - dto: Nuevos datos a actualizar.

    Retorna:
    - Proveedor actualizado o null.
    */
    const index = proveedores.findIndex(p => p.id === Number(id));
    if (index === -1 || proveedores[index].activo === false) {
        return null;
    }
    proveedores[index] = {
        ...proveedores[index],
        ...dto
    };
    return proveedores[index];
}

export function remove(id) {
    /*
    Descripcion:
    Realiza un borrado logico del proveedor asignando activo = false.

    Parametros:
    - id: ID del proveedor a eliminar.

    Retorna:
    - Proveedor desactivado o null.
    */
    const index = proveedores.findIndex(p => p.id === Number(id));
    if (index === -1 || proveedores[index].activo === false) {
        return null;
    }
    proveedores[index].activo = false;
    return proveedores[index];
}