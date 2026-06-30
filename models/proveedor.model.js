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
Cuando haya DB, solo este archivo cambia.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
MOCK DATA
//////////////////////////////////////////////////////////
Datos de prueba que simulan la base de datos.
Cuando se conecte una DB real, esta seccion desaparece.
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
        notas: "Antibióticos y probióticos aprobados",
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
Contiene las funciones exportables que interactuan
con la fuente de datos del modulo de proveedores.
*/

export function findAll() {
    /*
    Descripcion:
    Obtiene todos los proveedores activos.

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
    - El proveedor encontrado, o null si no existe o esta inactivo.
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
    Busca un proveedor activo por su nombre.

    Parametros:
    - nombre: Nombre del proveedor a buscar.

    Retorna:
    - El proveedor encontrado, o null si no existe.
    */
    const nombreNormalizado = nombre.toLowerCase().trim();
    return proveedores.find(p => 
        p.nombre.toLowerCase().trim() === nombreNormalizado && p.activo === true
    ) || null;
}

export function create(datos) {
    /*
    Descripcion:
    Crea un nuevo proveedor y lo guarda en la lista.

    Parametros:
    - datos: Objeto con los datos del proveedor a crear.

    Retorna:
    - nuevo: El proveedor recien creado.
    */
    const nuevo = {
        ...datos,
        id: proveedores.length + 1,
        activo: true
    };
    proveedores.push(nuevo);
    return nuevo;
}

export function update(id, datos) {
    /*
    Descripcion:
    Actualiza un proveedor activo existente por su ID.

    Parametros:
    - id: ID del proveedor a actualizar.
    - datos: Objeto con los nuevos datos.

    Retorna:
    - El proveedor actualizado, o null si no existe.
    */
    const index = proveedores.findIndex(p => p.id === Number(id));
    if (index === -1 || proveedores[index].activo === false) {
        return null;
    }

    proveedores[index] = {
        ...proveedores[index],
        ...datos
    };
    return proveedores[index];
}

export function remove(id) {
    /*
    Descripcion:
    Realiza un borrado logico de un proveedor cambiandolo a inactivo.

    Parametros:
    - id: ID del proveedor a desactivar.

    Retorna:
    - El proveedor desactivado, o null si no existe.
    */
    const index = proveedores.findIndex(p => p.id === Number(id));
    if (index === -1 || proveedores[index].activo === false) {
        return null;
    }

    proveedores[index].activo = false;
    return proveedores[index];
}
