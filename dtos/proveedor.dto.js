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
    ALIMENTO: 'alimento',
    ANTIBIOTICO: 'antibiotico',
    FERTILIZANTES: 'fertilizantes',
    PROBIOTICOS: 'probioticos',
    EQUIPOS: 'equipos',
});

/*
//////////////////////////////////////////////////////////
DTO
//////////////////////////////////////////////////////////
*/

export class proveedorDto {
    constructor({ id, nombre, tipoProducto, telefono, correo, direccion, notas, iniciales }) {
        this.id = id;
        this.nombre = String(nombre).trim();
        this.tipoProducto = String(tipoProducto).trim();
        this.telefono = String(telefono).trim();
        this.correo = correo ? String(correo).trim() : null;
        this.direccion = direccion ? String(direccion).trim() : null;
        this.notas = notas ? String(notes).trim() : null;
        this.iniciales = iniciales ? String(iniciales).trim() : null;
    }
}

/*
//////////////////////////////////////////////////////////
FUNCIONES PRINCIPALES
//////////////////////////////////////////////////////////
*/

export function proveedorDTO(proveedor) {
    if (!proveedor) return null;
    return new proveedorDto(proveedor);
}

export function proveedoresDTO(proveedores) {
    if (!proveedores) return [];
    return proveedores.map(p => proveedorDTO(p));
}