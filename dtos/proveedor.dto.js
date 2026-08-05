/*
//////////////////////////////////////////////////////////
CABEZA DE ARCHIVO
//////////////////////////////////////////////////////////
Archivo: proveedor.dto.js
Autor: Joan Campos
Fecha: 4/08/2026
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
    OTROS: 'Otro'
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class proveedorDto {
    constructor({
        nombre, 
        tipoProducto, 
        telefono,
        correo, 
        direccion, 
        notas,
        creadoPorUsuarioId, 
        creadoPorColaboradorId,
    }) {
        /*
        Descripcion:
        Construye un objeto proveedorDto con los datos recibidos.
 
        Parametros:
        - nombre:             Nombre de la empresa (requerido).
        - tipoProducto:       Tipo de producto (requerido, ENUM).
        - telefono:           Telefono de contacto.
        - correo:             Correo de contacto (opcional).
        - direccion:          Direccion (opcional).
        - notas:              Notas adicionales (opcional).
        - creadoPorUsuarioId: FK a usuarios - web.
        - creadoPorColaboradorId: FK a colaboradores - movil.
        */

        this.nombre_empresa = String(nombre).trim();
        this.tipo_producto = String(tipoProducto).trim();
        this.telefono = telefono ? String(telefono).trim() : null;
        this.correo_electronico = correo ? String(correo).trim() : null;
        this.direccion = direccion ? String(direccion).trim() : null;
        this.notas = notas ? String(notas).trim() : null; 
        this.creado_por_usuario_id     = creadoPorUsuarioId     ?? null;
        this.creado_por_colaborador_id = creadoPorColaboradorId ?? null;
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
        creadoPorUsuarioId:     proveedor.creado_por_usuario_id,
        creadoPorColaboradorId: proveedor.creado_por_colaborador_id,
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