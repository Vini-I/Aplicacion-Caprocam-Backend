/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.dto.js
Autor: Oscar Mario Alvarez
Fecha: 29/06/2026
Modulo: proveedores
Descripcion:
Modulo de transferencia de datos dto para proveedor.
//////////////////////////////////////////////////////////
*/

/*
//////////////////////////////////////////////////////////
ENUM
//////////////////////////////////////////////////////////
*/

export const tipoProductos = Object.freeze({
    ALIMENTO: 'Alimento',
    ANTIBIOTICO: 'Antibiotico',
    FERTILIZANTES: 'Fertilizante',
    PROBIOTICOS: 'Probioticos',
    EQUIPOS: 'Equipos',
    LARVA: 'Larva',
    OTROS: 'Otros'
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class proveedorDto {
    constructor({ nombre_empresa, nombre, tipo_producto, tipoProducto, telefono, correo_electronico, correo, direccion, notas}) {
        /*
        Descripcion:
        Construye un objeto proveedorDto con los datos recibidos.
        Acepta tanto los nombres de columna DB (snake_case) como
        alias camelCase cortos, para no depender de que el
        frontend mande un formato u otro.
 
        Parametros:
        - nombre_empresa / nombre:             Nombre de la empresa (requerido).
        - tipo_producto / tipoProducto:         Tipo de producto (requerido, ENUM).
        - telefono:                             Telefono de contacto.
        - correo_electronico / correo:          Correo de contacto (opcional).
        - direccion:                            Direccion (opcional).
        - notas:                                Notas adicionales (opcional).
        */

        const nombreDb = nombre_empresa ?? nombre;
        const tipoDb   = tipo_producto ?? tipoProducto;
        const correoDb = correo_electronico ?? correo;

        this.nombre_empresa = String(nombreDb).trim();
        this.tipo_producto = String(tipoDb).trim();
        this.telefono = telefono ? String(telefono).trim() : null;
        this.correo_electronico = correo_electronico ? String(correoDb).trim() : null;
        this.direccion = direccion ? String(direccion).trim() : null;
        this.notas = notas ? String(notas).trim() : null; 
        
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function proveedorDTO(proveedor) {
    /*
    Descripcion:
    Convierte un objeto proveedor a formato DTO.

    Parametros:
    - proveedor: Objeto crudo del proveedor.

    Retorna:
    - Objeto proveedorDto formateado parta frontend o null.
    */
    if (!proveedor) return null;
    return {
        id:                 proveedor.id,
        uuid:               proveedor.uuid,
        nombreEmpresa:      proveedor.nombre_empresa,
        tipoProducto:       proveedor.tipo_producto,
        telefono:           proveedor.telefono,
        correoElectronico:  proveedor.correo_electronico,
        direccion:          proveedor.direccion,
        notas:              proveedor.notas,
        activo:             Boolean(proveedor.activo),
        fechaCreacion:      proveedor.fecha_creacion,
        fechaActualizacion: proveedor.fecha_actualizacion,
        version:            proveedor.version,        
    };
}

export function proveedoresDTO(proveedores) {
    /*
    Descripcion:
    Convierte una lista de proveedores a formato DTO.

    Parametros:
    - proveedores: Arreglo de proveedores.

    Retorna:
    - Arreglo de objetos proveedorDto formateados.
    */
    if (!proveedores) return [];
    return proveedores.map(p => proveedorDTO(p));
}